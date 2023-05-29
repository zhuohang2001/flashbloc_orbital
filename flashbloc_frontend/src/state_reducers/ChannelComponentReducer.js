import { createSlice } from '@reduxjs/toolkit'

const initialStateValue = {
    listChannelComponent: true, 
    detailChannelComponent: false
}

export const ChannelComponentSlice = createSlice({
    name:"channelComponent", 
    initialState: {value: initialStateValue}, 

        toggleChannelComponent: (state, action) => {
            state.value.channelComponent = Object.assign({}, state.value.channelComponent, action.payload) //appends extra info to an instance of obj, merges dict based on newest info
        }
    }
);

export const { toggleChannelComponent }  = ChannelComponentSlice.actions;

export default ChannelComponentSlice.reducer;