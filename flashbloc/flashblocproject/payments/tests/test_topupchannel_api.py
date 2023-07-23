from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from channelstate.models import Channel, Ledger
from users.models import Account
import json
import requests
from requests.exceptions import Timeout
from decimal import Decimal
import pandas as pd

# User = get_user_model()

class TestTopUpChannel(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Create accounts
        self.account1 = Account.objects.create_user(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create_user(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")

        # Create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="INIT", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")

        # Create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))

    def test_topupchannel_correct(self):
        url = "/api/payments/topup/topUpChannel/"

        payload = {
            "currAddress": "aaaa",
            "targetAddress": "bbbb",
            "amount": "1000000000000000.0"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')
        data = response.data

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["result"], "success")
        self.assertEqual(data["topup_receipt"]["local_nonce"], 0)
        self.assertEqual(data["topup_receipt"]["sender"]["email"], "a@a.com")
        self.assertEqual(data["topup_receipt"]["ledger"]["channel"]["initiator"], self.ledger12.channel.initiator.user_name)

        # Retrieve updated ledger and check balances
        updated_ledger = Ledger.objects.get(pk=self.ledger12.channel_id)
        self.assertEqual(updated_ledger.ptp_initiator_bal, Decimal.from_float(1000000000000000.0))
        self.assertEqual(updated_ledger.ptp_recipient_bal, Decimal.from_float(0.0))

    def test_topupchannel_more_correct(self):
        url = "/api/payments/topup/topUpChannel/"
        payload = {
            "currAddress": "bbbb", 
            "targetAddress": "aaaa",
            "amount": "5000000000000000.0"  
        }
        self.client.force_authenticate(self.account2)  
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["result"], "success")

        updated_ledger = Ledger.objects.get(pk=self.ledger12.channel_id)
        self.assertEqual(updated_ledger.ptp_initiator_bal, Decimal.from_float(0.0))
        self.assertEqual(updated_ledger.ptp_recipient_bal, Decimal.from_float(5000000000000000.0))
        # self.assertEqual(updated_ledger.channel.total_balance, Decimal.from_float(7000000000000000.0))

    def test_topupchannel_channel_not_exist(self):
        # Test the case where the specified channel does not exist
        url = "/api/payments/topup/topUpChannel/"
        payload = {
            "currAddress": "aaaa",
            "targetAddress": "cccc",  # Non-existent target address
            "amount": "5000000000000000.0"
        }
        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
