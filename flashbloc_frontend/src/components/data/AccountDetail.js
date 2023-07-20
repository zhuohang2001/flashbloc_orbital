import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { currentChannel, editCurrentChannelPay, editCurrentChannelTopup } from '../../state_reducers/ChannelReducer'
import { Contract, ethers } from 'ethers'
import contract_abi from '../abi/contract_abi.json'
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { topup_channel } from '../../contract_methods/channel_methods'

import getCookie from '../../csrf'
import { MDBCol, MDBIcon, MDBFormInline, MDBBtn } from "mdbreact";
import axiosInstance from '../axios'



const AccountDetail = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loginAccount = useSelector((state) => state.loginAccount.value.current.walletAddress); //get from global state 
    const [transactionAmtState, setTransactionAmt] = useState("")
    const [payButtonState, setPayButtonState] = useState(false)
    const [paymentPathState, setPaymentPathState] = useState([])

    const curr_account = useSelector((state) => state.accounts.value.current)

    const handleSearchPath = async () => {
        axiosInstance.get(`channelstate/get_path/?amount=${transactionAmtState}&walletAddress=${loginAccount}&targetAddress=${curr_account.wallet_address}`)
            .then((response) => JSON.parse(response.data))
            .then((data) => {
                const path = data.path
                if (path != []) {
                    //display pay button
                    setPaymentPathState(path)
                    setPayButtonState(true)
                } else {
                    //display no viable path logo
                }   
            })
    }

    const handlePtpPayment = async () => {
        axiosInstance.post(`payments/ptp/executePtp/`, {
            pathArray: paymentPathState, 
            amount: transactionAmtState, 
            origin: loginAccount, 
            destination: curr_account.wallet_address
        })
            .then((response) => JSON.parse(response.data))
            .then((data) => {
                if (data.status == "SS") {
                    //display success toast msg
                } else {
                    //display failure toast msg
                }
            })
    }

    const handleRedirectCreateChannel = () => {
        navigate('/CreateChannel')
    }



    return (
        <Fragment>
            <h1>Account Details</h1>
            <div className="container">
                    <div className="row" style={{ display: "flex", flexDirection: 'row' }}>
                        <div className="col-lg-6">
                            <div className="card textPrimary bg-info">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Info</h5>
                                        <ul>
                                            <li key={curr_account.wallet_address}>Address: {curr_account.wallet_address} </li>
                                            <br></br>
                                            <li key={curr_account.user_name}>Username: {curr_account.user_name}</li>
                                            <br></br>
                                            <li key={curr_account.email}>email: {curr_account.email}</li>
                                        </ul>
                                    </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card textPrimary bg-info">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Balances</h5>
                                        <ul>
                                            <li key="channel info">You have no channel with this user</li>
                                            <br></br>
                                            <button className="btn btn-secondary" onClick={handleRedirectCreateChannel} style={{ marginLeft: '10px' }}>
                                                Create Channel
                                            </button>
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
                        className="form-control"
                        style={{ width: '50%' }}
                        placeholder="Search"
                        value={transactionAmtState}
                        onChange={(e) => setTransactionAmt(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleSearchPath} style={{ marginLeft: '10px' }}>
                        Find Path
                        </button>
                        <br></br>
                        {payButtonState && <button className="btn-btn-secondary" onClick={handlePtpPayment} style={{ marginLeft: "10px" }}>
                            Pay
                        </button>}
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default AccountDetail;