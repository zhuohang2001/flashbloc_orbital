import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { currentChannel } from '../../state_reducers/ChannelReducer'
import { Contract, ethers } from 'ethers'
import contract_abi from '../abi/factory_contract_abi.json'

import getCookie from '../../csrf'
import { MDBCol, MDBIcon, MDBFormInline, MDBBtn } from "mdbreact";



const ChannelDetail = () => {
    // const dispatch = useDispatch()
    // const loginAccount = useSelector((state) => state.loginAccount.value.current.walletAddress); //get from global state 
    // const [signatureState, setSignature] = useState("")
    // const curr_channel = useSelector((state) => state.channels.value.current)
    // const curr_account = useSelector((state) => state.accounts.value.current)
    // let tempProvider = new ethers.providers.Web3Provider(window.ethereum)
    // let tempSigner = tempProvider.getSigner()
    // // const curr_channel_contract = new ethers.Contract(curr_channel.address, contract_abi, tempSigner)
    // const curr_channel_contract = null

    // useEffect(() => {
    //     if (curr_account.address == curr_channel.initiator) {
    //         dispatch(currentChannel({
    //             "identity": "initiator", 
    //             "spendable_amount": curr_account.ledger.latest_initiator_bal
    //         }))
    //     } else if (curr_account.address == curr_channel.recipient) {
    //         dispatch(currentChannel({
    //             "identity": "recipient", 
    //             "spendable_amount": curr_account.ledger.latest_recipient_bal
    //         }))
    //     }
    // })

    // const calculateTimeLeft = () => {
    //     let difference = +new Date() - +new Date(curr_channel.status_expiry)
    //     let timeLeft = {};

    //     if (difference > 0) {
    //       timeLeft = {
    //         days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    //         hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    //         minutes: Math.floor((difference / 1000 / 60) % 60),
    //         seconds: Math.floor((difference / 1000) % 60)
    //       };
    //     }

    //     return timeLeft
    // }



    // const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
    // const [closeChannelState, setCloseChannelState] = useState(() => {
    //     if (["LK", "INIT"].includes(curr_channel.status)) {
    //         return 1
    //     } else {
    //         return 0
    //     }
    // })

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setTimeLeft(calculateTimeLeft());
    //     }, 1000);

    //     return () => clearTimeout(timer)
    // })

    // const timerComponents = [];

    // Object.keys(timeLeft).forEach((interval) => {
    //     if(!timeLeft[interval]) {
    //         return;
    //     }

    //     timerComponents.push(
    //         <span>
    //             {timeLeft[interval]} {interval}{" "}
    //         </span>
    //     );
    // });

    // const clickChannelInitClose = async () => {

    //     if(curr_channel.status == "LK") {

    //     } else if (curr_channel.status == "INIT") {
    //         function call_close_channel() {
    //             return new Promise(function (resolve) {
    //                 const targetAddr = () => {
    //                     if(curr_channel.recipient == loginAccount) {
    //                         return curr_channel.initiator
    //                     } else {
    //                         return curr_channel.recipient
    //                     }
    //                 }
    //                 const data = fetch('<endpoint_name>', {
    //                     method: 'POST', 
    //                     headers: {
    //                         'Accept': 'application/json', 
    //                         'Content-Type': 'application/json', 
    //                         'X-CSRFToken': getCookie('csrftoken')
    //                     }, 
    //                     body: {
    //                         "walletAddress": curr_channel.channel_address, 
    //                         "targetAddress": targetAddr
    //                     }
    //                 }).then(response => response.json())
    //                 .then(data => setSignature(data))
    //                 resolve(data)
    //             });
    //         }

    //         const data = await call_close_channel()
    //         const close_data = await curr_channel_contract.declare_close([signatureState.sig_initiator, signatureState.sig_recipient], )
    //     };
    // }

    return (
        <Fragment>
            <h1>Channel Details</h1>
            <div className="container">
                    <div className="row">
                        <div className="col-lg-4 mb-4">
                            <div className="card textPrimary bg-info mb-3" style={{maxWidth: "18rem"}}>
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Info</h5>
                                        <ul>
                                            {/* <li key={curr_channel.channel_address}>Address: {curr_channel.channel_address} </li>
                                            <li key={curr_channel.address}>Status: {curr_channel.status}</li> */}
                                            <li>
                                                {/* {timerComponents.length ? timerComponents : <span>Time's up!</span>} */}
                                            </li>
                                        </ul>
                                </div>
                        </div>

                        <div className="col-lg-4 mb-4">
                            <div className="card textPrimary bg-dark mb-3" style={{maxWidth: "18rem"}}>
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Account Balances</h5>
                                        <ul>
                                            {/* <li key={curr_channel.id}>{curr_channel.initiator} balance: {curr_channel.ledger.latest_initiator_bal}</li>
                                            <li key={curr_channel.id}>{curr_channel.recipient} balance: {curr_channel.ledger.latest_recipient_bal}</li> */}
                                        </ul>
                                    </div>
                            </div>
                        </div>

                        <div className="col-lg-4 mb-4">
                            <div className="card textPrimary bg-dark mb-3" style={{maxWidth: "18rem"}}>
                                <div className="card-header">Header</div>
                                    <div className="card-body">
                                        <h5 className="card-title">Pending topup balance</h5>
                                        <ul>
                                            {/* <li key={curr_channel.id}>{curr_channel.initiator} top up balance: {curr_channel.ledger.topup_initiator_bal}</li>
                                            <li key={curr_channel.id}>{curr_channel.recipient} top up balance: {curr_channel.ledger.topup_recipient_bal}</li> */}
                                        </ul>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>   
                <div className="row">
                    <MDBCol md="4">
                        <MDBFormInline className="md-form mr-auto mb-4">
                            <label>Pay through channel</label>
                            <input className="form-control mr-sm-2" type="number" min="0" max="10" placeholder="Amount" aria-label="Amount" name="AmtTransfer" onChange={() => ''}/>
                            <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => ''}>
                            Pay
                            </MDBBtn>
                        </MDBFormInline>
                    </MDBCol>
                    <MDBCol md="4">
                        <MDBFormInline className="md-form mr-auto mb-4">
                            <label>Top up channel</label>
                            <input className="form-control mr-sm-2" type="number" min="0" placeholder="Amount" aria-label="Amount" name="AmtTransfer" onChange={() => ''}/>
                            <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => ''}>
                            Top Up
                            </MDBBtn>
                        </MDBFormInline>
                    </MDBCol>
                    <MDBCol md="4">
                        <MDBFormInline className="md-form mr-auto mb-4">
                            <label>Close Channel</label>
                            <input className="form-control mr-sm-2" type="number" min="0" placeholder="Amount" aria-label="Amount" name="AmtTransfer" onChange={() => ''}/>
                            {/* {!closeChannelState && <MDBBtn outline color="warning" rounded size="sm" type="submit" classNameName="mr-auto" onClick={() => {}}>
                            Close
                            </MDBBtn>} */}
                        </MDBFormInline>
                    </MDBCol>
                </div>
            </div>
        </Fragment>
    );
};

export default ChannelDetail;