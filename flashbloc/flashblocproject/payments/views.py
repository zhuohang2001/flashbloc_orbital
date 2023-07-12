import json
from django.http import HttpResponse
from decimal import Decimal

from django.shortcuts import render
# Create your views here.
from rest_framework import viewsets, generics, mixins, views, status, renderers
from rest_framework.generics import get_object_or_404
from django.db.models import Q, Max, Min
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from . import models
from users.models import Account
from channelstate.models import Ledger, Channel
from . import serializers

'''
Ptp viewset (ptpglobal serializer)
1. execute ptp

Local payment viewset (local TxSerializer)
2. execute Txlocal

topup viewset
1. topUpChannel (topup Serializer)
'''

class GetUpdateViewSet(mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.ListModelMixin,
                       viewsets.GenericViewSet):
    pass

class PtpPaymentsViewSet(GetUpdateViewSet):
    serializer_class = serializers.PtpGlobalSerializer

    @action(detail=False, methods=['POST'])
    def executePtp(self, request, *args, **kwargs):
        try:
            data = self.request.data
            path_array = data.get('pathArray')
            init_array = path_array.copy()
            amount_total = float(data.get('amount'))
            amount_deposited = amount_total * 95/100
            merchant_settlement = amount_total * 5/100
            origin = Account.objects.get(wallet_address=data.get('origin'))
            destination = Account.objects.get(wallet_address=data.get('destination'))
            init_filter = Q(status="INIT") #is this correct?

            ptp_global = models.PtpGlobal(status="PD", path_array=path_array, amount=Decimal.from_float(amount_deposited), origin=origin, destination=destination)
            ptp_global.save() #should this block be within transaction.atomic
            local_ptp_lst = []
            
            # with transaction.atomic():
            per_intemediary_benefits = merchant_settlement / float(len(path_array))
            arr_length = int(len(path_array))
            for idx in range(1, arr_length, 1):
                print(idx, arr_length)
                tar_channel_r = Channel.objects.filter(init_filter, initiator=Account.objects.get(wallet_address=str(path_array[idx-1])), recipient=Account.objects.get(wallet_address=str(path_array[idx]))).first()
                tar_channel_i = Channel.objects.filter(init_filter, recipient=Account.objects.get(wallet_address=str(path_array[idx-1])), initiator=Account.objects.get(wallet_address=str(path_array[idx]))).first()
                if tar_channel_r:
                    tar_channel = tar_channel_r
                    tar_ledger = tar_channel.ledger #tx.atomic? referencing another obj tt is queried within block
                    new_nonce = models.TransactionLocal.objects.filter(ledger=tar_ledger).count()
                    # local_ptp = models.PtpLocal(ledger=tar_ledger, amount=Decimal.from_float(amount_deposited), ptp_bonus=Decimal.from_float(per_intemediary_benefits), payment_id=ptp_global, \
                    #                             local_nonce=int(new_nonce))
                    local_ptp = models.PtpLocal(ledger=tar_ledger, amount=Decimal.from_float(amount_deposited), payment_id=ptp_global, \
                                                local_nonce=int(new_nonce))
                    local_ptp.save()
                    local_ptp_lst.append(local_ptp_lst)

                    if idx == 1:
                        initiator_bal_delta = -float(amount_total) + float(per_intemediary_benefits/2.0)
                        recipient_bal_delta = float(amount_deposited) + float(per_intemediary_benefits/2.0)
                    
                    else:
                        initiator_bal_delta = -float(amount_deposited) + float(per_intemediary_benefits/2.0)
                        recipient_bal_delta = float(amount_deposited) + float(per_intemediary_benefits/2.0)

                    tar_ledger.ptp_initiator_bal += Decimal.from_float(initiator_bal_delta)
                    tar_ledger.ptp_recipient_bal += Decimal.from_float(recipient_bal_delta)
                    tar_ledger.save()
                    tar_channel.total_balance += Decimal.from_float(per_intemediary_benefits)
                    tar_channel.save()

                elif tar_channel_i:
                    tar_channel = tar_channel_i
                    tar_ledger = tar_channel.ledger
                    new_nonce = models.TransactionLocal.objects.filter(ledger=tar_ledger).count()
                    # local_ptp = models.PtpLocal(ledger=tar_ledger, amount=Decimal.from_float(amount_deposited), ptp_bonus=Decimal.from_float(per_intemediary_benefits), payment_id=ptp_global, \
                    #     local_nonce=int(new_nonce))
                    local_ptp = models.PtpLocal(ledger=tar_ledger, amount=Decimal.from_float(amount_deposited), payment_id=ptp_global, \
                        local_nonce=int(new_nonce))
                    local_ptp.save()
                    local_ptp_lst.append(local_ptp_lst)

                    if idx == 1:
                        recipient_bal_delta = -float(amount_total) + float(per_intemediary_benefits/2.0)
                        initiator_bal_delta = float(amount_deposited) + float(per_intemediary_benefits/2.0)
                    
                    else:
                        recipient_bal_delta = -float(amount_deposited) + float(per_intemediary_benefits/2.0)
                        initiator_bal_delta = float(amount_deposited) + float(per_intemediary_benefits/2.0)

                    tar_ledger.ptp_initiator_bal += Decimal.from_float(initiator_bal_delta)
                    tar_ledger.ptp_recipient_bal += Decimal.from_float(recipient_bal_delta)
                    tar_ledger.save()
                    tar_channel.total_balance += Decimal.from_float(per_intemediary_benefits)
                    tar_channel.save()                



            if not path_array:
                ptp_global.path_array = path_array
                ptp_global.status = "SS"

            elif path_array != init_array:
                ptp_global.path_array = path_array
                ptp_global.status = "FL"
        
            else:
                ptp_global.status = "FL"

            ptp_global.save()
            result = self.get_serializer(ptp_global, many=False).data

            # if result.is_valid():
            return Response(result, status=status.HTTP_200_OK) 



        except Exception as e:
            return Response(e.args, status=status.HTTP_404_NOT_FOUND)


class LocalPaymentsViewSet(GetUpdateViewSet):
    serializer_class = serializers.LocalTxSerializer
    queryset = models.TransactionLocal.objects.all()

    @action(detail=False, methods=['POST'])
    def executeTxLocal(self, request, *args, **kwargs):
        try:
            data = self.request.data
            sender_sig = str(data.get('sender_sig'))
            # receiver_sig = str(data.get('receiver_sig'))
            amount = float(data.get('amount'))
            if amount < float(0):
                msg = json.dumps({
                "error": "invalid amount: needs to be more than 0"
            })
                return Response(msg, status=status.HTTP_200_OK)

            currAddress = str(data.get('currAddress'))
            targetAddress = str(data.get('targetAddress'))
            init_filter = (Q(status="INIT")) #is this correct?

            curr_acc = Account.objects.get(wallet_address=currAddress)
            tar_acc = Account.objects.get(wallet_address=targetAddress)
            new_nonce = -1

            with transaction.atomic(): #gota check if temporary diff ptp due to signature will cause contract to break
                if Channel.objects.filter(init_filter, Q(initiator=curr_acc, recipient=tar_acc) | Q(initiator=tar_acc, recipient=curr_acc)).exists():
                    tar_channel = Channel.objects.filter(init_filter, Q(initiator=curr_acc, recipient=tar_acc) | Q(initiator=tar_acc, recipient=curr_acc)).first()
                    tar_ledger = tar_channel.ledger
                    new_nonce = models.TransactionLocal.objects.filter(ledger=tar_ledger).count() + 1
                    if tar_channel.initiator == curr_acc:
                        new_transaction = models.TransactionLocal(ledger=tar_ledger, local_nonce=int(new_nonce), sender_sig=sender_sig, \
                        receiver=tar_acc, amount=amount, status="SS")
                        sender_amt = amount - float(tar_ledger.ptp_initiator_bal) - float(tar_ledger.topup_initiator_bal)
                        tar_ledger.ptp_initiator_bal = Decimal.from_float(float(0))
                        tar_ledger.topup_initiator_bal = Decimal.from_float(float(0))
                        tar_ledger.latest_initiator_bal -= Decimal.from_float(sender_amt)
                        # tar_ledger.locked_initiator_bal = tar_ledger.latest_initiator_bal #gota test if correct amt
                        tar_ledger.latest_recipient_bal += Decimal.from_float(amount)
                    
                    else: 
                        new_transaction = models.TransactionLocal(ledger=tar_ledger, local_nonce=int(new_nonce), sender_sig=sender_sig, \
                            receiver=tar_acc, amount=amount, status="SS")
                        sender_amt = amount - float(tar_ledger.ptp_recipient_bal) - float(tar_ledger.topup_recipient_bal)
                        tar_ledger.ptp_recipient_bal = Decimal.from_float(float(0))
                        tar_ledger.topup_recipient_bal = Decimal.from_float(float(0))
                        tar_ledger.latest_recipient_bal -= Decimal.from_float(sender_amt)
                        # tar_ledger.locked_recipient_bal = tar_ledger.latest_recipient_bal #gota test if correct amt
                        tar_ledger.latest_recipient_bal += Decimal.from_float(amount)

                    tar_ledger.latest_tx = new_transaction #gota db check this
                    

                    tar_ledger.save()
                    new_transaction.save()

            if models.TransactionLocal.objects.filter(local_nonce=new_nonce).exists():
                tar_ledger.latest_tx = new_transaction #will this error out?
                result = self.get_serializer(new_transaction, many=False).data #NEED MULTIPLE SERIALIZERS
                return Response(result, status=status.HTTP_200_OK)       

            msg = json.dumps({
                "error": "tx instance not created"
            })
            return Response(msg, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_404_NOT_FOUND)


class TopUpPaymentsViewSet(GetUpdateViewSet):
    serializer_class = serializers.TopUpSerializer

    @action(detail=False, methods=['POST'])
    def topUpChannel(self, request, *args, **kwargs):
        try:
            init_filter = (Q(status="INIT")) #is this correct?
            data = self.request.data
            currAddress = data.get('currAddress')
            targetAddress = data.get('targetAddress')
            curr_acc = models.Account.objects.get(wallet_address=currAddress)
            tar_acc = models.Account.objects.get(wallet_address=targetAddress)
            amount = data.get('amount')
            result = {}
            with transaction.atomic():
                if Channel.objects.filter(init_filter, Q(initiator=curr_acc, recipient=tar_acc) | Q(initiator=tar_acc, recipient=curr_acc)).exists():
                    tar_channel = models.Channel.objects.filter(init_filter, Q(initiator=curr_acc, recipient=tar_acc) | Q(initiator=tar_acc, recipient=curr_acc)).first()
                
                if tar_channel:
                    tar_ledger = tar_channel.ledger
                    topup_nonce = models.Topup_receipt.objects.filter(ledger=tar_ledger).count()
                    if tar_channel.initiator == curr_acc:
                        tar_ledger.topup_initiator_bal += Decimal.from_float(float(amount))
                    else:
                        tar_ledger.topup_recipient_bal += Decimal.from_float(float(amount))
                    topup_receipt = models.Topup_receipt(sender=curr_acc, local_nonce=int(topup_nonce), ledger=tar_ledger)
                    tar_ledger.save()
                    topup_receipt.save()
            
            if topup_receipt:
                result = {
                    "result": "success", 
                    "topup_receipt": self.get_serializer(topup_receipt, many=False).data   
                }
                return Response(result, status=status.HTTP_200_OK)
            
            msg = {"result": "fail"}     
            res = json.dumps(msg)
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)
