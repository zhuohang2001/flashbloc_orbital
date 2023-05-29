import { createSlice } from '@reduxjs/toolkit'


const initialStateValue = {
    accounts: [], 
    filteredAccounts: [], 
    current: { //fields to be updated
        email: '', 
        address: '', 
        created_at: '', 
        channel: ''
    }
}

export const AccountSlice = createSlice({
    name:"accounts", 
    initialState: {value: initialStateValue}, 
    reducers: {
        addAccountChannel: (state, action) => {
            state.value.current = Object.assign({}, state.value.channelComponent, action.payload)
        },

        addAccount: (state, action) => {
            state.value.accounts = [...state.value.accounts, action.payload] //appends new instances of obj to existing list of objs
        }, 

        currentAccount: (state, action) => {
            state.value.current = Object.assign({}, state.value.current, action.payload) //appends extra info to an instance of obj, merges dict based on newest info
        }, 

        setFilteredAccount: (state, action) => {
            state.value.filteredAccounts = [action.payload]
        }, 

        addFilteredAccount: (state, action) => {
            state.value.filteredAccounts = [...state.value.filteredAccounts, action.payload] //appends new instances of obj to existing list of objs
        }, 

        resetFilteredAccount: (state, action) => {
            state.value.filteredAccounts = [] //appends new instances of obj to existing list of objs
        }, 
    }
    }, 
);

export const { addAccountChannel, addAccount, currentAccount, setFilteredAccount, addFilteredAccount, resetFilteredAccount }  = AccountSlice.actions;

export default AccountSlice.reducer;