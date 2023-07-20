from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from ..models import Channel, Ledger
from payments.models import TransactionLocal
from users.models import Account
import json
import requests
from requests.exceptions import Timeout
from decimal import Decimal
import pandas as pd


class TestApproveChannel(APITestCase):

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")

        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="APV", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")

        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))

    def test_createchannel_correct(self):
        url="/api/channelstate/createChannel/"

        payload={
            "currAddress": "aaaa", 
            "targetAddress": "bbbb", 
            "channelAddress": "new_aaaabbbb",
            "initiatorSignature": "signature"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.patch(url, payload, format='json')
        data = response.data

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["initiator"], "aaaa")
        self.assertEqual(data["recipient"], "bbbb")
        self.assertEqual(data["status"], "OP")
        self.assertEqual(data["total_balance"], "2000000000000000.0")
        self.assertEqual(data["channel_address"], "newaaaabbbb")
        self.assertEqual(data["ledger"]["latest_initiator_bal"], "1000000000000000.0")

        tempChannel = Channel.objects.get(channel_address="newaaaabbbb")
        tempLedger = Ledger.objects.get(channel=tempChannel)
        tempTx = TransactionLocal(ledger=tempLedger)

        self.assertEqual(tempChannel.total_balance, Decimal.from_float(2000000000000000.0))
        self.assertEqual(tempChannel.status, "OP")
        self.assertEqual(tempLedger.latest_initiator_bal, Decimal.from_float(1000000000000000.0))
        self.assertEqual(tempTx.sender_sig, "signature")

    def test_createchannel_400(self):
        url="/api/channelstate/createChannel/"

        payload={
            "currAddress": "bbbb", 
            "targetAddress": "aaaa", 
            "channelAddress": "new_aaaabbbb",
            "initiatorSignature": "signature"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.patch(url, payload, format='json')
        data = response.data

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_createchannel_404(self):
        url="/api/channelstate/createChannel/"

        payload={
            "currAddress": "aaaa", 
            "targetAddress": "bbbb", 
            "channelAddress": "new_aaaabbbb",
            "initiatorSignature": "signature"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.patch(url, payload, format='json')
        data = response.data

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)