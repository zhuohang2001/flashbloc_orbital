from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from ..models import Channel, Ledger
from users.models import Account
from payments.models import TransactionLocal
import json
import requests
from requests.exceptions import Timeout
from decimal import Decimal
import pandas as pd

class TestGetLatestTx(APITestCase):

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")

        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="OP", total_balance=Decimal.from_float(2000000000000200.0), channel_address="aaaabbbb")

        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(-100.0), ptp_initiator_bal=Decimal.from_float(100.0), topup_initiator_bal=Decimal.from_float(100.0), topup_recipient_bal=Decimal.from_float(100.0))

        #create tx
        self.tx12 = TransactionLocal.objects.create(ledger=self.ledger12, amount=Decimal.from_float(2000000000000000.0), sender_sig='aaaa_sign', receiver=self.account2, local_nonce=1)

        self.ledger12.latest_tx  = self.tx12
        self.ledger12.locked_tx = self.tx12
        self.ledger12.save()

    def test_getlatesttx_correct(self):
        url="/api/channelstate/getLatestTx/?currAddress=aaaa&channelAddress=aaaabbbb"

        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')
        data = json.loads(response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["result"], "sign here")
        self.assertEqual(data["channelAddress"], "aaaabbbb")
        self.assertEqual(data["initBal"], 1000000000000200)
        self.assertEqual(data["recpBal"], 1000000000000000)
        self.assertEqual(data["initLkBal"], 1000000000000000)
        self.assertEqual(data["recpLkBal"], 1000000000000000)
        self.assertEqual(data["latestNonce"], 1)
        self.assertEqual(data["lockedNonce"], 1)

    def test_getlatesttx_400(self):
        url="/api/channelstate/getLatestTx/?currAddress=aaaa&channelAddress=xxxx"

        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_getlatesttx_no_params(self): 
        url="/api/channelstate/getLatestTx/"

        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_getlatesttx_301(self): 
        url="/api/channelstate/getLatestTx"

        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_301_MOVED_PERMANENTLY)