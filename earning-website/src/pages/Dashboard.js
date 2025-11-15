import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Tasks Completed</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Available Tasks</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link to="/tasks" className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Available Tasks</Link>
          <Link to="/earnings" className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">View Earnings</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;