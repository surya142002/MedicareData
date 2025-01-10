import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import DatasetsPage from './components/DatasetsPage';
import api from './utils/api';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        await api.get('/auth/validate'); // Validate token
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Token validation failed:', err.response || err.message);
        localStorage.removeItem('token'); // Clear invalid token
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while validating token
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={
            !isLoggedIn ? <LoginForm setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/datasets" />
          }
        />
        <Route path="/register" element={<RegistrationForm />} />
        <Route
          path="/datasets"
          element={
            isLoggedIn ? (
              <DatasetsPage onLogout={() => setIsLoggedIn(false)} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
