from rest_framework import serializers
from .models import PtpGlobal, PtpLocal, TransactionLocal, TopupReceipt
from channelstate.models import Ledger

from users.serializers import AccountSerializer
from channelstate.serializers import SimpleLedgerSerializer, ChannelSerializer

# try:
#     from .serializers import LedgerSerializer
# except ImportError:
#     import sys
#     LedgerSerializer = sys.modules[__package__ + '.LedgerSerializer']


class PtpGlobalSerializer(serializers.ModelSerializer):
    #can i use 2 same serializers?
    origin = AccountSerializer(read_only=True, many=False)
    destination = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = PtpGlobal
        fields = ('path_array', 'amount', 'origin', 'destination', 'status')


class SimplePtpLocalSerializer(serializers.ModelSerializer):
    sender = AccountSerializer(read_only=True, many=False)
    payment_id = PtpGlobalSerializer(many=False, read_only=True)
    class Meta:
        model = PtpLocal
        fields = ('amount', 'status', 'sender', 'local_nonce', 'payment_id', 'ptp_bonus')


class SimpleLocalTxSerializer(serializers.ModelSerializer):
    receiver = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = TransactionLocal
        fields = ('amount', 'status', 'receiver', 'local_nonce')


class LedgerSerializer(serializers.ModelSerializer):
    channel = ChannelSerializer(many=False, read_only=True)
    latest_tx = SimpleLocalTxSerializer(many=False, read_only=True)
    locked_tx = SimpleLocalTxSerializer(many=False, read_only=True)
    latest_ptp = SimplePtpLocalSerializer

    class Meta:
        model = Ledger
        fields = ('channel', 'locked_tx', 'locked_recipient_bal', 'locked_initiator_bal', 'latest_tx', 'latest_recipient_bal', 'latest_initiator_bal', \
            'latest_ptp', 'ptp_recipient_bal', 'ptp_initiator_bal', 'topup_recipient_bal', 'topup_initiator_bal')
        

class TopUpSerializer(serializers.ModelSerializer):
    ledger = LedgerSerializer(read_only=True, many=False)
    sender = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = TopupReceipt
        fields = ('ledger', 'sender', 'local_nonce')


class PtpLocalSerializer(serializers.ModelSerializer):
    ledger = LedgerSerializer(read_only=True, many=False)
    sender = AccountSerializer(read_only=True, many=False)
    payment_id = PtpGlobalSerializer(many=False, read_only=True)
    class Meta:
        model = PtpLocal
        fields = ('ledger', 'amount', 'status', 'sender', 'local_nonce', 'payment_id', 'ptp_bonus')



class LocalTxSerializer(serializers.ModelSerializer):
    ledger = LedgerSerializer(read_only=True, many=False)
    receiver = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = TransactionLocal
        fields = ('ledger', 'amount', 'status', 'receiver', 'local_nonce')

