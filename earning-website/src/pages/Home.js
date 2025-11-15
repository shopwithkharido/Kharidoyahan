import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome to EarnMoney</h1>
      <p className="text-xl text-gray-600 mb-8">Earn money by completing simple tasks online!</p>
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Complete Surveys</h3>
          <p className="text-gray-600">Answer questions and earn points for each survey.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Watch Videos</h3>
          <p className="text-gray-600">Watch short videos and get rewarded for your time.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Take Quizzes</h3>
          <p className="text-gray-600">Test your knowledge and earn money with quizzes.</p>
        </div>
      </div>
      <div className="space-x-4">
        <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Get Started</Link>
        <Link to="/login" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">Login</Link>
      </div>
    </div>
  );
};

export default Home;