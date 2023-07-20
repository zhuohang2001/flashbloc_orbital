from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from ..
from users.models import Account
import json
import requests
from requests.exceptions import Timeout
from decimal import Decimal


class TestGetUserchannels(APITestCase):
    '''
    response = [
        {
            "initiator": "aaaa", 
            "recipient": "bbbb", 
            "status": "INIT", 
            "total_balance": "2000000000000000.0", 
            "channel_address": "aaaabbbb", 
            "ledger": {
                "locked_initiator_bal": "1000000000000000.0", 
                "locked_recipient_bal": "1000000000000000.0", 
                "topup_initiator_bal": "1000000000000000.0", 
                "topup_recipient_bal": "1000000000000000.0"
            }
        }
    ]
    '''

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account1 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")

        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="INIT", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")

        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))
    
    def test_get_user_merchant_correct(self):
        url = "/api/channelstate/get_userChannels/walletAddress=aaaa"

        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')
        data = response[0]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data.get("initiator"), "aaaa")
        self.assertEqual(data.get("recipient"), "bbbb")
        self.assertEqual(data.get("status"), "INIT")
        self.assertEqual(data.get("total_balance"), "2000000000000000.0")
        self.assertEqual(data.get("channel_address"), "aaaabbbb")
        self.assertEqual(data.get("ledger")["locked_initiator_bal"], "1000000000000000.0")
        print(response)
    

    def test_get_user_merchant_404(self):
        url = "/api/channelstate/get_userChannels/walletAddress=xxxx"

        self.client.force_authenticate(self.account1)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print(response)