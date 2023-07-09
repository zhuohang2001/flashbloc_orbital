import { createSlice } from '@reduxjs/toolkit'

const initialStateValue = {
    listAccountComponent: true, 
    detailAccountComponent: false, 
    detailChannelComponent: false
}

export const DetailComponentSlice = createSlice({
    name:"DetailComponent", 
    initialState: {value: initialStateValue}, 

        toggleDetailComponent: (state, action) => {
            state.value.detailComponent = Object.assign({}, state.value.detailComponent, action.payload) //appends extra info to an instance of obj, merges dict based on newest info
        }
    }
);

export const { toggleDetailComponent }  = DetailComponentSlice.actions;

export default DetailComponentSlice.reducer;