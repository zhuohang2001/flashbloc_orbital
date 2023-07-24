import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { currentChannel, editCurrentChannelPay, editCurrentChannelTopup } from '../../state_reducers/ChannelReducer'
import { Contract, ethers } from 'ethers'
import contract_abi from '../abi/contract_abi.json'
import { topup_channel } from '../../contract_methods/channel_methods'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import getCookie from '../../csrf'
import { MDBCol, MDBIcon, MDBFormInline, MDBBtn } from "mdbreact";
import axiosInstance from '../axios'



const ChannelDetail = () => {
    const dispatch = useDispatch()
    const loginAccount = useSelector((state) => state.loginAccount.value.current.walletAddress); //get from global state 
    const [identityState, setIdentity] = useState("")
    const [maxPayableState, setMaxPayable] = useState(0.0)
    const [transactionAmtState, setTransactionAmt] = useState("")
    const [topupAmtState, setTopupAmt] = useState("")

    const curr_channel = useSelector((state) => state.channels.value.current)
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum)
    let signer = tempProvider.getSigner()
    const curr_channel_contract = new ethers.Contract(curr_channel.channel_address, contract_abi, signer)

    const showToastSuccessActionMessage = (action) => {
        console.log("showwing success toast")
        toast.success(`Successful ${action} !`, {
            position: toast.POSITION.TOP_RIGHT
        });
    };

    const showToastErrorActionMessage = (action) => {
        console.log("showwing error toast")
        toast.error(`Error while making ${action} !`, {
            position: toast.POSITION.TOP_CENTER
        });
    };


    useEffect(() => {
        if (loginAccount == curr_channel.initiator) {
             setIdentity("initiator")
             setMaxPayable(parseFloat(curr_channel.ledger.latest_initiator_bal) + parseFloat(curr_channel.ledger.ptp_initiator_bal) + parseFloat(curr_channel.ledger.topup_initiator_bal)) 
        } else if (loginAccount == curr_channel.recipient) {
             setIdentity("recipient")
             setMaxPayable(parseFloat(curr_channel.ledger.latest_recipient_bal) + parseFloat(curr_channel.ledger.ptp_recipient_bal) + parseFloat(curr_channel.ledger.topup_recipient_bal)) 
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
            amtRecp = parseFloat(curr_channel.ledger.locked_recipient_bal) + parseFloat(transactionAmtState)
            receiver = curr_channel.recipient
        } else if (identityState == "recipient") {
            amtRecp = maxPayableState - transactionAmtState
            amtInit = parseFloat(curr_channel.ledger.locked_initiator_bal) + parseFloat(transactionAmtState)
            receiver = curr_channel.initiator
        } else {
            return
        }
        await axiosInstance.get(`channelstate/getLatestTx/?currAddress=${loginAccount}&channelAddress=${curr_channel.channel_address}`)
        .then((response) => response.data)
        .then((arr) => JSON.parse(arr))
        .then(async (data) => {
            console.log("transaction logging")
            console.log(data.latestNonce)
            console.log(amtRecp)
            console.log(amtInit)
            const hashedMsg = ethers.utils.solidityKeccak256(["address", "uint", "string", "uint"], 
            [data.channelAddress.toLowerCase(), 0, parseInt(amtInit) + ";" + parseInt(amtRecp), ethers.BigNumber.from(parseInt(data.latestNonce) + 1)])
            const signedMessage = await signer.signMessage(ethers.utils.arrayify(hashedMsg))

            await axiosInstance
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
            if (res.data.status == "SS") {
                showToastSuccessActionMessage('payment')
            } else {
                showToastErrorActionMessage('payment')
            }
            }
        )
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
                        .post(`payments/topup/topUpChannel/`, {
                            currAddress: loginAccount, 
                            targetAddress: tar_addr, 
                            amount: topupAmtState
                        }).then((response) => response.data)
                            .then((data) => {
                                if (data.result == "success") {
                                    dispatch(editCurrentChannelTopup({
                                        "identity": identityState, 
                                        "amt": topupAmtState
                                    }))
                                    console.log("topup success")
                                    showToastSuccessActionMessage('topup')
                                } else {
                                    showToastErrorActionMessage('topup')
                                }
                            })
                }
            })

    }


    return (
        <Fragment>
             <ToastContainer/>
            <h1>Channel Details</h1>
            <div className="container">
                    <div className="row" style={{ display: "flex", flexDirection: 'row' }}>
                        <div className="col-lg-6">
                            <div className="card textPrimary bg-info">
                                {/* <div className="card-header">Header</div> */}
                                    <div className="card-body">
                                        <h5 className="card-title">Account Details</h5>
                                        <ul>
                                            <li key={curr_channel.channel_address}>Address: {curr_channel.channel_address} </li>
                                            <br></br>
                                            <li key={curr_channel.address}>Status: {curr_channel.status}</li>
                                        </ul>
                                    </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card textPrimary bg-info">
                                {/* <div className="card-header">Header</div> */}
                                    <div className="card-body">
                                        <h5 className="card-title">Account Balances</h5>
                                        <ul>
                                            <li key={curr_channel.id}>{curr_channel.initiator} balance: {parseFloat(curr_channel.ledger.latest_initiator_bal) + parseFloat(curr_channel.ledger.ptp_initiator_bal) + parseFloat(curr_channel.ledger.topup_initiator_bal)}</li>
                                            <br></br>
                                            <li key={curr_channel.id}>{curr_channel.recipient} balance: {parseFloat(curr_channel.ledger.latest_recipient_bal) + parseFloat(curr_channel.ledger.ptp_recipient_bal) + parseFloat(curr_channel.ledger.topup_recipient_bal)}</li>
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
                        placeholder="Amount"
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
                        placeholder="Amount"
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