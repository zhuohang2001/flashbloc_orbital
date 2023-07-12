import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'
import { useNavigate } from "react-router-dom";

import { addChannel, currentChannel, editCurrChannelWithinChannels, assignChannels, 
  editCurrChannelWithinChannelsChannelAddr } from '../../state_reducers/ChannelReducer';
import { currentAccount } from '../../state_reducers/AccountReducer';
import { toggleDetailComponent } from '../../state_reducers/DetailComponentReducer';
import { create_channel } from '../../contract_methods/factory_methods.js';
import { recepient_initiate, declare_close_channel, close_now_channel, challenge_close_channel } from '../../contract_methods/channel_methods.js';
import channel_abi from '../abi/contract_abi.json';
import { sign_latest_tx } from '../utils';




const ContainerPage = () => {

  const contracts_info = useSelector((state) => state.factory.value)
  const loginAccount = useSelector((state) => state.loginAccount.value.current.walletAddress); //get from global state 
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const channels = useSelector((state) => state.channels.value.channels); //get from global state
  const [filteredData, setFilteredData] = useState([]);

  const [wordEntered, setWordEntered] = useState("");
  const [searchQuery, setSearchQuery] = useState('');

  const handleClickPay = (item) => {
    axiosInstance.get(`channelstate/get_targetChannel/?currAddress=${loginAccount}&q=${item.wallet_address}`)
        .then((response) => {
          console.log(response)
          const chan = response.data
            if (chan.initiator == null && chan.recipient == null) {
                dispatch(currentAccount(item))
                navigate("/accountDetail")
                console.log("channel not exists")
            } else {
                dispatch(currentChannel(chan))
                navigate("/channelDetail")
                console.log("channel exists")
            }
        })
  }

  const handleSearchAccounts = (e) => {
    axiosInstance.get(`user/searchedAccounts/?q=${searchQuery}`)
        .then((response) => response.data)
        // .then((arr) => JSON.parse(arr))
        .then((data) => {
            console.log(data)
            setFilteredData(data)
        })
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
        <button className="btn btn-primary" onClick={handleSearchAccounts} style={{ marginLeft: '10px' }}>
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
          <h2 style={{ color: 'black' }}>Filtered Accounts</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll', flexWrap: 'wrap', flexDirection: 'row', width: '500px', flex: 1 }}>
            {filteredData
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  {item.user_name} - {item.wallet_address}
                  <button className="btn btn-primary" onClick={() => handleClickPay(item)} style={{ marginLeft: '50px' }}>
                    Make Transaction
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