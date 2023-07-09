import React from 'react';
import ReactDOM from 'react-dom/client';
import styles from './style';


import './index.css';
// import reportWebVitals from './reportWebVitals';
import ChannelReducer from './state_reducers/ChannelReducer';
import ChannelComponentReducer from './state_reducers/ChannelComponentReducer';
import factoryReducer from './state_reducers/ContractReducer';
import AccountReducer from './state_reducers/AccountReducer';
import DetailComponentReducer from './state_reducers/DetailComponentReducer';
import LoginAccountReducer from './state_reducers/LoginAccountReducer';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.min.js";



// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>  
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import App from './components/App';
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { Route, BrowserRouter, Routes } from 'react-router-dom';

import logger from 'redux-logger'
import "regenerator-runtime/runtime.js";
// import AccountComponentReducer from './state_reducers/AccountComponentReducer';
import ContractReducer from './state_reducers/ContractReducer';
// import componentReducer from './features/componentReducer'


const store = configureStore({
    reducer: {
        channels: ChannelReducer, 
        factory: factoryReducer,  
        channelComponent: ChannelComponentReducer, 
        detailComponent: DetailComponentReducer, 
        accounts: AccountReducer, 
        contract: ContractReducer, 
        loginAccount: LoginAccountReducer, 
    }, 
     middleware: (x) => x().concat(logger)
    
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <Provider store={store}>
        <React.StrictMode>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </React.StrictMode>
    </Provider>
    
)

console.log('Pass')
