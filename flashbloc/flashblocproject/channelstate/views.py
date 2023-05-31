from inspect import signature
import json
from django.http import HttpResponse

from django.shortcuts import render
# Create your views here.
from rest_framework import viewsets, generics, mixins, views, status, renderers
from rest_framework.generics import get_object_or_404
from django.db.models import Q, Max, Min
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from . import serializers, models
from users.models import Account
from payments.models import Topup_receipt

'''
--> if signature involved, use POST

1. get userchannels (get)
2. get targetchannel (get)
3. get path (get)
4. create channel (post)
5. close channel (post)
6. get latestTx (get)
7. sign latestTx (post)
'''

class GetUpdateViewSet(mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.ListModelMixin,
                       viewsets.GenericViewSet):
    pass

class channelStateView(GetUpdateViewSet):
    serializer_class = serializers.ChannelSerializer

    closed_filter = (~Q(status="CD"))

    @action(methods=["get"], url_path=r"userChannels/<str:walletAddress>") #pls check if detail is needed as a params
    def get_userChannels(self, request, *args, **kwargs):
        try:
            result = []
            curr_user = Account.objects.get(self.kwargs.get('walletAddress')).first()
            owned_channels = models.Channel.objects.filter(~Q(status="CD"), Q(initator=curr_user) | Q(recipient=curr_user))
            result.append(self.get_serializer(owned_channels, many=True).data)

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_404_NOT_FOUND)

    @action(methods=["get"], url_path=r"targetChannel/<str:walletAddress>/<str:targetAddress>")
    def get_targetChannel(self, request, *args, **kwargs):
        try:
            result = []
            curr_user = Account.objects.get(self.kwargs.get('walletAddress')).first()
            target_channel = models.Channel.objects.filter(~Q(status="CD"), (Q(initator=curr_user) & Q(recipient=self.kwargs.get('targetAddress'))) |
             (Q(recipient=curr_user) & Q(initiator=self.kwargs.get('targetAddress')))).first()
            result.append(self.get_serializer(target_channel, many=False).data)
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], url_path=r"getPath/<str:walletAddress>/<str:targetAddress>/(?P<amount>\d+\.\d+)$")
    def get_path(self, request, *args, **kwargs):
        try:
            amount = float(self.kwargs.get('amount'))

        except ValueError as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

        try:
            class Node:
                def __init__(self, curr, last):
                    self.curr = None
                    self.last = None

            visited = set()
            queue = []
            path = []

            curr_user = Account.objects.get(walletAddress=self.kwargs.get('walletAddress')).first()
            first_node = Node(curr_user, None)
            visited.add(curr_user)
            queue.append(curr_user)
            '''
            try to optimize this portion --> potential bottleneck
            
            current workflow
            -accounts are nodes (users) --> get channels of all nodes --> if other acc is target, Stop

            --> is looping through and filtering better or slicing a df that is only queried at the start
            '''
            while queue:
                acc = queue.pop(0)
                recipient_neighbours = models.Channel.objects.filter(Q(status="INIT"), Q(initiator=acc.walletAddress)) #is using df better?
                initiator_neighbours = models.Channel.objects.filter(Q(status="INIT"), Q(recipient=acc.walletAddress))

                for r_n in recipient_neighbours:
                    ledger = models.Ledger.objects.filter(Channel=r_n).first() #check whether channel can reference to ledger even if field not exist
                    if amount < min(float(ledger.locked_initiator_bal)+float(ledger.ptp_initiator_bal), float(ledger.locked_initiator_bal)+float(ledger.ptp_initiator_bal)):
                        tar_acc = Account.objects.filter(walletAddress=r_n.recipient).first() #can use get? or should i slice the df
                        tar_node = Node(curr=tar_acc, last=acc)
                        if tar_acc.walletAddress == self.kwargs.get("targetAddress"):
                            curr = tar_node.curr
                            path.insert(0, curr.walletAddress)
                            last = tar_node.last
                            while last:
                                path.insert(0, last.walletAddress)
                                last = last.last 

                            json_response = json.dumps({"path" : path}) 
                            return Response(json_response, status=status.HTTP_200_OK)

                for i_n in initiator_neighbours:
                    ledger = models.Ledger.objects.filter(Channel=i_n).first()
                    if amount < min(float(ledger.locked_recipient_bal)-float(ledger.ptp_recipient_bal), float(ledger.locked_recipient_bal)-float(ledger.ptp_recpient_bal)):
                        tar_acc = Account.objects.filter(walletAddress=i_n.initiator).first() #can a suitable indexer be found?
                        tar_node = Node(curr=tar_acc, last=acc)
                        if tar_acc.walletAddress == self.kwargs.get("targetAddress"):
                            curr = tar_node.curr
                            path.insert(0, curr.walletAddress)
                            last = tar_node.last
                            while last:
                                path.insert(0, last.walletAddress)
                                last = last.last 

                            json_response = json.dumps({"path" : path}) 
                            return Response(json_response, status=status.HTTP_200_OK)

                        visited.add(tar_acc)
                        queue.append(tar_acc)

            json_response = json.dumps({"path" : path})
            return Response(json_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path=r'newChannel')
    def createChannel(self, request, *args, **kwargs):
        #maybe in future allow other forms of identifying target acc other than address
        try:
            data = self.request.data
            walletAddress = data.get('walletAddress')
            targetAddress = data.get('targetAddress')
            initiatorBalance = data.get('initiatorBalance')
            targetEmail = data.get('targetEmail')
            #check if transaction.atomic will work since db only hit once, hence no pk to reference fk
            newChannel = models.Channel(initator=walletAddress, recipient=targetAddress, status="OP", totalBalance=initiatorBalance)
            newChannel.save()
            newLedger = models.Ledger(channel=newChannel) #does this work? (should work)
            newLedger.save()
            '''
            write handler to send email of channel details with recipient
            '''
            res = self.get_serializer(newChannel, many=False).data
            return Response(res, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path=r'closeChannel')
    def closeChannel(self, request, *args, **kwargs):
        '''
        should transaction.atomic be added?
        '''
        try:
            res_dic = {}
            data = self.request.data
            walletAddress = data.get('walletAddress')
            targetAddress = data.get('targetAddress')
            with transaction.atomic():
                if models.Channel.objects.filter(initiator__in=[str(walletAddress), str(targetAddress)], recipient__in=[str(walletAddress), str(targetAddress)]).exists():
                    targetChannel = models.Channel.objects.filter(initiator__in=[str(walletAddress), str(targetAddress)], recipient__in=[str(walletAddress), str(targetAddress)]).first()
                    targetLedger = targetChannel.ledger
                    bal_initiator = float(targetLedger.locked_initiator_bal) + float(targetLedger.ptp_initiator_bal) #are these info needed?
                    bal_recipient = float(targetLedger.locked_recipient_bal) + float(targetLedger.ptp_recipient_bal)
                    tx_receipt = targetLedger.lockedTx.first() #is this the correct way to use related name?
                    sig_initiator = tx_receipt.recipient_sig #assumes that this is the latest tx that can be signed by closer hence is recipient
                    sig_recipient = tx_receipt.initiator_sig
                    if targetChannel.status == "INIT":
                        targetChannel.status = "LK"
                    elif targetChannel.status == "INIT": #what should this be instead?
                        targetChannel.status = "CD"
                        res_dic["sig_initiator"] = sig_initiator
                        res_dic["sig_recipient"] = sig_recipient

                    targetChannel.save()
                    '''
                    send email to other party to inform and perform desired actions
                    '''
                    res_dic["bal_initiator"] = bal_initiator
                    res_dic["bal_recipient"] = bal_recipient

                res_dict = json.dumps(res_dic)
            return Response(res_dict, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path=r'getLatestTx/<str:walletAddress>/<str:targetAddress>')
    def getLatestTx(self, request, *args, **kwargs):
        try:
            walletAddress = kwargs.get("walletAddress")
            targetAddress = kwargs.get("targetAddress")
            info_dict = {}
            with transaction.atomic():
                if models.Channel.objects.filter(initiator__in=[str(walletAddress), str(targetAddress)], recipient__in=[str(walletAddress), str(targetAddress)]).exists():
                    tar_channel = models.Channel.objects.filter(initiator__in=[str(walletAddress), str(targetAddress)], recipient__in=[str(walletAddress), str(targetAddress)]).first()
                    channelAddress = tar_channel.channel_address
                    tar_ledger = tar_channel.ledger
                    latest_tx = tar_ledger.latestTx.first() #check if this exists? (will it error if this does not exist?)
                    if latest_tx and latest_tx.receiver == walletAddress:
                        amount = latest_tx.amount
                        if tar_channel.initiator == str(walletAddress):
                            extra_amount = float(tar_channel.ptp_initiator_bal) + float(tar_channel.topup_initiator_bal)
                        else:
                            extra_amount = float(tar_channel.ptp_recipient_bal) + float(tar_channel.topup_recipient_bal)
                        tar_channel.state = "LK"
                        tar_channel.save() #why am i editing in a get request
                        nonce = latest_tx.local_nonce
                        info_dict = {
                            "channelAddress": str(channelAddress), 
                            "amount": float(amount), 
                            "extra_amount": extra_amount, 
                            "nonce": int(nonce)
                        }

            if not info_dict:
                msg = {"result": "no valid tx to sign"}     
                res = json.dumps(msg)
            
            else:
                res = json.dumps(info_dict)

            return Response(res, status=status.HTTP_200_OK) 

        
        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path=r'signLatestTx')
    def signLatestTx(self, request, *args, **kwargs):
        try:
            data = self.request.data
            walletAddress = data.get("walletAddress")
            txSig = data.get("txSignature")
            nonce = data.get("nonce")
            targetAddress = kwargs.get("targetAddress")
            if models.Channel.objects.filter(initiator__in=[str(walletAddress), str(targetAddress)], recipient__in=[str(walletAddress), str(targetAddress)]).exists():
                tar_channel = models.Channel.objects.filter(initiator__in=[str(walletAddress), str(targetAddress)], recipient__in=[str(walletAddress), str(targetAddress)]).first()
                tar_ledger = tar_channel.ledger
                if tar_channel.status == "LK":
                    latest_tx = tar_ledger.latestTx.first() #check if this exists? (will it error if this does not exist?)
                    with transaction.atomic():
                        if latest_tx.receiver == walletAddress and latest_tx.local_nonce == int(nonce):
                            latest_tx.receiver_sig = str(txSig)
                            latest_tx.save()
                            tar_ledger.lockedTx = latest_tx
                            if tar_channel.initiator == str(walletAddress):
                                tar_ledger.locked_initiator_bal = tar_ledger.latest_initiator_bal + tar_ledger.ptp_initiator_bal + tar_ledger.topup_initiator_bal
                                tar_ledger.ptp_initiator_bal = float(0)
                                tar_ledger.topup_initiator_bal = float(0)
                                tar_ledger.locked_recipient_bal = tar_ledger.latest_recipient_bal
                            
                            else:
                                tar_ledger.locked_recipient_bal = tar_ledger.latest_recipient_bal + tar_ledger.ptp_recipient_bal + tar_ledger.topup_recipient_bal
                                tar_ledger.ptp_recipient_bal = float(0)
                                tar_ledger.topup_recipient_bal = float(0)
                                tar_ledger.locked_initiator_bal = tar_ledger.locked_initiator_bal

                            tar_channel.status = "INIT" #why change to init?
                            tar_channel.save()
                            tar_ledger.save()
                        
                info_dict = {
                    "signed_sig": latest_tx.receiver_sig
                }
                res = json.dumps(info_dict)
                return Response(res, status=status.HTTP_200_OK)
            
            msg = {"result": "no valid tx to sign"}     
            res = json.dumps(msg)
            return Response(res, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)


                            
                    

