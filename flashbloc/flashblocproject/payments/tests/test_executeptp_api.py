import json
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from channelstate.models import Channel, Ledger
from channelstate.models import PtpGlobal, PtpLocal
from users.models import Account

class TestExecutePtp(APITestCase):

    def setUp(self):
        self.client = APIClient()

        #create accounts
        self.account1 = Account.objects.create(email="a@a.com", user_name="aaaa", wallet_address="aaaa", password="aaaa1234")
        self.account2 = Account.objects.create(email="b@b.com", user_name="bbbb", wallet_address="bbbb", password="bbbb1234")
        self.account3 = Account.objects.create(email="c@c.com", user_name="cccc", wallet_address="cccc", password="cccc1234")
        self.account4 = Account.objects.create(email="d@d.com", user_name="dddd", wallet_address="dddd", password="dddd1234")

        #create channels
        self.channel12 = Channel.objects.create(initiator=self.account1, recipient=self.account2, status="RQ", total_balance=Decimal.from_float(2000000000000000.0), channel_address="aaaabbbb")
        self.channel23 = Channel.objects.create(initiator=self.account2, recipient=self.account3, status="RQ", total_balance=Decimal.from_float(3000000000000000.0), channel_address="bbbcccc")
        self.channel34 = Channel.objects.create(initiator=self.account3, recipient=self.account4, status="RQ", total_balance=Decimal.from_float(4000000000000000.0), channel_address="ccccdddd")

        #create ledgers
        self.ledger12 = Ledger.objects.create(channel=self.channel12, locked_recipient_bal=Decimal.from_float(1000000000000000.0), locked_initiator_bal=Decimal.from_float(1000000000000000.0), latest_recipient_bal=Decimal.from_float(1000000000000000.0), latest_initiator_bal=Decimal.from_float(1000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))
        self.ledger23 = Ledger.objects.create(channel=self.channel23, locked_recipient_bal=Decimal.from_float(2000000000000000.0), locked_initiator_bal=Decimal.from_float(2000000000000000.0), latest_recipient_bal=Decimal.from_float(2000000000000000.0), latest_initiator_bal=Decimal.from_float(2000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))
        self.ledger34 = Ledger.objects.create(channel=self.channel34, locked_recipient_bal=Decimal.from_float(3000000000000000.0), locked_initiator_bal=Decimal.from_float(3000000000000000.0), latest_recipient_bal=Decimal.from_float(3000000000000000.0), latest_initiator_bal=Decimal.from_float(3000000000000000.0), ptp_recipient_bal=Decimal.from_float(0.0), ptp_initiator_bal=Decimal.from_float(0.0), topup_initiator_bal=Decimal.from_float(0.0), topup_recipient_bal=Decimal.from_float(0.0))

    def test_executeptp_correct(self):
        url = "/api/payments/ptp/executePtp/"

        payload = {
            "pathArray": ["aaaa", "bbbb", "cccc", "dddd"],
            "amount": "200.00",
            "origin": "aaaa",
            "destination": "dddd"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')
        data = response.data

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["status"], "PD")
        self.assertEqual(data["amount"], "190.00")
        self.assertEqual(data["origin"], "aaaa")
        self.assertEqual(data["destination"], "dddd")

        # Check if PtpGlobal and PtpLocal objects are created
        self.assertTrue(PtpGlobal.objects.filter(status="PD", amount=Decimal("190.00")).exists())
        self.assertTrue(PtpLocal.objects.filter(amount=Decimal("190.00")).exists())

        # Check ledger balance after the transaction
        updated_ledger_12 = Ledger.objects.get(channel=self.channel12)
        updated_ledger_23 = Ledger.objects.get(channel=self.channel23)
        updated_ledger_34 = Ledger.objects.get(channel=self.channel34)

        self.assertEqual(updated_ledger_12.ptp_initiator_bal, Decimal("0.00"))
        self.assertEqual(updated_ledger_12.ptp_recipient_bal, Decimal("190.00"))
        self.assertEqual(updated_ledger_23.ptp_initiator_bal, Decimal("190.00"))
        self.assertEqual(updated_ledger_23.ptp_recipient_bal, Decimal("0.00"))
        self.assertEqual(updated_ledger_34.ptp_initiator_bal, Decimal("0.00"))
        self.assertEqual(updated_ledger_34.ptp_recipient_bal, Decimal("0.00"))

    def test_executeptp_wrong_party(self):
        url = "/api/payments/ptp/executePtp/"

        payload = {
            "pathArray": ["aaaa", "bbbb", "cccc", "dddd"],
            "amount": "200.00",
            "origin": "dddd",  # Wrong party initiating the Ptp
            "destination": "dddd"
        }

        self.client.force_authenticate(self.account3)
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_executeptp_404(self):
        url = "/api/payments/ptp/executePtp/"

        payload = {
            "pathArray": ["aaaa", "bbbb", "eeee", "dddd"],  # Non-existent account 'eeee'
            "amount": "200.00",
            "origin": "aaaa",
            "destination": "dddd"
        }

        self.client.force_authenticate(self.account1)
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
