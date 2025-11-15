import React from 'react';

const Earnings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Earnings</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Current Balance</h3>
        <p className="text-3xl font-bold text-green-600">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Earnings History</h3>
        <p className="text-gray-600">No earnings yet. Complete tasks to start earning!</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Withdraw Funds</h3>
        <p className="text-gray-600 mb-4">Minimum withdrawal: $10.00</p>
        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50" disabled>
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default Earnings;