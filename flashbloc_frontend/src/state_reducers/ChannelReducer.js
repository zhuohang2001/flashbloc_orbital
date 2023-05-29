import { createSlice, findNonSerializableValue } from '@reduxjs/toolkit'
import { notInitialized } from 'react-redux/es/utils/useSyncExternalStore';

const initialStateValue = {
    channels: [], 
    current: { //fields to be updated
        "initiator": "", 
        "recipient": "", 
        "status": "", 
        "total_balance": null, 
        "address": "", 
        "identity": "", 
        "spendable_amount": null
    }
}

export const ChannelSlice = createSlice({
    name:"channels", 
    initialState: {value: initialStateValue}, 
    reducers: {
        addChannel: (state, action) => {
            state.value.proposals = [...state.value.proposals, action.payload] //appends new instances of obj to existing list of objs
        }, 

        currentChannel: (state, action) => {
            state.value.current = Object.assign({}, state.value.current, action.payload) //appends extra info to an instance of obj, merges dict based on newest info
        }, 

        resetCurrentChannel: (state, action) => {
            state.value.current = action.payload
        }
    }
    }, 
);

export const { addChannel, currentChannel, resetCurrentChannel }  = ChannelSlice.actions;

export default ChannelSlice.reducer;