import React, { Component } from 'react';
import {ethers} from 'ethers'
import { connect } from 'react-redux';
import { addFactory } from '../state_reducers/ContractReducer';
import factory_abi from './abi/factory_contract_abi.json';
import channel_abi from './abi/contract_abi.json';
import { FcApproval } from "react-icons/fc";



// const contractAddress="0xFF77da1E6AA29eFB9C6d995A01B29e1AeeF70D25";\

// const contractAddress="0x72A3E31CB421d8f99AA28e1bbcDF9dE2F1FBa697";
// const contractAddress="0x6B1F9291BE3064A989e9591c4c5C235E96C4Be7B";

const contractAddress="0xD211b020475af9e9B1F9Bbfa034ABF930f177A72";

export class Contract extends Component {
  constructor (props) {
    super(props)
    this.state = {
      defaultAccount: null, 
      // provider: null, 
      signer: null, 
      factory: null, 
      // factory_abi: null, 
      // project_abi: null, 
  }
  }

  componentDidMount() {
    this.connectWalletHandler();
    console.log("connected haha")
  }


    connectWalletHandler = () => {
        if (window.ethereum) {
          console.log('uhh')
          console.log(window.ethereum)
          window.ethereum.request({method: 'eth_requestAccounts'})
          .then(result => {this.accountChangedHandler(result[0]);
          document.getElementById('wallet-btn').innerHTML('Wallet connected!');
        })
        ;
      }
        // else {setErrorMessage('Install MetaMask');}
      }

    accountChangedHandler = (newAccount) => {
      if(this.props.currLoginAccount.walletAddress.toLowerCase() == newAccount) {
        this.setState({['defaultAccount']: newAccount});
        this.updateEthers();
      } else {
        console.log('INVALID ACCOUNT')
      }
    }
      

      /////////Getting an instance of the contract////////////
    updateEthers = () => {
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        this.setState({['provider']: tempProvider});
      
        let tempSigner = tempProvider.getSigner();
        this.setState({['signer']: tempSigner});
        // this.setState({['factory_abi']: factory_abi});
        // this.setState({['channel_abi']: channel_abi});
        let tempContract = new ethers.Contract(contractAddress, factory_abi, tempSigner); //creates new instance of contract of deployed contract
        this.setState({['factory']: tempContract}, () => {
          this.props.addFactory(this.state);
        });
        console.log(this.state)
        // console.log('STATE')
        // console.log(tempContract)
        // this.props.addFactory(this.state)
      }

      // check what cannot be saved under state, for now seems like (contract, abi, factory) ; what form is provider in? is it an obj or a str?; can objs be saved?
      render() {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {this.state.factory && (<h2 style={{ marginLeft: '10px', position: 'relative',
    top: '-33px', }}>
                Wallet connected!
                <FcApproval/>
              </h2>
              )}
            </div>
          );
      }
}

const mapStateToProps = state => {
  return {
      currLoginAccount:  state.loginAccount.value.current, 
  }
}

export default connect(mapStateToProps, { addFactory })(Contract);
