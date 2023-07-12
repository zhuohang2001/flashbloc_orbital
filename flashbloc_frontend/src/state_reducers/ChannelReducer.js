import { createSlice, findNonSerializableValue } from '@reduxjs/toolkit'
import { notInitialized } from 'react-redux/es/utils/useSyncExternalStore';

const initialStateValue = {
    channels: [], 
    current: { //fields to be updated
        initiator: "", 
        recipient: "", 
        status: "", 
        total_balance: 0.0, 
        channel_address: "", 
        ledger: {
            locked_initiator_bal: 0.0, 
            locked_recipient_bal: 0.0, 
            latest_initiator_bal: 0.0, 
            latest_recipient_bal: 0.0, 
            topup_initiator_bal: 0.0, 
            topup_recipient_bal: 0.0, 
            ptp_initiator_bal: 0.0, 
            ptp_recipient_bal: 0.0, 
        }
    }
}

export const ChannelSlice = createSlice({
    name:"channels", 
    initialState: {value: initialStateValue}, 
    reducers: {
        addChannel: (state, action) => {
            state.value.channels = [...state.value.channels, action.payload] //appends new instances of obj to existing list of objs
        }, 

        assignChannels: (state, action) => {
            state.value.channels = action.payload
        }, 

        editCurrChannelWithinChannels: (state, action) => {
            const channels = state.value.channels;
            const channelIdx = channels.findIndex(c => c.recipient === action.payload.recipient);
        
            const channelObj = channels[channelIdx];
            var stat = null
            if (channelObj.status == "RQ") {
                stat = "APV"
            } else if (channelObj.status == "APV") {
                stat = "OP"
            } else if (channelObj.status == "OP") {
                stat = "INIT"
            } else if (channelObj.status == "INIT") {
                stat = "LK"
            } else {
                stat = "CD"
            }
            const newChannelObj = { ...channelObj, status: stat };
        
            const head = channels.slice(0, channelIdx - 1);
            const tail = channels.slice(channelIdx + 1);
            state.value.channels = [...head, newChannelObj, ...tail];
        }, 

        editCurrChannelWithinChannelsChannelAddr: (state, action) => {
            const channels = state.value.channels;
            const channelIdx = channels.findIndex(c => c.recipient === action.payload.curr.recipient);
        
            const channelObj = channels[channelIdx];
            var newChannelObj = channelObj
            var stat = null
            if (channelObj.status == "APV") {
                newChannelObj = { ...channelObj, channel_address: action.payload.new_channel_addr };
            }
            const head = channels.slice(0, channelIdx - 1);
            const tail = channels.slice(channelIdx + 1);
            state.value.channels = [...head, newChannelObj, ...tail];
        }, 

        currentChannel: (state, action) => {
            state.value.current = Object.assign({}, state.value.current, action.payload) //appends extra info to an instance of obj, merges dict based on newest info
        }, 

        resetCurrentChannel: (state, action) => {
            state.value.current = action.payload
        }, 

        editCurrentChannelPay: (state, action) => {
            if (action.payload.identity == "initiator") {
                state.value.current = { 
                    ...state.value.current, 
                    ledger: {
                        ...state.value.current.ledger, 
                        latest_recipient_bal: parseInt(state.value.current.ledger.latest_recipient_bal) + parseInt(action.payload.amt), 
                        latest_initiator_bal: parseInt(state.value.current.ledger.latest_initiator_bal) + parseInt(state.value.current.ledger.ptp_initiator_bal) + parseFloat(state.value.current.ledger.topup_initiator_bal) - parseInt(action.payload.amt), 
                        locked_initiator_bal: parseInt(state.value.current.ledger.latest_initiator_bal) + parseInt(state.value.current.ledger.ptp_initiator_bal) + parseFloat(state.value.current.ledger.topup_initiator_bal) - parseInt(action.payload.amt)
                    }
                };
            } else if (action.payload.identity == "recipient") {
                state.value.current = { 
                    ...state.value.current, 
                    ledger: {
                        ...state.value.current.ledger, 
                        latest_initiator_bal: parseInt(state.value.current.ledger.latest_initiator_bal) + parseInt(action.payload.amt), 
                        latest_recipient_bal: parseInt(state.value.current.ledger.latest_recipient_bal) + parseInt(state.value.current.ledger.ptp_recipient_bal) + parseInt(state.value.current.topup_recipient_bal) - parseInt(action.payload.amt), 
                        locked_recipient_bal: parseInt(state.value.current.ledger.latest_recipient_bal) + parseInt(state.value.current.ledger.ptp_recipient_bal) + parseInt(state.value.current.topup_recipient_bal) - parseInt(action.payload.amt)
                    }
                };
            }
        }, 

        editCurrentChannelTopup: (state, action) => {
            if (action.payload.identity == "initiator") {
                state.value.current = { 
                    ...state.value.current, 
                    total_balance: state.value.current.total_balance + action.payload.amt, 
                    ledger: {...state.value.current.ledger, topup_initiator_bal: state.value.current.ledger.topup_initiator_bal + action.payload.amt}
                };
            } else if (action.payload.identity == "recipient") {
                state.value.current = { 
                    ...state.value.current, 
                    total_balance: state.value.current.total_balance + action.payload.amt, 
                    ledger: {...state.value.current.ledger, topup_recipient_bal: state.value.current.ledger.topup_recipient_bal + action.payload.amt}
                };
            }
        }
    }
    }, 
);

export const { addChannel, currentChannel, resetCurrentChannel, editCurrChannelWithinChannels, assignChannels , 
    editCurrChannelWithinChannelsChannelAddr, editCurrentChannelPay, editCurrentChannelTopup }  = ChannelSlice.actions;

export default ChannelSlice.reducer;