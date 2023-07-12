import React, { Component, Fragment, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { addProposal } from '../../state_reducers/ContractReducer';
import { connect, useSelector } from 'react-redux';
import { ethers } from 'ethers'
// import project_abi from '../project_abi.json'
import getCookie from '../../csrf.js'
import { create_channel } from '../../contract_methods/factory_methods.js';
import { recepient_initiate, declare_close_channel, close_now_channel } from '../../contract_methods/channel_methods.js';

import "regenerator-runtime/runtime.js";
import { useDispatch } from 'react-redux';
import { Form } from "react-bootstrap";
import { addAccountChannel } from '../../state_reducers/AccountReducer.js';
import { currentChannel } from '../../state_reducers/ChannelReducer.js';
import axiosInstance from '../axios';
import channel_abi from '../abi/contract_abi.json';
import axios from 'axios';


export class CreateChannelForm extends Component {
    csrf = getCookie('csrftoken')
    
    state = {
        curr_username:'', 
        target_email:'', 
        price:'', 
        curr_address:'', 
        tokenId:'', 
        description:'', 
        duration:'',
        searchQuery: '', 
        target_address: '', 
        target_username: '', 
        target_amount: 0, 
        curr_amount: 0
      };

    onChange = (e) => this.setState({[e.target.name]: e.target.value});

    handleSearch = (e) => {
        //will need to have dropdown to select
        axiosInstance.get(`user/searchedAccounts/?q=${this.state.searchQuery}`)
            .then((response) => response.data)
            .then(data => {
                this.state.target_username = data[0].user_name
                this.state.target_address = data[0].wallet_address
                this.state.target_email = data[0].email
                this.props.currentChannel({
                    "walletAddress": this.props.login_account.walletAddress, 
                    "targetAddress": data[0].wallet_address, 
                    "targetEmail": data[0].email
                })
            })
        console.log('curr state')
        console.log(this.state)

      };

    showToastSuccessMessage = () => {
        toast.success('Success Notification !', {
            position: toast.POSITION.TOP_RIGHT
        });
    };

    showToastErrorMessage = () => {
        toast.error('Error Notification !', {
            position: toast.POSITION.TOP_CENTER
        });
    };

    handleReqChannel = () => {
        console.log(this.props)
        console.log(this.props.login_account.walletAddress)
        console.log(this.state)
        axiosInstance
            .post(`channelstate/reqChannel/`, {
                walletAddress: this.props.login_account.walletAddress, 
                targetAddress: this.state.target_address, 
                initiatorBalance: this.state.curr_amount, 
                recipientBalance: this.state.target_amount, 
                targetEmail: this.state.target_email
            })
            .then((response) => response.data)
            .then((data) => {
                if (data.initiator != null && data.initiator != null){
                    this.showToastSuccessMessage()
                    console.log("create success")
                } else {
                    this.showToastErrorMessage()
                    console.log("create fail")
                }
            })
    }

    handleSubmitRecep = async () => {
        //call create channel mtd on factory --> await event and return when resolved promise -->show success tab --> replace form with channel tab
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const channelContract = new ethers.Contract("0x410E823A7D897Fb5d923EeAB7aCB62f7D71d40bD", channel_abi, signer) //contract shd be saved on state
        const channel_address = await Promise.resolve(recepient_initiate(channelContract, channel_abi, signer, this.state, "0x9CF10B269d534F37f75450D7dC6bEfE64378797f")) //addr has to be party B
    }

    handleDeclareClose = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const channelContract = new ethers.Contract("0x410E823A7D897Fb5d923EeAB7aCB62f7D71d40bD", channel_abi, signer) //contract shd be saved on state
        await Promise.resolve(declare_close_channel(channelContract))
    }

    handleCloseNow = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const channelContract = new ethers.Contract("0x410E823A7D897Fb5d923EeAB7aCB62f7D71d40bD", channel_abi, signer) //contract shd be saved on state
        await Promise.resolve(close_now_channel(channelContract))
    }

    render() {//modify search name field to filter for recipient account obj
    return (
        <Fragment>
            <div>
                <br />
                <h2 style={{ color: 'white', textAlign: 'center' }}>Create Channel: {this.props.curr_channel.targetAddress}</h2>
                <br></br>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <div className="col-lg-4 mb-4" style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="text" className="form-control" id="validationCustom01" placeholder="Search" name="searchQuery" onChange={this.onChange} value={this.state.searchQuery} required style={{ marginRight: '10px' }} />
                    <button className="btn btn-primary" type="submit" onClick={this.handleSearch}>Search</button>
                    </div>
                </div>
                <br></br>
                <form class="needs-validation" novalidate>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <div class="col-lg-4 mb-4">
                        <label for="validationCustom01" style={{ color: 'white' }}>My Deposit</label>
                        <input type="number" className="form-control" id="validationCustom01" placeholder="Choose Amount" name="curr_amount" onChange={this.onChange} required/>
                        <div class="valid-feedback" style={{ color: 'white' }}>
                            Looks good!
                        </div>
                    </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px' }}>
                    <div class="col-lg-4 mb-4">
                        <label for="validationCustom01" style={{ color: 'white' }}>Other party expected Deposit</label>
                        <input type="number" className="form-control" id="validationCustom01" placeholder="Choose Amount" name="target_amount" onChange={this.onChange} required/>
                        <div class="valid-feedback">
                        Looks good!
                        </div>
                    </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <div class="col-lg-4 mb-4">
                        <label for="validationCustom01" style={{ color: 'white' }}>Expiry date</label>
                        <input type="date" className="form-control" id="validationCustom01" placeholder="Enter date" name="expiration_date" onChange={this.onChange} required/>
                        <div class="valid-feedback" style={{ color: 'white' }}>
                            Looks good!
                        </div>
                    </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px' }}>
                    <div class="form-group">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required/>
                            <label class="form-check-label" for="invalidCheck" style={{ color: 'white' }}>
                                Agree to terms and conditions
                            </label>
                            <div class="invalid-feedback" style={{ color: 'white' }}>
                                You must agree before submitting.
                            </div>
                        </div>
                    </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button class="btn btn-primary" type="submit" onClick={e => {e.preventDefault(); this.handleReqChannel()}}>Submit form</button>
                        <ToastContainer/>
                    </div>
                </form>
                </div>
            
        </Fragment>
    )
                    }                 
}


const mapStateToProps = state => {
    return {
        contracts: state.factory.value, 
        curr_account: state.accounts.value.current, 
        user_account: state.accounts.value.userAccount, 
        login_account: state.loginAccount.value.current, 
        curr_channel: state.channels.value.current
    }
}

export default connect(mapStateToProps, { addAccountChannel, currentChannel })(CreateChannelForm); //wrapper obj that contains the prop mappings and dispatchers