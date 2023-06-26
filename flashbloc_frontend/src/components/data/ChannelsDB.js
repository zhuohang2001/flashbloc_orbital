import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'

import { addChannel, currentChanne, editCurrChannelWithinChannels } from '../../state_reducers/ChannelReducer';
import { toggleChannelComponent } from '../../state_reducers/ChannelComponentReducer';
import { create_channel } from '../../contract_methods/factory_methods.js';
import { recepient_initiate, declare_close_channel, close_now_channel } from '../../contract_methods/channel_methods.js';
import channel_abi from '../abi/contract_abi.json';



const ContainerPage = () => {
  const contracts_info = useSelector((state) => state.factory.value)
  const loginAccount = useSelector((state) => state.loginAccount.value.current.walletAddress); //get from global state 
  const dispatch = useDispatch()
  console.log(dispatch)
  useEffect(() => {
    axiosInstance.get(`http://localhost:8000/api/channelstate/get_userChannels/?walletAddress=${loginAccount}`)
      .then((response) => response.data)
      .then(data => data[0].forEach(c => {dispatch(addChannel(c))}))
      .then(setFilteredData(channels))
  }, [loginAccount]);

  const channels = useSelector((state) => state.channels.value.channels); //get from global state
  const [filteredData, setFilteredData] = useState(channels);

  const [wordEntered, setWordEntered] = useState("");
  const [searchQuery, setSearchQuery] = useState('');


//   function clickDetailChannel (current) {
//     dispatch(toggleChannelComponent({
//         listChannelComponent: false, 
//         detailChannelComponent: true, 
//     }))
//     dispatch(currentChannel({'address': current}))
// }

const handleFilter = () => {
  const newFilter = channels.filter((value) => { //check if filter works
    return value.channel_address.toLowerCase().includes(searchQuery.toLowerCase());
  });
  if (searchQuery === "") {
    setFilteredData(channels);
  } else {
    setFilteredData(newFilter);
  }

}; //will need to be expanded to also allow address search

useEffect(() => handleFilter(), [channels])

  // const handleSearchChannel = () => {
  //   // Perform search logic here
  //   console.log(loginAccount)
  //   console.log('hi')
  //   // You can filter the paymentStatuses array based on the searchQuery
  //   // Update the filtered results to display in the respective containers
  //   axiosInstance.get(`channelstate/get_targetChannel/?currAddress=${loginAccount}&q=${searchQuery}`)
  //     .then((response) => {
  //       console.log(response)
  //     })
  // };
  const handleChannelApproval = (item) => {
    // item['status'] = "APV"
    axiosInstance
        .patch(`channelstate/approveChannel/`, {
          currAddress: item.recipient, 
          targetAddress: item.initiator
        })
        .then((res) => dispatch(editCurrChannelWithinChannels(item))) //how to change curr channel state
  }

  const handleChannelCreate = async (item) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const channel_address = await Promise.resolve(create_channel(contracts_info.factory, contracts_info.channel_abi, signer, item, item.recipient, loginAccount))
    console.log(channel_address)
  }

  const handleChannelInit = async (item) => {
    // item['status'] = "OP"
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    // const channelContract = new ethers.Contract(item.channel_address, channel_abi, signer)
    console.log("channel abi")
    console.log(contracts_info)
    const channelContract = new ethers.Contract("0xED3AeE0d5f240889836A1964D426dFF408fD846d", channel_abi, signer)
    // recepient_initiate(channelContract, item.ledger.latest_recipient_bal)
    await channelContract.recepient_init({value: 1000000000000000})
      .then(
        axiosInstance
        .patch(`channelstate/initializeChannel/`, {
          currAddress: item.recipient, 
          targetAddress: item.initiator, 
          channelAddress: item.channel_address
        })
        .then((res) => dispatch(editCurrChannelWithinChannels(item)))
      )

  }
 
  const handleChannelTransfer = () => {}

  const handleDeclareClose = async (item) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner() 
    // item['status'] = "LK"
    var tarAcc = item.initiator
    if (item.initiator == loginAccount) {
      tarAcc = item.recipient
    }
    const channelContract = new ethers.Contract(item.channel_address, channel_abi, signer)
    declare_close_channel(channelContract, "sigs", item)
      .then(
        axiosInstance
        .patch(`channelstate/declareCloseChannel/`, {
          currAddress: loginAccount, 
          targetAddress: tarAcc, 
          channelAddress: item.channel_address
        })
        .then((res) => dispatch(editCurrChannelWithinChannels(item)))
      )
  }

  const handleCloseChannel = (item) => {
    // item['status'] = "CD"
    var tarAcc = loginAccount
    if (item.initiator == loginAccount) {
      tarAcc = item.recipient
    }
    const channelContract = new ethers.Contract(item.channel_address)
    close_now_channel(channelContract)
    .then(
      axiosInstance
      .patch(`channelstate/closeChannel/`, {
        currAddress: loginAccount, 
        targetAddress: tarAcc, 
        channelAddress: item.channel_address
      })
      .then((res) => dispatch(editCurrChannelWithinChannels(item)))
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', marginTop: '35px'}}>
        <input
          type="text"
          className="form-control"
          style={{ width: '50%' }}
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleFilter} style={{ marginLeft: '10px' }}>
          Search
        </button>
      </div>
      <div style={{ display: 'flex', margin: '20px', flexWrap: 'wrap', flexDirection: 'row', flex: 1 }}>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px'
          }}
        >
          <h2 style={{ color: 'black' }}>Pending Approval</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll', flexWrap: 'wrap', flexDirection: 'row', width: '500px', flex: 1 }}>
            {filteredData
              .filter(item => item.status == "RQ")
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  {item.recipient} - {item.status}
                  <button className="btn btn-primary" onClick={() => handleChannelApproval(item)} style={{ marginLeft: '50px' }}>
                    Approve Channel
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px', 
          }}
        >
          <h2 style={{ color: 'black' }}>Pending Creation</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll', flexWrap: 'wrap', flexDirection: 'row', width: '500px', flex: 1 }}>
            {filteredData
              .filter(item => item.status == "APV" & item.initiator == loginAccount)
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  {item.recipient} - {item.status}
                  <button className="btn btn-primary" onClick={() => handleChannelCreate(item)} style={{ marginLeft: '50px' }}>
                    Init Channel
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px', 
          }}
        >
          <h2 style={{ color: 'black' }}>Pending Initialization</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll', flexWrap: 'wrap', flexDirection: 'row', width: '500px', flex: 1 }}>
            {filteredData
              .filter(item => item.status == "OP")
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  {item.recipient} - {item.status}
                  <button className="btn btn-primary" onClick={() => handleChannelInit(item)} style={{ marginLeft: '50px' }}>
                    Init Channel
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
        <h2 style={{ color: 'black' }}>Active Channel</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll', flexWrap: 'wrap', flexDirection: 'row', width: '500px', flex: 1 }}>
            {filteredData
              .filter(item => item.status === "INIT")
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <span>{item.recipient} - {item.status}</span>
                  <button className="btn btn-primary" onClick={() => handleChannelTransfer(item)} style={{ marginLeft: '90px' }}>
                    Transfer
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleDeclareClose(item)} style={{ marginLeft: '10px' }}>
                    Declare Close
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <h2 style={{ color: 'black' }}>Pending Close</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll', flexWrap: 'wrap', flexDirection: 'row', width: '500px' }}>
            {filteredData
              .filter(item => item.status == "LK")
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  {item.recipient} - {item.status}
                  <button className="btn btn-primary" onClick={() => handleCloseChannel(item)} style={{ marginLeft: '50px' }}>
                    Close Now
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerPage;
