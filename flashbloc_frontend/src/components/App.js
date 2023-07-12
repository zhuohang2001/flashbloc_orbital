
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import Register from './auth/register';
import Login from './auth/login';
import Logout from './auth/logout';
import { connect, useSelector } from 'react-redux';


import Dashboard from './data/Dashboard';
// import Header from './layout/Header'
import Home from './layout/home';
import CreateChannel from './data/CreateChannel';
import Channels from './data/Channels';
import ChannelsDB from './data/ChannelsDB';
import AccountsDB from './data/AccountsDB'
// import AccountDetail from './data/AccountDetail'
import ChannelDetail from './data/ChannelDetail'
import AccountDetail from './data/AccountDetail'
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../style';

import Header from './layout/header';
import Footer from './layout/footer';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';



// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

class App extends Component {
  render() {
    return (
      <div className={`bg-[#00040f] ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <div className="bg-[#00040f]  w-full overflow-hidden">
                  <div className={`bg-[#00040f] ${styles.paddingX} ${styles.flexCenter}`}>
                      <div className={`bg-[#00040f] ${styles.boxWidth}`}>
                          <Header />
                      </div>
                  </div>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/createChannel" element={<CreateChannel/>} />
                    <Route path="/channels" element={<Channels/>} />
                    <Route path="/channelsDB" element={<ChannelsDB/>} />
                    <Route path="/accountsDB" element={<AccountsDB/>} />
                    <Route path="/channelDetail" element={<ChannelDetail/>} />
                    <Route path="/accountDetail" element={<AccountDetail/>} />
                  </Routes>
              <div className={`bg-[#00040f] ${styles.paddingX} ${styles.flexCenter}`}>
                  <div className={`${styles.boxWidth}`}>
                      <Footer />
                  </div>
              </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    acc_detail_toggle: state.detailComponent.value
  }
}

export default connect(mapStateToProps, {})(App);
