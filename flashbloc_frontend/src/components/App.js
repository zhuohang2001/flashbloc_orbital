
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom/client';

import Dashboard from './data/Dashboard';
// import Header from './layout/Header'
import Register from './auth/register';
import Home from './layout/home';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../style';


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
          <Home />
        </div>
      </div>
      
    );
  }
}

export default App;
