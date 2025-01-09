import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import DatasetsPage from './components/DatasetsPage';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // Track login state

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token')); // Sync login state with localStorage
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <Router>
      <nav>
        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={!isLoggedIn ? <LoginForm setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/datasets" />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/datasets" element={isLoggedIn ? <DatasetsPage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
