import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { currentChannel } from '../../state_reducers/ChannelReducer'
import { Contract, ethers } from 'ethers'
import contract_abi from '../abi/factory_contract_abi.json'


export default function ChannelDetails () {
    const dispatch = useDispatch()
    const [signatureState, setSignature] = useState(null)
    const curr_channel = useSelector((state) => state.channels.value.current)
    const curr_account = useSelector((state) => state.accounts.value.current)
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum)
    let tempSigner = tempProvider.getSigner()
    const curr_channel_contract = new ethers.Contract(curr_channel.address, contract_abi, tempSigner)
    useEffect(() => {
        if (curr_account.address == curr_channel.initiator) {
            dispatch(currentChannel({
                "identity": "initiator", 
                "spendable_amount": curr_account.ledger.latest_initiator_bal
            }))
        } else if (curr_account.address == curr_channel.recipient) {
            dispatch(currentChannel({
                "identity": "recipient", 
                "spendable_amount": curr_account.ledger.latest_recipient_bal
            }))
        }
    })

    const calculateTimeLeft = () => {
        let difference = +new Date() - +new Date(curr_channel.status_expiry)
        let timeLeft = {};

        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          };
        }

        return timeLeft
    }



    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
    const [closeChannelState, setCloseChannelState] = useState(() => {
        if (["LK", "INIT"].includes(curr_channel.status)) {
            return 1
        } else {
            return 0
        }
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer)
    })

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if(!timeLeft[interval]) {
            return;
        }

        timerComponents.push(
            <span>
                {timeLeft[interval]} {interval}{" "}
            </span>
        );
    });

    const clickChannelInitClose = async () => {

        if(curr_channel.status == "LK") {

        } else if (curr_channel.status == "INIT") {
            function call_close_channel() {
                return new Promise(function (resolve) {
                    const targetAddr = () => {
                        if(curr_channel.identity == "recipient") {
                            return curr_channel.initiator
                        } else {
                            return curr_channel.recipient
                        }
                    }
                    const data = fetch('<endpoint_name>', {
                        method: 'POST', 
                        headers: {
                            'Accept': 'application/json', 
                            'Content-Type': 'application/json', 
                            'X-CSRFToken': getCookie('csrftoken')
                        }, 
                        body: {
                            "walletAddress": curr_channel.address, 
                            "targetAddress": targetAddr
                        }
                    }).then(response => response.json())
                    .then(data => setSignature(data))
                    resolve(data)
                });
            }

            const data = await call_close_channel()
            const close_data = await curr_channel_contract.declare_close([signatureState.sig_initiator, signatureState.sig_recipient], )
        };
    }

    return (
        <Fragment>
            <h1>Channel Details</h1>
            <div className="container">
                {curr_channel.map((c) => (
                    <div className="row">
                        <div className="col-lg-4 mb-4">
                            <div className="card text-white bg-info mb-3" style="max-width: 18rem;">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Info</h5>
                                        <ul>
                                            <li key={c.address}>Address: {c.address} </li>
                                            <li key={c.address}>Status: {c.status}</li>
                                            <li>
                                                {timerComponents.length ? timerComponents : <span>Time's up!</span>}
                                            </li>
                                        </ul>
                                </div>
                        </div>

                        <div className="col-lg-4 mb-4">
                            <div className="card text-white bg-dark mb-3" style="max-width: 18rem;">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Balances</h5>
                                        <ul>
                                            <li key={c.id}>{c.initiator} balance: {c.ledger.latest_initiator_bal}</li>
                                            <li key={c.id}>{c.recipient} balance: {c.ledger.latest_recipient_bal}</li>
                                        </ul>
                                    </div>
                            </div>
                        </div>

                        <div className="col-lg-4 mb-4">
                            <div className="card text-white bg-dark mb-3" style="max-width: 18rem;">
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Pending topup balance</h5>
                                        <ul>
                                            <li key={c.id}>{c.initiator} top up balance: {c.ledger.topup_initiator_bal}</li>
                                            <li key={c.id}>{c.recipient} top up balance: {c.ledger.topup_recipient_bal}</li>
                                        </ul>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>   
                ))};
                <div className="row">
                    <MDBCol md="4">
                        <MDBFormInline className="md-form mr-auto mb-4">
                            <label>Pay through channel</label>
                            <input className="form-control mr-sm-2" type="number" min="0" max={curr_channel.spendable_amount} placeholder="Amount" aria-label="Amount" name="AmtTransfer" onChange={() => setPathAmt}/>
                            <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => clickChannelPay()}>
                            Pay
                            </MDBBtn>
                        </MDBFormInline>
                    </MDBCol>
                    <MDBCol md="4">
                        <MDBFormInline className="md-form mr-auto mb-4">
                            <label>Top up channel</label>
                            <input className="form-control mr-sm-2" type="number" min="0" placeholder="Amount" aria-label="Amount" name="AmtTransfer" onChange={() => setPathAmt}/>
                            <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => clickChannelTopUp()}>
                            Top Up
                            </MDBBtn>
                        </MDBFormInline>
                    </MDBCol>
                    <MDBCol md="4">
                        <MDBFormInline className="md-form mr-auto mb-4">
                            <label>Close Channel</label>
                            <input className="form-control mr-sm-2" type="number" min="0" placeholder="Amount" aria-label="Amount" name="AmtTransfer" onChange={() => setPathAmt}/>
                            {!closeChannelState && <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => clickChannelInitClose()}>
                            Close
                            </MDBBtn>}
                        </MDBFormInline>
                    </MDBCol>
                </div>
            </div>
        </Fragment>
    );
};