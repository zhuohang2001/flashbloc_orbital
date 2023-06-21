// import React from 'react';

import React, { useState } from 'react';

// const ContainerPage = () => {
// const paymentStatuses = [
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 1, status: 'Active' },
// { container: 2, status: 'Pending Initialization' },
// { container: 3, status: 'Pending Close' },
// ];

// const [searchQuery, setSearchQuery] = useState('');

// const handleSearch = () => {
// // Perform search logic here
// // You can filter the paymentStatuses array based on the searchQuery
// // Update the filtered results to display in the respective containers
// };

// return (
// <div>
// <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px',  marginTop: '35px' }}>
// <input
// type="text"
// className="form-control"
// style={{ width: '50%' }}
// placeholder="Search"
// value={searchQuery}
// onChange={(e) => setSearchQuery(e.target.value)}
// />
// <button className="btn btn-primary" onClick={handleSearch} style={{ marginLeft: '10px' }}>Search</button>
// </div>
// <div style={{ display: 'flex', margin: '20px' }}>
// <div style={{ flex: '1', margin: '0 10px', overflowY: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
// <h2 style={{ color: 'black' }}>Active Channel</h2>
// <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
// {paymentStatuses
// .filter(item => item.container === 1)
// .map((item, index) => (
// <p key={index} style={{ color: 'black' }}>User - {item.status}</p>
// ))}
// </div>
// </div>
// <div style={{ flex: '1', margin: '0 10px', overflowY: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
// <h2 style={{ color: 'black' }}>Pending Initialization</h2>
// <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
// {paymentStatuses
// .filter(item => item.container === 2)
// .map((item, index) => (
// <p key={index} style={{ color: 'black' }}>User - {item.status}</p>
// ))}
// </div>
// </div>
// <div style={{ flex: '1', margin: '0 10px', overflowY: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
// <h2 style={{ color: 'black' }}>Pending Close</h2>
// <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
// {paymentStatuses
// .filter(item => item.container === 3)
// .map((item, index) => (
// <p key={index} style={{ color: 'black' }}>User - {item.status}</p>
// ))}
// </div>
// </div>
// </div>
// </div>
// );
// };

// export default ContainerPage;


//NEW EDIT
const ContainerPage = () => {
  const paymentStatuses = [
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 1, status: 'Active' },
    { container: 2, status: 'Pending Initialization' },
    { container: 3, status: 'Pending Close' },
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // Perform search logic here
    // You can filter the paymentStatuses array based on the searchQuery
    // Update the filtered results to display in the respective containers
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', marginTop: '35px' }}>
        <input
          type="text"
          className="form-control"
          style={{ width: '50%' }}
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch} style={{ marginLeft: '10px' }}>
          Search
        </button>
      </div>
      <div style={{ display: 'flex', margin: '20px' }}>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <h2 style={{ color: 'black' }}>Active Channel</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
            {paymentStatuses
              .filter(item => item.container === 1)
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <span>User - {item.status}</span>
                  <button className="btn btn-primary" onClick={handleSearch} style={{ marginLeft: '50px' }}>
                    Transfer
                  </button>
                  <button className="btn btn-primary" onClick={handleSearch} style={{ marginLeft: '10px' }}>
                    Declare Close
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <h2 style={{ color: 'black' }}>Pending Initialization</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
            {paymentStatuses
              .filter(item => item.container === 2)
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  User - {item.status}
                </div>
              ))}
          </div>
        </div>
        <div
          style={{
            flex: '1',
            margin: '0 10px',
            overflowY: 'auto',
            color: 'white',
            backgroundColor: '#F2F2F2',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <h2 style={{ color: 'black' }}>Pending Close</h2>
          <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
            {paymentStatuses
              .filter(item => item.container === 3)
              .map((item, index) => (
                <div key={index} style={{ color: 'black', margin: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  User - {item.status}
                  <button className="btn btn-primary" onClick={handleSearch} style={{ marginLeft: '50px' }}>
                    Close Now
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerPage;








// const ContainerPage = () => {
//   const paymentStatuses = [
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },

//     { container: 2, status: 'Pending Initialization' },
//     { container: 3, status: 'Pending Close' },
//   ];

//   return (
//     <div style={{ display: 'flex', margin: '20px' }}>
//       <div style={{ flex: '1', margin: '0 10px', overflowY: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
//         <h2 style={{ color: 'black' }}>Container 1</h2>
//         <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
//           {paymentStatuses
//             .filter(item => item.container === 1)
//             .map((item, index) => (
//               <p key={index} style={{ color: 'black' }}>Container 1 - {item.status}</p>
//             ))}
//         </div>
//       </div>
//       <div style={{ flex: '1', margin: '0 10px', overflowY: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
//         <h2 style={{ color: 'black' }}>Container 2</h2>
//         <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
//           {paymentStatuses
//             .filter(item => item.container === 2)
//             .map((item, index) => (
//               <p key={index} style={{ color: 'black' }}>Container 2 - {item.status}</p>
//             ))}
//         </div>
//       </div>
//       <div style={{ flex: '1', margin: '0 10px', overflowY: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
//         <h2 style={{ color: 'black' }}>Container 3</h2>
//         <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
//           {paymentStatuses
//             .filter(item => item.container === 3)
//             .map((item, index) => (
//               <p key={index} style={{ color: 'black' }}>Container 3 - {item.status}</p>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContainerPage;

// const ContainerPage = () => {
//   const paymentStatuses = [
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 1, status: 'Active' },
//     { container: 2, status: 'Pending Initialization' },
//     { container: 3, status: 'Pending Close' },
//   ];

//   return (
//     <div style={{ display: 'flex', margin: '20px' }}>
//       <div style={{ flex: '1', margin: '0 10px', overflow: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
//         <h2 style={{ color: 'black' }}>Container 1</h2>
//         {paymentStatuses
//           .filter(item => item.container === 1)
//           .map((item, index) => (
//             <p key={index} style={{ color: 'black' }}>Container 1 - {item.status}</p>
//           ))}
//       </div>
//       <div style={{ flex: '1', margin: '0 10px', overflow: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
//         <h2 style={{ color: 'black' }}>Container 2</h2>
//         {paymentStatuses
//           .filter(item => item.container === 2)
//           .map((item, index) => (
//             <p key={index} style={{ color: 'black' }}>Container 2 - {item.status}</p>
//           ))}
//       </div>
//       <div style={{ flex: '1', margin: '0 10px', overflow: 'auto', color: 'white', backgroundColor: '#F2F2F2', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
//         <h2 style={{ color: 'black' }}>Container 3</h2>
//         {paymentStatuses
//           .filter(item => item.container === 3)
//           .map((item, index) => (
//             <p key={index} style={{ color: 'black' }}>Container 3 - {item.status}</p>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default ContainerPage;

// const PaymentStatusPage = () => {
//   return (
//     <div style={{ display: 'flex', margin: '20px' }}>
//       <div style={{ flex: '1', margin: '0 10px', overflow: 'auto' }}>
//         <h2>Active Users</h2>
//         {Array.from({ length: 20 }).map((_, index) => (
//           <p key={index}>User {index + 1} - Active</p>
//         ))}
//       </div>
//       <div style={{ flex: '1', margin: '0 10px', overflow: 'auto' }}>
//         <h2>Pending Initialization</h2>
//         {Array.from({ length: 15 }).map((_, index) => (
//           <p key={index}>User {index + 1} - Pending Initialization</p>
//         ))}
//       </div>
//       <div style={{ flex: '1', margin: '0 10px', overflow: 'auto' }}>
//         <h2>Pending Close</h2>
//         {Array.from({ length: 25 }).map((_, index) => (
//           <p key={index}>User {index + 1} - Pending Close</p>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PaymentStatusPage;

// import Stack from '@mui/material/Stack';

// <Stack
//   direction="row"
//   divider={<Divider orientation="vertical" flexItem />}
//   spacing={2}
// >
//   <Item>Item 1</Item>
//   <Item>Item 2</Item>
//   <Item>Item 3</Item>
// </Stack>


// const MyPage = () => {
//   return (
//     <div className="container">
//       <div className="row">
//         <div className="col">
//           <h2>Active Channels</h2>
//           {/* Content for Active Channels */}
//         </div>
//         <div className="col">
//           <h2>Pending Initialization</h2>
//           {/* Content for Pending Initialization */}
//         </div>
//         <div className="col">
//           <h2>Pending Close_Now</h2>
//           {/* Content for Pending Close_Now */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyPage;


// import React from 'react';

// const ThreeEqualPartsPage = () => {
//   return (
//     <div style={{ display: 'flex', height: '100vh' }}>
//       <div style={{ flex: 1, backgroundColor: 'red' }}>
//         {/* Content for the first part */}
//       </div>
//       <div style={{ flex: 1 }}>
//         {/* Content for the second part */}
//       </div>
//       <div style={{ flex: 1, backgroundColor: 'blue' }}>
//         {/* Content for the third part */}
//       </div>
//     </div>
//   );
// };

// export default ThreeEqualPartsPage;

// const PaymentChannelPage = () => {
//     // Sample user account data
//     const users = [
//       { name: 'User A', status: 'Active' },
//       { name: 'User B', status: 'Pending Initialization' },
//       { name: 'User C', status: 'Pending Close' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
//       { name: 'User A', status: 'Active' },
      


//     ];
  
//     return (
//       <div style={{ display: 'flex', height: '100vh' }}>
//         <div style={{ flex: 1, overflow: 'auto' }}>
//           <div style={{ backgroundColor: '#F9F9F9', padding: '20px' }}>
//             <h2>Active Users</h2>
//             {users
//               .filter(user => user.status === 'Active')
//               .map(user => (
//                 <div key={user.name}>
//                   <p>Name: {user.name}</p>
//                   <p>Status: {user.status}</p>
//                 </div>
//               ))}
//           </div>
//         </div>
//         <div style={{ flex: 1, overflow: 'auto' }}>
//           <div style={{ backgroundColor: '#EFEFEF', padding: '20px' }}>
//             <h2>Pending Initialization</h2>
//             {users
//               .filter(user => user.status === 'Pending Initialization')
//               .map(user => (
//                 <div key={user.name}>
//                   <p>Name: {user.name}</p>
//                   <p>Status: {user.status}</p>
//                 </div>
//               ))}
//           </div>
//         </div>
//         <div style={{ flex: 1, overflow: 'auto' }}>
//           <div style={{ backgroundColor: '#DFDFDF', padding: '20px' }}>
//             <h2>Pending Close</h2>
//             {users
//               .filter(user => user.status === 'Pending Close')
//               .map(user => (
//                 <div key={user.name}>
//                   <p>Name: {user.name}</p>
//                   <p>Status: {user.status}</p>
//                 </div>
//               ))}
//           </div>
//         </div>
//       </div>
//     );
//   };
  
//   export default PaymentChannelPage;
