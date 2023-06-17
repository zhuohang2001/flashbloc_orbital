from django.shortcuts import render

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import customUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, generics, mixins, views, status, renderers
from rest_framework.decorators import action
from verify_email.email_handler import send_verification_email

from .forms import EmailForm
from .models import Account

class GetUpdateViewSet(mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.ListModelMixin,
                       viewsets.GenericViewSet):
    pass

class CustomUserCreate(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format='json'):
        serializer = customUserSerializer(data=request.data)
        
        if serializer.is_valid():
            form = EmailForm(request.data)
            inactive_user = send_verification_email(request, form) #KIV do i set user as inactive?
            # user = serializer.save()
            if inactive_user:
                json = serializer.data
                return Response(json, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class BlacklistTokenUpdateView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)

        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
            

class accountView(GetUpdateViewSet):
    permission_classes = [AllowAny] 
    serializer_class = customUserSerializer
    queryset = Account.objects.all()

    @action(detail=False, methods=["get"])
    def get_currentLoginAccount(self, request, email=None):
        try:
            # result = []
            curr_user = Account.objects.filter(email=email).first()
            result = self.get_serializer(curr_user, many=False).data
            return Response(result, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(e.args, status=status.HTTP_404_NOT_FOUND)