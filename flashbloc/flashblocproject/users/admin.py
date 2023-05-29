from django.contrib import admin
from users.models import Account
from django.contrib.auth.admin import UserAdmin
from django.forms import TextInput, Textarea, CharField
from django import forms
from django.db import models

# Register your models here.

class UserAdminConfig(UserAdmin):
    model = Account
    search_fields = ('email', 'user_name', 'wallet_address')
    list_filter = ('email', 'user_name', 'wallet_address', 'is_active', 'is_staff')
    ordering = ('start_date',)
    list_display = ('email', 'user_name', 'wallet_address', 
                    'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'user_name', 'wallet_address',)}), 
        ('Permissions', {'fields': ('is_staff', 'is_active')}), 
        ('Personal', {'fields': ('about',)}),
    )

    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 20, 'cols': 60})}, 
    }

    add_fieldsets = (
        (None, {
            'classes': ('wide',), 
            'fields': ('email', 'user_name', 'wallet_address', 'password1', 'password2', 'is_active', 'is_staff')}
        ), 
    )


admin.site.register(Account, UserAdminConfig)
