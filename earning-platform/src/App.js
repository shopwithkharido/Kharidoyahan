import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 'admin');
      setCurrentPage(parsedUser.role === 'admin' ? 'admin' : 'dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    setCurrentPage(userData.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentPage === 'landing' && (
        <LandingPage 
          onLogin={() => setCurrentPage('login')} 
          onRegister={() => setCurrentPage('register')} 
        />
      )}
      {currentPage === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onBack={() => setCurrentPage('landing')}
          onRegister={() => setCurrentPage('register')}
        />
      )}
      {currentPage === 'register' && (
        <Register 
          onRegister={handleLogin} 
          onBack={() => setCurrentPage('landing')}
          onLogin={() => setCurrentPage('login')}
        />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          onUpdateUser={setUser}
        />
      )}
      {currentPage === 'admin' && user && isAdmin && (
        <AdminPanel 
          user={user} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
