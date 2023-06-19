from django.forms import ModelForm
from .models import Account

class EmailForm(ModelForm):
    class Meta:
        model = Account
        fields = ('email', 'user_name', 'wallet_address', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    