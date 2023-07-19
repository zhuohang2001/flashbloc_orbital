import React, { useState } from 'react';

function PaymentPage() {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState(0);

  const handlePayeeChange = (event) => {
    setPayee(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handlePaymentSubmit = (event) => {
    event.preventDefault();
    // Add payment logic here
    console.log(`Paying ${amount} to ${payee}`);
    // Reset form
    setPayee('');
    setAmount(0);
  };

  return (
    <form className="m-4">
      <div className="credit-card w-full lg:w-1/2 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">
            Send ETH payment
          </h1>
          <div className="">
            <div className="my-3">
              <input
                type="text"
                name="addr"
                className="input input-bordered block w-full focus:ring focus:outline-none"
                placeholder="Recipient"
              />
            </div>
            <div className="my-3">
              <input
                name="ether"
                type="text"
                className="input input-bordered block w-full focus:ring focus:outline-none"
                placeholder="Amount in ETH"
              />
            </div>
          </div>
        </main>
        <footer className="p-4">
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Pay now
          </button>
        </footer>
      </div>
    </form>
  );
}

export default PaymentPage;
