from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from payments.models import TransactionLocal
from channelstate.models import Channel, Ledger
from users.models import Account
import json
import requests
from requests.exceptions import Timeout
from decimal import Decimal
import pandas as pd

class TestExecuteTxLocal(APITestCase):

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")

        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="INIT", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")

        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))
    
    def test_valid_transaction(self):
        url ="/api/payments/local/executeTxLocal/"

        payload = {
            "sender_sig": "signature",
            "amount": "1000000000000000.0",
            "currAddress": "aaaa",
            "targetAddress": "bbbb"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')
        print("RETURN DICT", response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertEqual(data['status'], "SS")
        # self.assertEqual(data['amount'], 1000000000000000.0)

        # Check if the ledger balances are updated correctly
        updated_ledger = Ledger.objects.get(channel=self.channel12)
        self.assertEqual(updated_ledger.latest_recipient_bal, Decimal('2000000000000000.0'))
        self.assertEqual(updated_ledger.latest_initiator_bal, Decimal('0.0'))

        # Check if the transaction instance is created
        self.assertTrue(TransactionLocal.objects.filter(sender_sig="signature").exists())

    def test_invalid_amount(self):
        url = "/api/payments/local/executeTxLocal/"

        payload = {
            "sender_sig": "signature",
            "amount": "-1000000000000000.0",  # Negative amount should be invalid
            "currAddress": "aaaa",
            "targetAddress": "bbbb"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')
        data = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(data['error'], "invalid amount: needs to be more than 0")

        # Check if the ledger balances remain unchanged
        updated_ledger = Ledger.objects.get(channel=self.channel12)
        self.assertEqual(updated_ledger.latest_initiator_bal, Decimal('1000000000000000.0'))
        self.assertEqual(updated_ledger.latest_recipient_bal, Decimal('1000000000000000.0'))

        # Check that the transaction instance is not created
        self.assertFalse(TransactionLocal.objects.filter(sender_sig="signature").exists())

    def test_channel_does_not_exist(self):
        url = "/api/payments/local/executeTxLocal/"

        payload = {
            "sender_sig": "signature",
            "amount": "1000000000000000.0",
            "currAddress": "cccc",  # Account cccc doesn't have a channel with bbbb
            "targetAddress": "bbbb"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')
        # data = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        # self.assertEqual(data['error'], "tx instance not created")

        # Check that the ledger balances remain unchanged
        updated_ledger = Ledger.objects.get(channel=self.channel12)
        self.assertEqual(updated_ledger.latest_initiator_bal, Decimal('1000000000000000.0'))
        self.assertEqual(updated_ledger.latest_recipient_bal, Decimal('1000000000000000.0'))

        # Check that the transaction instance is not created
        self.assertFalse(TransactionLocal.objects.filter(sender_sig="signature").exists())
