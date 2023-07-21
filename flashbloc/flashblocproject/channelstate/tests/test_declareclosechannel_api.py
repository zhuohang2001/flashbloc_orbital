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


class testDeclareCloseChannel(APITestCase):

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")

        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="INIT", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")

        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))

        #create tx
        self.tx12 = TransactionLocal.objects.create(ledger=self.ledger12, amount=Decimal.from_float(2000000000000000.0), sender_sig='aaaa_sign', receiver=self.account2, local_nonce=1)
        
        self.ledger12.latest_tx  = self.tx12
        self.ledger12.locked_tx = self.tx12
        self.ledger12.save()

    def test_declareclosechannel_correct(self):
        url="/api/channelstate/declareCloseChannel/"

        payload = {
            "channelAddress": "aaaabbbb", 
            "currAddress": "aaaa"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')
        data = json.loads(response.data)
        print("RESPONSE DATA", data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["sig_initiator"], "aaaa_sign")
        self.assertEqual(data["sig_recipient"], "bbbb_sign")
        self.assertEqual(data["bal_initiator"], 1000000000000000.0)
        self.assertEqual(data["bal_recipient"], 1000000000000000.0)

        tempChannel = Channel.objects.get(channel_address="aaaabbbb")
        tempLedger = Ledger.objects.get(channel=tempChannel)
        tempTx = TransactionLocal.objects.get(ledger=tempLedger)

        self.assertEqual(tempChannel.total_balance, Decimal.from_float(2000000000000000.0))
        self.assertEqual(tempChannel.status, "LK")
        self.assertEqual(tempLedger.latest_initiator_bal, Decimal.from_float(1000000000000000.0))
        self.assertEqual(tempTx.receiver_sig, "bbbb_sign")
        self.assertEqual(tempLedger.locked_tx, tempTx)
        self.assertEqual(tempChannel.closed_by, self.account2)

    def test_declareclosechannel_400(self):
        url="/api/channelstate/declareCloseChannel/"

        payload = {
            "channelAddress": "xxxx", 
            "currAddress": "aaaa"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_declareclosechannel_400(self):
        url="/api/channelstate/declareCloseChannel"

        payload = {
            "channelAddress": "aaaabbbb", 
            "currAddress": "aaaa"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_301_MOVED_PERMANENTLY)