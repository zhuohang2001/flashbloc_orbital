from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.forms import CharField
from users.models import Account
from django.conf import settings
from decimal import Decimal


class PtpGlobal(models.Model):
    STATUS_CHOICES = [
        ("PD", "PENDING"), 
        ("SS", "SUCCESS"), 
        ("FL", "FAILED"), 
    ]

    #path array is array of address of ptp
    path_array = ArrayField(
        models.CharField(max_length=300, blank=True, null=True)
    , default=list)
    ptp_global_id = models.AutoField(primary_key=True)
    amount = models.DecimalField(decimal_places=1, null=True, blank=True, max_digits=19, default=Decimal.from_float(0.0))
    origin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="accountFrom")
    destination = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="AddressTo")
    status = models.CharField(null=True, blank=True, choices=STATUS_CHOICES, max_length=50) #how do i create pk


class TransactionLocal(models.Model):
    STATUS_CHOICES = [
        ("PD", "PENDING"), 
        ("SS", "SUCCESS"), 
        ("FL", "FAILED"),  #check this
    ]
    transaction_local_id = models.AutoField(primary_key=True)
    ledger = models.ForeignKey('channelstate.Ledger', on_delete=models.CASCADE)
    amount = models.DecimalField(decimal_places=1, null=True, blank=True, max_digits=19, default=Decimal.from_float(0.0))
    status = models.CharField(null=True, blank=True, choices=STATUS_CHOICES, max_length=50)
    sender_sig = models.CharField(max_length=300, blank=True, null=True)
    receiver_sig = models.CharField(max_length=300, blank=True, null=True)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    local_nonce = models.IntegerField(null=True, blank=True)


class PtpLocal(models.Model):
    STATUS_CHOICES = [
        ("PD", "PENDING"), 
        ("SS", "SUCCESS"), 
        ("FL", "FAILED"), 
    ]
    ptp_local_id = models.AutoField(primary_key=True)
    ledger = models.ForeignKey('channelstate.Ledger', on_delete=models.CASCADE)
    amount = models.DecimalField(decimal_places=1, null=True, blank=True, max_digits=19, default=Decimal.from_float(0.0))
    status = models.CharField(null=True, blank=True, choices=STATUS_CHOICES, max_length=50)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    local_nonce = models.IntegerField(null=True, blank=True)
    payment_id = models.ForeignKey(PtpGlobal, null=True, blank=True, on_delete=models.CASCADE)
    ptp_bonus = models.DecimalField(decimal_places=1, null=True, blank=True, max_digits=19, default=Decimal.from_float(0.0))


class TopupReceipt(models.Model):
    topup_receipt_id = models.AutoField(primary_key=True)
    ledger = models.ForeignKey('channelstate.Ledger', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    local_nonce = models.IntegerField(null=True, blank=True)
    amount = models.DecimalField(decimal_places=1, null=True, blank=True, max_digits=19, default=Decimal.from_float(0.0))
