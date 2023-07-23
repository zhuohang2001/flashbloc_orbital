from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from ..models import Channel, Ledger
from users.models import Account
import json
import requests
from requests.exceptions import Timeout
from decimal import Decimal
import pandas as pd


class TestGetTargetChannel(APITestCase):
    # response =         {
    #         "initiator": "aaaa", 
    #         "recipient": "bbbb", 
    #         "status": "INIT", 
    #         "total_balance": "2000000000000000.0", 
    #         "channel_address": "aaaabbbb", 
    #         "ledger": {
    #             "locked_initiator_bal": "1000000000000000.0", 
    #             "locked_recipient_bal": "1000000000000000.0", 
    #             "topup_initiator_bal": "1000000000000000.0", 
    #             "topup_recipient_bal": "1000000000000000.0"
    #         }
    #     }

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")
        self.account3 = Account.objects.create(email="c@c.com", user_name="cccc", wallet_address="cccc", password="cccc1234")


        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="INIT", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")
        self.channel13 = Channel.objects.create(initiator=self.account1, recipient=self.account3, status="INIT", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaacccc")


        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))
        self.ledger13 = Ledger.objects.create(channel=self.channel13, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))
    
    def test_get_targetchannel_correct(self):
        url = "/api/channelstate/get_targetChannel/?currAddress=aaaa&q=bbbb"
        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')
        data = response.data
        s = pd.Series(data)


        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(s["initiator"], "aaaa")
        self.assertEqual(s["recipient"], "bbbb")
        self.assertEqual(s["status"], "INIT")
        self.assertEqual(s["total_balance"], "2000000000000000.0")
        self.assertEqual(s["channel_address"], "aaaabbbb")
        self.assertEqual(s["ledger"]["locked_initiator_bal"], "1000000000000000.0")

    def test_get_targetchannel_404(self):
        url = "/api/channelstate/get_targetChannels/?currAddress=xxxx"

        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        print(response.data, "third response")