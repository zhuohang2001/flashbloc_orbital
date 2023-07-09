import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { currentChannel, editCurrentChannelPay, editCurrentChannelTopup } from '../../state_reducers/ChannelReducer'
import { Contract, ethers } from 'ethers'
import contract_abi from '../abi/contract_abi.json'
import { topup_channel } from '../../contract_methods/channel_methods'

import getCookie from '../../csrf'
import { MDBCol, MDBIcon, MDBFormInline, MDBBtn } from "mdbreact";
import axiosInstance from '../axios'



const ChannelDetail = () => {
    const dispatch = useDispatch()
    const loginAccount = useSelector((state) => state.loginAccount.value.current.walletAddress); //get from global state 
    const [identityState, setIdentity] = useState("")
    const [maxPayableState, setMaxPayable] = useState("")
    const [transactionAmtState, setTransactionAmt] = useState("")
    const [topupAmtState, setTopupAmt] = useState("")

    const curr_channel = useSelector((state) => state.channels.value.current)
    const curr_account = useSelector((state) => state.accounts.value.current)
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum)
    let signer = tempProvider.getSigner()
    const curr_channel_contract = new ethers.Contract(curr_channel.channel_address, contract_abi, signer)

    useEffect(() => {
        if (loginAccount == curr_channel.initiator) {
             setIdentity("initiator")
             setMaxPayable(parseFloat(curr_channel.locked_initiator_bal) + parseFloat(curr_channel.ptp_initiator_bal) + parseFloat(curr_channel.topup_initiator_bal)) 
        } else if (loginAccount == curr_channel.recipient) {
             setIdentity("recipient")
             setMaxPayable(parseFloat(curr_channel.locked_recipient_bal) + parseFloat(curr_channel.ptp_recipient_bal) + parseFloat(curr_channel.topup_recipient_bal)) 
        }
    })

    const handleClickPay = async () => {
        var amtInit = 0.0
        var amtRecp = 0.0
        var receiver = null
        if (transactionAmtState > maxPayableState) {
            return
        }
        if (identityState == "initiator") {
            amtInit = maxPayableState - transactionAmtState
            amtRecp = curr_channel.locked_recipient_bal + transactionAmtState
            receiver = curr_channel.recipient
        } else if (identityState == "recipient") {
            amtRecp = maxPayableState - transactionAmtState
            amtInit = curr_channel.locked_initiator_bal + transactionAmtState
            receiver = curr_channel.initiator
        } else {
            return
        }
        axiosInstance.get(`channelstate/getLatestTx/?currAddress=${loginAccount}&channelAddress=${receiver}`)
        .then((response) => response.data)
        .then((arr) => JSON.parse(arr))
        .then(async (data) => {
            const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
            [data.channelAddress, 0, parseInt(amtInit) + ";" + parseInt(amtRecp), data.nonce + 1])
            const signedMessage = await signer.signMessage(hashedMsg)
            await axiosInstance.post(`channelstate/retrieve_sigs/`, {
                channelAddress: curr_channel.channel_address, 
                currSig: signedMessage
              }).then((res) => res.data)
              .then((arr) => JSON.parse(arr))
              .then((data) => {
                if (data.result == "success") {
                    axiosInstance
                    .post(`payments/local/executeTxLocal/`, {
                      currAddress: loginAccount, 
                      targetAddress: receiver, 
                      sender_sig: signedMessage, 
                      amount: transactionAmtState
                    })
                    .then((res) => {
                      dispatch(editCurrentChannelPay({
                        "identity": identityState, 
                        "amt": transactionAmtState
                      }))
                    }
                  )
                } else {
                  console.log("failed to declare close")
                }
              })
        })
        
        //amt --> locked + topup + ptp
        //amt -> sign -> transact -> update state
        
    }

    const handleClickTopup = async () => {
        //amt -> call .topup function --> call api --> update state
        var tar_addr = ""
        if (identityState == "initiator") {
            tar_addr = curr_channel.recipient
        } else if (identityState == "recipient") {
            tar_addr = curr_channel.initiator
        } else {
            return
        }

        topup_channel(curr_channel_contract, topupAmtState)
            .then((res) => {
                if (res) {
                    axiosInstance
                        .post(`payments/topUpChannel/`, {
                            currAddress: loginAccount, 
                            targetAddress: tar_addr, 
                            amount: topupAmtState
                        }).then((response) => JSON.parse(response.data))
                            .then((data) => {
                                if (data.result == "success") {
                                    dispatch(editCurrentChannelTopup({
                                        "identity": identityState, 
                                        "amt": topupAmtState
                                    }))
                                    console.log("topup success")
                                }
                            })
                }
            })

    }


    return (
        <Fragment>
            <h1>Channel Details</h1>
            <div className="container">
                    <div className="row" style={{ display: "flex", flexDirection: 'row' }}>
                        <div className="col-lg-4">
                            <div className="card textPrimary bg-info">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Info</h5>
                                        <ul>
                                            <li key={curr_channel.channel_address}>Address: {curr_channel.channel_address} </li>
                                            <br></br>
                                            <li key={curr_channel.address}>Status: {curr_channel.status}</li>
                                        </ul>
                                    </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card textPrimary bg-info">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Balances</h5>
                                        <ul>
                                            <li key={curr_channel.id}>{curr_channel.initiator} balance: {curr_channel.ledger.latest_initiator_bal}</li>
                                            <br></br>
                                            <li key={curr_channel.id}>{curr_channel.recipient} balance: {curr_channel.ledger.latest_recipient_bal}</li>
                                        </ul>
                                    </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card textPrimary bg-info">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Pending topup balance</h5>
                                        <ul>
                                            <li key={curr_channel.id}>{curr_channel.initiator} top up balance: {curr_channel.ledger.topup_initiator_bal}</li>
                                            <br></br>
                                            <li key={curr_channel.id}>{curr_channel.recipient} top up balance: {curr_channel.ledger.topup_recipient_bal}</li> 
                                        </ul>
                                    </div>
                            </div>
                        </div>
                    </div>
                
                <div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', marginTop: '35px'}}>
                        <input
                        type="number"
                        min="0"
                        max={maxPayableState}
                        className="form-control"
                        style={{ width: '50%' }}
                        placeholder="Search"
                        value={transactionAmtState}
                        onChange={(e) => setTransactionAmt(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleClickPay} style={{ marginLeft: '10px' }}>
                        Pay
                        </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', marginTop: '35px'}}>
                        <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '50%' }}
                        placeholder="Search"
                        value={topupAmtState}
                        onChange={(e) => setTopupAmt(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleClickTopup} style={{ marginLeft: '10px' }}>
                        Topup
                        </button>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ChannelDetail;