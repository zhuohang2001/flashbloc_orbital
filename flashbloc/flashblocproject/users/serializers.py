from rest_framework import serializers
from .models import Account
# from users.models import Account
from django.contrib.auth.hashers import make_password


# class AccountSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Account
#         fields = ('id', 'walletAddress', 'email')

class AccountSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    user_name = serializers.CharField(required=True)
    wallet_address = serializers.CharField(required=True)

    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = Account
        fields = ('email', 'user_name', 'wallet_address', 'password')
        # extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data): 
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data) #is wallet address needed?
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
    
    # def validate_password(self, value: str) -> str:
    #     """
    #     Hash value passed by user.

    #     :param value: password of a user
    #     :return: a hashed version of the password
    #     """
    #     return make_password(value)