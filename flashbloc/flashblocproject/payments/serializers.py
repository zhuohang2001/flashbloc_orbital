from rest_framework import serializers
from .models import PtpGlobal, PtpLocal, TransactionLocal, Topup_receipt

from ..users.serializers import AccountSerializer
from ..channelstate.serializers import LedgerSerializer



class PtpGlobalSerializer(serializers.ModelSerializer):
    #can i use 2 same serializers?
    origin = AccountSerializer(read_only=True, many=False)
    destination = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = PtpGlobal
        fields = ('path_array', 'amount', 'origin', 'destination', 'status')


class LocalTxSerializer(serializers.ModelSerializer):
    ledger = LedgerSerializer(read_only=True, many=False)
    receiver = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = TransactionLocal
        fields = ('ledger', 'amount', 'status', 'receiver', 'local_nonce')


class SimpleLocalTxSerializer(serializers.ModelSerializer):
    receiver = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = TransactionLocal
        fields = ('amount', 'status', 'receiver', 'local_nonce')


class TopUpSerializer(serializers.ModelSerializer):
    ledger = LedgerSerializer(read_only=True, many=False)
    sender = AccountSerializer(read_only=True, many=False)
    class Meta:
        model = Topup_receipt
        fields = ('ledger', 'sender', 'local_nonce')


class PtpLocalSerializer(serializers.ModelSerializer):
    ledger = LedgerSerializer(read_only=True, many=False)
    sender = AccountSerializer(read_only=True, many=False)
    payment_id = PtpGlobalSerializer(many=False, read_only=True)
    class Meta:
        model = PtpLocal
        fields = ('ledger', 'amount', 'status', 'sender', 'local_nonce', 'payment_id', 'ptp_bonus')


class SimplePtpLocalSerializer(serializers.ModelSerializer):
    sender = AccountSerializer(read_only=True, many=False)
    payment_id = PtpGlobalSerializer(many=False, read_only=True)
    class Meta:
        model = PtpLocal
        fields = ('amount', 'status', 'sender', 'local_nonce', 'payment_id', 'ptp_bonus')