from django.db import models
from payments.models import TransactionLocal, PtpLocal
from users.models import Account
from django.conf import settings
# Create your models here.

class Channel(models.Model):
    STATUS_CHOICES = [
        ("OP", "OPENED"), 
        ("INIT", "INITIATED"), 
        ("LK", "LOCKED"), 
        ("CD", "CLOSED"), 
    ]
    initiator = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="initiator") #do i need related name?
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="recipient")
    status = models.CharField(null=True, blank=True, choices=STATUS_CHOICES, max_length=50)
    total_balance = models.DecimalField(decimal_places=17, blank=True, null=True, max_digits=19)
    channel_address = models.CharField(max_length=200, blank=True, primary_key=True)
    status_expiry = models.DateTimeField(null=True, blank=True) 


class Ledger(models.Model):
    channel = models.OneToOneField(Channel, blank=True, on_delete=models.CASCADE, primary_key=True)
    locked_tx = models.ForeignKey(TransactionLocal, null=True, blank=True, on_delete=models.CASCADE, related_name="lockedTx")
    locked_recipient_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
    locked_initiator_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
    latest_tx = models.ForeignKey(TransactionLocal, null=True, blank=True, on_delete=models.CASCADE, related_name="latestTx")
    latest_recipient_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
    latest_initiator_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
    latest_ptp = models.ForeignKey(PtpLocal, null=True, blank=True, on_delete=models.CASCADE, related_name="latestPtp")
    ptp_recipient_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
    ptp_initiator_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
    topup_recipient_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
    topup_initiator_bal = models.DecimalField(decimal_places=17, null=True, blank=True, max_digits=19)
