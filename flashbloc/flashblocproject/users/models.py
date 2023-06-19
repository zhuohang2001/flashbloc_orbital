from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.contrib.auth.hashers import make_password


# Create your models here.

# User.add_to_class('email', models.EmailField(null=False, blank=False))

# class Account(User):
#     wallet_address = models.CharField(max_length=300, null=False, blank=False)

class CustomAccountManager(BaseUserManager): 

    def create_superuser(self, email, user_name, wallet_address, password, **other_fields):

        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)

        if other_fields.get('is_staff') is not True:
            raise ValueError(
                'Superuser must be assigned to is_staff=True.')
        if other_fields.get('is_superuser') is not True:
            raise ValueError(
                'Superuser must be assigned to is_superuser=True.')
        
        return self.create_user(email, user_name, wallet_address, password, **other_fields)
    
    def create_user(self, email, user_name, wallet_address, password, **other_fields):

        if not email:
            raise ValueError(_('You must provide an email address'))
        
        other_fields.setdefault('is_active', True) #KIV

        email = self.normalize_email(email)
        user = self.model(email=email, user_name=user_name, 
                          wallet_address=wallet_address, **other_fields)
        user.set_password(password)
        user.is_active = True
        user.save()
        return user
    

class Account(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    user_name = models.CharField(max_length=150, unique=True)
    wallet_address = models.CharField(max_length=150, unique=True)
    start_date = models.DateTimeField(default=timezone.now)
    about = models.TextField(_(
        'about'), max_length=500, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_name', 'wallet_address']

    def __str__(self):
        return self.user_name