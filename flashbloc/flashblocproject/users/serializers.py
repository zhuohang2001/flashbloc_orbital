from rest_framework import serializers
from .models import Account
# from users.models import Account

# class AccountSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Account
#         fields = ('id', 'walletAddress', 'email')

class customUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    user_name = serializers.CharField(required=True)
    wallet_address = serializers.CharField(required=True)

    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = Account
        fields = ('email', 'user_name', 'wallet_address', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data): 
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data) #is wallet address needed?
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance