import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">EarnMoney</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
            <li><Link to="/login" className="hover:text-blue-200">Login</Link></li>
            <li><Link to="/register" className="hover:text-blue-200">Register</Link></li>
            <li><Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link></li>
            <li><Link to="/tasks" className="hover:text-blue-200">Tasks</Link></li>
            <li><Link to="/earnings" className="hover:text-blue-200">Earnings</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;