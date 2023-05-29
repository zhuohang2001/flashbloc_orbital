import { createSlice } from '@reduxjs/toolkit'

const initialStateValue = {
    current: { //fields to be updated
        email: '', 
        username: '', 
        walletAddress: ''
    }, 
    login: false
}

export const LoginAccountSlice = createSlice({
    name:"loginAccount", 
    initialState: {value: initialStateValue}, 
    reducers: {

        currentLoginAccount: (state, action) => {
            state.value.current = action.payload //appends extra info to an instance of obj, merges dict based on newest info
        }, 

        resetLoginAccount: (state, action) => {
            state.value.current = {
                email: '', 
                username: '', //should have channel address
                walletAddress: ''
            } //appends new instances of obj to existing list of objs
        }, 

        toggleLoginState: (state, action) => {
            state.value.login = action.payload
        }
    }
    }, 
);

export const { currentLoginAccount, resetLoginAccount, toggleLoginState }  = LoginAccountSlice.actions;

export default LoginAccountSlice.reducer;
