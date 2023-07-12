from rest_framework import serializers

# from payments.serializers import SimpleLocalTxSerializer, SimplePtpLocalSerializer
from .models import Ledger, Channel

class SimpleLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = ('locked_initiator_bal', 'locked_recipient_bal', 'latest_initiator_bal', 'ptp_initiator_bal', 'ptp_recipient_bal', 'latest_recipient_bal', 'topup_initiator_bal', 'topup_recipient_bal')

class ChannelSerializer(serializers.ModelSerializer):
    #consider whether to change initiator and recepient fields to FK?
    ledger = SimpleLedgerSerializer(many=False, read_only=True)
    class Meta:
        model = Channel
        fields = ('initiator', 'recipient', 'status', 'total_balance', 'channel_address', 'ledger')


# class LedgerSerializer(serializers.ModelSerializer):
#     channel = ChannelSerializer(many=False, read_only=True)
#     latest_tx = SimpleLocalTxSerializer(many=False, read_only=True)
#     locked_tx = SimpleLocalTxSerializer(many=False, read_only=True)
#     latest_ptp = SimplePtpLocalSerializer

#     class Meta:
#         model = Ledger
#         fields = ('channel', 'locked_tx', 'locked_recipient_bal', 'locked_initiator_bal', 'latest_tx', 'latest_recipient_bal', 'latest_initiator_bal', \
#             'latest_ptp', 'ptp_recipient_bal', 'ptp_initiator_bal', 'topup_recipient_bal', 'topup_initiator_bal')