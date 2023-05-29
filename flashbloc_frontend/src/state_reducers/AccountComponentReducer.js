import { createSlice } from '@reduxjs/toolkit'

const initialStateValue = {
    listAccountComponent: true, 
    detailAccountComponent: false
}

export const AccountComponentSlice = createSlice({
    name:"accountComponent", 
    initialState: {value: initialStateValue}, 

        toggleChannelComponent: (state, action) => {
            state.value.accountComponent = Object.assign({}, state.value.accountComponent, action.payload) //appends extra info to an instance of obj, merges dict based on newest info
        }
    }
);

export const { toggleAccountComponent }  = AccountComponentSlice.actions;

export default AccountComponentSlice.reducer;