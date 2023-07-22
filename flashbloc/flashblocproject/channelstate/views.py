from inspect import signature
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

from . import serializers, models
from users.models import Account
from payments.models import TopupReceipt, TransactionLocal

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
    queryset = Account.objects.all()
    @action(detail=False, methods=["get"]) #pls check if detail is needed as a params
    def get_userChannels(self, request, *args, **kwargs):
        try:
            result = []
            curr_user = Account.objects.get(wallet_address=request.GET.get('walletAddress', ''))
            owned_channels = models.Channel.objects.filter(~Q(status="CD"), Q(initiator=curr_user) | Q(recipient=curr_user))
            result.append(self.get_serializer(owned_channels, many=True).data)

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["GET"])
    def get_targetChannel(self, request, *args, **kwargs):
        try:
            result = {}
            channelAddress = request.GET.get('q')
            target_channel = None
            if channelAddress:
                try:
                    target_channel = models.Channel.objects.get(channel_address=channelAddress) ##get or 404?
                except:
                    pass
            if not target_channel:
                currAddress = request.GET.get('currAddress')
                targetAddress = request.GET.get('q')
                curr_account = Account.objects.get(wallet_address=currAddress)
                target_account = Account.objects.get(wallet_address=targetAddress)
                target_channel = models.Channel.objects.filter(~Q(status="CD"), (Q(initiator=curr_account) & Q(recipient=target_account)) |
                (Q(recipient=curr_account) & Q(initiator=target_account))).first()
            result = self.get_serializer(target_channel, many=False).data
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'])
    def get_path(self, request, *args, **kwargs):
        try:
            amount = float(request.GET.get('amount'))
            targetAddress = request.GET.get("targetAddress")

        except ValueError as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

        try:
            print("START FUNCTION")
            class Node:
                def __init__(self, curr, last):
                    self.curr = curr
                    self.last = last

            visited = set()
            queue = []
            path = []

            curr_user = Account.objects.get(wallet_address=request.GET.get('walletAddress'))
            prev_node = None
            queue.append((curr_user, Node(curr=curr_user, last=None)))

            '''
            try to optimize this portion --> potential bottleneck
            
            current workflow
            -accounts are nodes (users) --> get channels of all nodes --> if other acc is target, Stop

            --> is looping through and filtering better or slicing a df that is only queried at the start
            '''
            while queue:
                acc_tup = queue.pop(0)
                acc = acc_tup[0]
                acc_node = acc_tup[1]

                if acc in visited:
                    continue
                recipient_neighbours = models.Channel.objects.filter(Q(status="INIT"), Q(initiator=acc)) #is using df better?
                initiator_neighbours = models.Channel.objects.filter(Q(status="INIT"), Q(recipient=acc))


                for idx, r_n in enumerate(recipient_neighbours):
                    ledger = r_n.ledger
                    if amount <= float(ledger.latest_initiator_bal)+float(ledger.ptp_initiator_bal)+float(ledger.topup_initiator_bal):
                        tar_acc = Account.objects.get(wallet_address=r_n.recipient.wallet_address) #can use get? or should i slice the df
                        tar_node = Node(curr=tar_acc, last=acc_node)
                        if tar_acc.wallet_address == targetAddress:
                            curr = tar_node.curr
                            path.insert(0, curr.wallet_address)
                            last = tar_node.last

                            while last != None:
                                path.insert(0, last.curr.wallet_address)
                                last = last.last 

                            json_response = json.dumps({"path" : path}) 
                            return Response(json_response, status=status.HTTP_200_OK)
                        queue.append((tar_acc, tar_node))
                        
                for idx, i_n in enumerate(initiator_neighbours):
                    ledger = i_n.ledger
                    if amount <= float(ledger.latest_recipient_bal)+float(ledger.ptp_recipient_bal)+float(ledger.topup_recipient_bal):
                        tar_acc = Account.objects.get(wallet_address=i_n.initiator.wallet_address) #can a suitable indexer be found?
                        tar_node = Node(curr=tar_acc, last=acc_node)
                        if tar_acc.wallet_address == targetAddress:
                            curr = tar_node.curr
                            path.insert(0, curr.wallet_address)
                            last = tar_node.last
                            while last != None:
                                path.insert(0, last.curr.wallet_address)
                                last = last.last 

                            json_response = json.dumps({"path" : path}) 
                            return Response(json_response, status=status.HTTP_200_OK)

                        queue.append((tar_acc, tar_node))
                visited.add(acc)

            json_response = json.dumps({"path" : path})
            return Response(json_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["POST"]) #DONE
    def reqChannel(self, request, *args, **kwargs):
        #maybe in future allow other forms of identifying target acc other than address
        try:
            data = self.request.data
            walletAddress = data.get('walletAddress')
            targetAddress = data.get('targetAddress')
            walletObj = Account.objects.get(wallet_address=walletAddress)
            targetObj = Account.objects.get(wallet_address=targetAddress)
            initiatorBalance = Decimal.from_float(float(data.get('initiatorBalance')))
            recipientBalance = Decimal.from_float(float(data.get('recipientBalance')))
            targetEmail = data.get('targetEmail')
            #check if transaction.atomic will work since db only hit once, hence no pk to reference fk
            newChannel = models.Channel(initiator=walletObj, recipient=targetObj, status="RQ", total_balance=initiatorBalance + recipientBalance, channel_address=walletAddress + targetAddress)
            newChannel.save()
            newLedger = models.Ledger(channel=newChannel, latest_initiator_bal=initiatorBalance, latest_recipient_bal=recipientBalance) #does this work? (should work)
            newLedger.save()
            '''
            write handler to send email of channel details with recipient
            '''
            res = self.get_serializer(newChannel, many=False).data
            return Response(res, status=status.HTTP_200_OK)
    


        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["PATCH"]) #DONE
    def approveChannel(self, request, *args, **kwargs):
        #maybe in future allow other forms of identifying target acc other than address
        try:
            data = self.request.data
            currAddress = data.get('currAddress')
            targetAddress = data.get('targetAddress')
            currAccount = Account.objects.get(wallet_address=currAddress)
            targetAccount = Account.objects.get(wallet_address=targetAddress)
            #check if transaction.atomic will work since db only hit once, hence no pk to reference fk
            currChannel = models.Channel.objects.get(Q(initiator=targetAccount), Q(recipient=currAccount))
            currChannel.status = "APV"
            currChannel.save()

            '''
            write handler to send email of channel details with recipient
            '''
            res = self.get_serializer(currChannel, many=False).data
            return Response(res, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST) #does it need to change?

    @action(detail=False, methods=["PATCH"]) #DONE
    def createChannel(self, request, *args, **kwargs):
        #maybe in future allow other forms of identifying target acc other than address
        try:
            data = self.request.data
            currAddress = data.get('currAddress')
            targetAddress = data.get('targetAddress')
            currAccount = Account.objects.get(wallet_address=currAddress)
            targetAccount = Account.objects.get(wallet_address=targetAddress)
            channelAddress = data.get('channelAddress')
            initSignature = data.get('initiatorSignature')
            #check if transaction.atomic will work since db only hit once, hence no pk to reference fk
            currChannel = models.Channel.objects.get(Q(initiator=currAccount), Q(recipient=targetAccount))
            print('aft get channel')
            currChannel.status = "OP"
            currChannel.channel_address = channelAddress
            currLedger = currChannel.ledger
            print('ledger:', currLedger, ' sig: ', initSignature, ' channeladdr: ', channelAddress)
            currPayment = TransactionLocal(status="SS", ledger=currLedger, amount=currChannel.total_balance,
                                           sender_sig=initSignature, receiver=targetAccount, local_nonce=1)
            currLedger.locked_initiator_bal = currLedger.latest_initiator_bal
            currLedger.latest_tx = currPayment  
            currPayment.save()
            currLedger.save()
            currChannel.save()

            '''
            write handler to send email of channel details with recipient
            '''
            res = self.get_serializer(currChannel, many=False).data
            return Response(res, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST) #does it need to change?


    @action(detail=False, methods=["PATCH"]) #DONE
    def initializeChannel(self, request, *args, **kwargs):
        #maybe in future allow other forms of identifying target acc other than address
        try:
            data = self.request.data
            currAddress = data.get('currAddress')
            targetAddress = data.get('targetAddress')
            currAccount = Account.objects.get(wallet_address=currAddress)
            targetAccount = Account.objects.get(wallet_address=targetAddress)
            channelAddress = data.get('channelAddress')
            recpSignature = data.get('recipientSignature')
            #check if transaction.atomic will work since db only hit once, hence no pk to reference fk
            currChannel = models.Channel.objects.get(Q(status="OP"), Q(recipient=currAccount), 
                                                     Q(initiator=targetAccount) | Q(channel_address=channelAddress))
            currLedger = currChannel.ledger
            assert currLedger.latest_recipient_bal == Decimal.from_float(data.get('recipientBalance')), "amount does not tally"
            currTx = currLedger.latest_tx
            currLedger.locked_recipient_bal = currLedger.latest_recipient_bal
            currTx.receiver_sig = recpSignature
            currTx.save()   
            currLedger.locked_tx = currTx
            currLedger.save()
            currChannel.status = "INIT"
            currChannel.save()

            '''
            write handler to send email of channel details with recipient
            '''
            res = self.get_serializer(currChannel, many=False).data
            return Response(res, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST) #does it need to change?
        
    @action(detail=False, methods=["PATCH"])
    def closeChannel(self, request, *args, **kwargs):
        try:
            status_change = False
            data = self.request.data
            currAddress = data.get('currAddress')
            channelAddress = data.get('channelAddress')
            targetChannel = models.Channel.objects.get(channel_address=channelAddress)
            assert targetChannel.closed_by and targetChannel.closed_by != models.Account.objects.get(wallet_address=currAddress)
            if targetChannel and targetChannel.status == "LK":
                targetChannel.status = "CD"
                targetChannel.total_balance = Decimal.from_float(0.0)
                targetChannel.save()
            
                if targetChannel.status == "CD":
                    status_change = True
            
            res_dic = {"success": status_change}
            res_dict = json.dumps(res_dic)
            return Response(res_dict, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=['POST'])
    def declareCloseChannel(self, request, *args, **kwargs):
        '''
        should transaction.atomic be added?
        '''
        try:
            res_dic = {}
            data = self.request.data
            channelAddress = data.get('channelAddress')
            currAddress = data.get('currAddress')
            targetChannel = models.Channel.objects.get(channel_address=channelAddress)
            print("OK 1")
            with transaction.atomic():
                if targetChannel and targetChannel.status == "INIT":
                    targetLedger = targetChannel.ledger
                    bal_initiator = float(targetLedger.locked_initiator_bal) + float(targetLedger.ptp_initiator_bal) #are these info needed?
                    bal_recipient = float(targetLedger.locked_recipient_bal) + float(targetLedger.ptp_recipient_bal)
                    print('OK 2')
                    tx_receipt = targetLedger.locked_tx #is this the correct way to use related name?
                    if targetChannel.initiator == tx_receipt.receiver:
                        sig_initiator = tx_receipt.receiver_sig #assumes that this is the latest tx that can be signed by closer hence is recipient
                        sig_recipient = tx_receipt.sender_sig
                    
                    
                    else: 
                        sig_recipient = tx_receipt.receiver_sig #assumes that this is the latest tx that can be signed by closer hence is recipient
                        sig_initiator = tx_receipt.sender_sig
                    targetAccount = models.Account.objects.get(wallet_address=currAddress)
                    targetChannel.closed_by = targetAccount
                    targetChannel.status = "LK"
                    res_dic["sig_initiator"] = sig_initiator
                    res_dic["sig_recipient"] = sig_recipient
                    '''
                    send email to other party to inform and perform desired actions
                    '''
                    res_dic["bal_initiator"] = bal_initiator
                    res_dic["bal_recipient"] = bal_recipient
                    targetChannel.save()
            print('OK 3')
            res_dict = json.dumps(res_dic)
            return Response(res_dict, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'])
    def getLatestTx(self, request, *args, **kwargs):
        try:
            currAddress = request.GET.get('currAddress')
            channelAddress = request.GET.get('channelAddress')
            info_dict = {}
            tar_channel = models.Channel.objects.get(channel_address=channelAddress)
            curr_account = Account.objects.get(wallet_address=currAddress)
            init_bal = 0.0
            recp_bal = 0.0
            latest_nonce = -1
            locked_nonce = -1
            lk_init_bal = 0.0
            lk_recp_bal = 0.0
            tar_ledger = tar_channel.ledger
            latest_tx = tar_ledger.latest_tx #check if this exists? (will it error if this does not exist?)
            stat = "no valid tx to sign"

            init_bal = float(tar_ledger.latest_initiator_bal)
            recp_bal = float(tar_ledger.latest_recipient_bal)
            lk_init_bal = float(tar_ledger.locked_initiator_bal)
            lk_recp_bal = float(tar_ledger.locked_recipient_bal)
            latest_nonce = latest_tx.local_nonce
            locked_tx = tar_ledger.locked_tx
            if locked_tx:
                locked_nonce = locked_tx.local_nonce
            if latest_tx:
                # amount = latest_tx.amount
                # if tar_channel.initiator == curr_account:
                #     init_bal += float(tar_ledger.ptp_initiator_bal) + float(tar_ledger.topup_initiator_bal)
                # else:
                #     recp_bal += float(tar_ledger.ptp_recipient_bal) + float(tar_ledger.topup_recipient_bal)
                if latest_tx.receiver == curr_account and not latest_tx.receiver_sig:
                    stat = "sign here"
                info_dict = {
                    "result": stat, 
                    "channelAddress": str(channelAddress), 
                    "initBal": int(init_bal), 
                    "recpBal": int(recp_bal), 
                    "initLkBal": int(lk_init_bal), 
                    "recpLkBal": int(lk_recp_bal), 
                    "latestNonce": int(latest_nonce), 
                    "lockedNonce": int(locked_nonce)
                    }

            if info_dict == {}:
                info_dict = {
                    "result": "no valid tx to sign", 
                    "channelAddress": str(channelAddress), 
                    "initBal": int(init_bal), 
                    "recpBal": int(recp_bal), 
                    "initLkBal": int(lk_init_bal), 
                    "recpLkBal": int(lk_recp_bal), 
                    "latestNonce": int(latest_nonce), 
                    "lockedNonce": int(locked_nonce)
                    }     
            
            res = json.dumps(info_dict)

            return Response(res, status=status.HTTP_200_OK) 

        
        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['POST'])
    def signLatestTx(self, request, *args, **kwargs):
        try:
            data = self.request.data
            currAddress = data.get("currAddress")
            txSig = data.get("txSignature")
            nonce = data.get("nonce")
            channelAddress = data.get("channelAddress")
            tar_channel = models.Channel.objects.get(channel_address=channelAddress)
            curr_account = Account.objects.get(wallet_address=currAddress)
            if tar_channel:
                tar_ledger = tar_channel.ledger
                if tar_channel.status != "CD":
                    latest_tx = tar_ledger.latest_tx
                    with transaction.atomic():
                        if latest_tx.receiver == curr_account and latest_tx.local_nonce == int(nonce):
                            latest_tx.receiver_sig = str(txSig)
                            latest_tx.save()
                            tar_ledger.locked_tx = latest_tx
                            if tar_channel.initiator == curr_account:
                                tar_ledger.latest_initiator_bal = tar_ledger.latest_initiator_bal + tar_ledger.ptp_initiator_bal + tar_ledger.topup_initiator_bal
                                tar_ledger.ptp_initiator_bal = Decimal.from_float(0.0)
                                tar_ledger.topup_initiator_bal = Decimal.from_float(0.0)
                                
                            else:
                                tar_ledger.latest_recipient_bal = tar_ledger.latest_recipient_bal + tar_ledger.ptp_recipient_bal + tar_ledger.topup_recipient_bal
                                tar_ledger.ptp_recipient_bal = Decimal.from_float(0.0)
                                tar_ledger.topup_recipient_bal = Decimal.from_float(0.0)

                            tar_ledger.locked_initiator_bal = tar_ledger.latest_initiator_bal
                            tar_ledger.locked_recipient_bal = tar_ledger.latest_recipient_bal
                            tar_ledger.locked_tx = tar_ledger.latest_tx
                            # tar_channel.status = "INIT" #why change to init?
                            tar_channel.save()
                            tar_ledger.save()
                
                info_dict = {
                    "result": "success", 
                    "signed_sig": latest_tx.receiver_sig
                }
                res = json.dumps(info_dict)
                return Response(res, status=status.HTTP_200_OK)
            
            msg = {"result": "no valid tx to sign"}     
            res = json.dumps(msg)
            return Response(res, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'])
    def retrieve_sigs(self, request, *args, **kwargs):
        try: 
            info_dict = {}
            data = self.request.data
            channelAddress = data.get('channelAddress')
            currSig = data.get('currSig')
            tar_channel = models.Channel.objects.get(channel_address=channelAddress)
            # print("TARGET CHANNEL: ", tar_channel)
            tar_ledger = tar_channel.ledger
            locked_tx = tar_ledger.locked_tx
            # print("LOCKED TX: ", locked_tx)
            # print("CURR SIG: ", currSig, currSig == locked_tx.sender_sig)
            if currSig == locked_tx.sender_sig or currSig == locked_tx.receiver_sig:
                if locked_tx.receiver == tar_channel.initiator:
                    info_dict = {
                        "result": "success", 
                        "initSig": locked_tx.receiver_sig, 
                        "recpSig": locked_tx.sender_sig, 
                        "lkInitBal": float(tar_ledger.locked_initiator_bal), 
                        "lkRecpBal": float(tar_ledger.locked_recipient_bal)
                    }
                
                else:
                    info_dict = {
                        "result": "success", 
                        "initSig": locked_tx.sender_sig, 
                        "recpSig": locked_tx.receiver_sig, 
                        "lkInitBal": float(tar_ledger.locked_initiator_bal), 
                        "lkRecpBal": float(tar_ledger.locked_recipient_bal)
                    }

            else    :
                info_dict = {"result": "no matching signature"}

            res = json.dumps(info_dict)
            return Response(res, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)


                            
                    

