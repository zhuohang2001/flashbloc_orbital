import React, { useState } from 'react';

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
