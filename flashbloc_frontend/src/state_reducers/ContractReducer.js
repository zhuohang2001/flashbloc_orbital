import { createSlice } from '@reduxjs/toolkit'

const initialStateValue = {
    defaultAccount: null, 
    signer: null, 
    factory: null, 
}

export const FactorySlice = createSlice({
    name:"factory", 
    initialState: {value: initialStateValue}, 
    reducers: {
        addFactory: (state, action) => {
            state.value = action.payload
        }, 
        }
    }, 
);

export const { addFactory }  = FactorySlice.actions;

export default FactorySlice.reducer;