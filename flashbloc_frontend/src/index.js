import React from 'react';
import ReactDOM from 'react-dom/client';
import styles from './style';


import './index.css';
// import reportWebVitals from './reportWebVitals';
import ChannelReducer from './state_reducers/ChannelReducer';
import ChannelComponentReducer from './state_reducers/ChannelComponentReducer';
import factoryReducer from './state_reducers/ContractReducer';
import AccountReducer from './state_reducers/AccountReducer';
import AccountComponentReducer from './state_reducers/AccountComponentReducer';
import LoginAccountReducer from './state_reducers/LoginAccountReducer';

import Register from './components/auth/register';
import Login from './components/auth/login';
import Logout from './components/auth/logout';

import Header from './components/layout/header';
import Footer from './components/layout/footer';

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
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

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
        accountComponent: AccountComponentReducer, 
        accounts: AccountReducer, 
        contract: ContractReducer, 
        loginAccount: LoginAccountReducer, 
    }, 
     middleware: (x) => x().concat(logger)
    
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <Provider store={store}>
        <Router>
            <React.StrictMode>
                <div className="bg-[#00040f]  w-full overflow-hidden">
                    <div className={`bg-[#00040f] ${styles.paddingX} ${styles.flexCenter}`}>
                        <div className={`bg-[#00040f] ${styles.boxWidth}`}>
                            <Header />
                        </div>
                    </div>
                
                <Routes>
                    <Route exact path="/" element={<App />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
                <div className={`bg-[#00040f] ${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidth}`}>
                        <Footer />
                    </div>
                </div>
            </div>
            </React.StrictMode>
        </Router>
    </Provider>
    
)

console.log('Pass')
