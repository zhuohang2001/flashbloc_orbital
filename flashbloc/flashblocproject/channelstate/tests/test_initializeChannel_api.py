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


class testInitializeChannel(APITestCase):

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")

        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="OP", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")

        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))

        #create tx
        self.tx12 = TransactionLocal.objects.create(ledger=self.ledger12, amount=Decimal.from_float(2000000000000000.0), sender_sig='aaaa_sign', receiver=self.account2, local_nonce=1)
        
        self.ledger12.latest_tx  = self.tx12
        self.ledger12.save()

    def test_initializechannel_correct(self):
        url="/api/channelstate/initializeChannel/"

        payload = {
            "currAddress": "bbbb", 
            "targetAddress": "aaaa", 
            "channelAddress": "aaaabbbb", 
            "recipientSignature": "bbbb_sign", 
            "recipientBalance": 1000000000000000.0
        }

        self.client.force_authenticate(self.account2)
        response = self.client.patch(url, payload, format='json')
        data = response.data

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["initiator"], "aaaa")
        self.assertEqual(data["recipient"], "bbbb")
        self.assertEqual(data["status"], "INIT")
        self.assertEqual(data["total_balance"], "2000000000000000.0")
        self.assertEqual(data["channel_address"], "aaaabbbb")
        self.assertEqual(data["ledger"]["latest_initiator_bal"], "1000000000000000.0")

        tempChannel = Channel.objects.get(channel_address="aaaabbbb")
        tempLedger = Ledger.objects.get(channel=tempChannel)
        tempTx = TransactionLocal.objects.get(ledger=tempLedger)

        self.assertEqual(tempChannel.total_balance, Decimal.from_float(2000000000000000.0))
        self.assertEqual(tempChannel.status, "INIT")
        self.assertEqual(tempLedger.latest_initiator_bal, Decimal.from_float(1000000000000000.0))
        self.assertEqual(tempTx.receiver_sig, "bbbb_sign")
        self.assertEqual(tempLedger.locked_tx, tempTx)

    def test_initializechannel_400(self):
        url="/api/channelstate/initializeChannel/"

        payload = {
            "currAddress": "aaaa", 
            "targetAddress": "bbbb", 
            "channelAddress": "aaaabbbb", 
            "recipientSignature": "bbbb_sign", 
            "recipientBalance": 1000000000000000.0
        }

        self.client.force_authenticate(self.account2)
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_initializechannel_301(self):
        url="/api/channelstate/initializeChanne"

        payload = {
            "currAddress": "aaaa", 
            "targetAddress": "bbbb", 
            "channelAddress": "aaaabbbb", 
            "recipientSignature": "bbbb_sign", 
            "recipientBalance": 1000000000000000.0
        }

        self.client.force_authenticate(self.account2)
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_301_MOVED_PERMANENTLY)
