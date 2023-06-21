import React, { Component, Fragment, useState } from 'react';
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

import channel_abi from '../abi/contract_abi.json';

export class CreateChannelForm extends Component {
    csrf = getCookie('csrftoken')
    
    state = {
        name:'', 
        image:'', 
        price:'', 
        address:'', 
        tokenId:'', 
        description:'', 
        duration:'',
      };

    onChange = (e) => this.setState({[e.target.name]: e.target.value});

    handleSubmit = async () => {
        //call create channel mtd on factory --> await event and return when resolved promise -->show success tab --> replace form with channel tab

        const contracts_info = this.props.contracts
        const target_account = this.props.curr_account
        const user_account = this.props.user_account
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        // const channel_address = await Promise.resolve(create_channel(contracts_info.factory, contracts_info.channel_abi, signer, this.state, target_account, user_account))
        const channel_address = await Promise.resolve(create_channel(contracts_info.factory, contracts_info.channel_abi, signer, this.state, "0xed2bf05A1ea601eC2f3861F0B3f3379944FAdB12", "0xdf09aA84d23Cc649B557f8B107a676dACaAd228e"))
        console.log(channel_address)
        this.props.addAccountChannel({"channel": channel_address})
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

    // onSubmit = async (e) => {
    //     e.preventDefault();
    //     const Address = await this.getContractInformation(this.state.duration, this.state.price)
    //     this.setState({['address']: Address})
    //     this.setState({['image']: URL.createObjectURL(this.state.image)})
    //     const { name, image, price, address, tokenId, description, duration } = this.state;
    //     const proposal  = { name, price, address, description, image }
    //     console.log(address, 'THIS IS CURRENT ADDRESS')
    //     this.props.addProposal(proposal)
    //     console.log('proposal added')
    //     this.setState({
    //         name:'', 
    //         image:'', 
    //         price:'', 
    //         address:'', 
    //         tokenId:'', 
    //         description:'', 
    //         duration:'',
    //     });
    // };

    // getContractInformation = async (Duration, Price) => {

    //         var time = 100;
    //         const initFields = this.props.data
    //         const factory = initFields.factory
    //         let tempProvider = new ethers.providers.Web3Provider(window.ethereum)
    //         let tempSigner = tempProvider.getSigner()
    //         const Address = await Promise.resolve(newChannelAddress(factory, initFields.project_abi, initFields.signer, this.state)) // need to resolve promise as async function returns Promise
    //         console.log("getcontract info " + Address)
    //         return Address

    // };
    

    render() {//modify search name field to filter for recipient account obj
    return (
        <Fragment>
            <div>
                <h2>Create Channel</h2>
                <br></br>
                <form class="needs-validation" novalidate>
                    <div class="col-lg-4 mb-4">
                        <label for="validationCustom01">My amount</label>
                        <input type="number" className="form-control" id="validationCustom01" placeholder="Choose Amount" name="user_amount" onChange={this.onChange} required/>
                        <div class="valid-feedback">
                            Looks good!
                        </div>
                    </div>

                    <div class="col-lg-4 mb-4">
                        <label for="validationCustom01">Other party expected amount</label>
                        <input type="number" className="form-control" id="validationCustom01" placeholder="Choose Amount" name="target_amount" onChange={this.onChange} required/>
                        <div class="valid-feedback">
                            Looks good!
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <label for="validationCustom01">Expiry date</label>
                        <input type="date" className="form-control" id="validationCustom01" placeholder="Enter date" name="expiration_date" onChange={this.onChange} required/>
                        <div class="valid-feedback">
                            Looks good!
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required/>
                            <label class="form-check-label" for="invalidCheck">
                                Agree to terms and conditions
                            </label>
                            <div class="invalid-feedback">
                                You must agree before submitting.
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-primary" type="submit" onClick={e => {e.preventDefault(); this.handleSubmit()}}>Submit form</button>
                </form>
            </div>
            <br></br>
            <div>
                <button class="btn btn-secondary" type="submit" onClick={e => {e.preventDefault(); this.handleSubmitRecep()}}>Recipient init</button>
            </div>
            <br></br>
            <div>
                <button class="btn btn-secondary" type="submit" onClick={e => {e.preventDefault(); this.handleDeclareClose()}}>Declare close</button>
            </div>
            <br></br>
            <div>
                <button class="btn btn-secondary" type="submit" onClick={e => {e.preventDefault(); this.handleCloseNow()}}>Close now</button>
            </div>
        </Fragment>
    )
                    }                 
}

const mapStateToProps = state => {
    return {
        contracts: state.factory.value, 
        curr_account: state.accounts.value.current, 
        user_account: state.accounts.value.userAccount
    }
}

export default connect(mapStateToProps, { addAccountChannel })(CreateChannelForm); //wrapper obj that contains the prop mappings and dispatchers