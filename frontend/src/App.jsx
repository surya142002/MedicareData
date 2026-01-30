import React from "react";
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import DatasetsPage from './components/DatasetsPage';
import AnalyticsPage from './components/AnalyticsPage';
import UploadDatasetPage from './components/UploadDatasetPage';
import DeleteDatasetPage from './components/DeleteDatasetPage';
import api from './utils/api';
import { decodeJWT } from './utils/decodeJWT';

/**
 * Main application component managing routing, authentication, 
 * and user session validation.
 */
const App = () => {
  // State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State to track if the authentication process is still loading
  const [loading, setLoading] = useState(true);

  // Validate the user's token on component mount.
  useEffect(() => {
    const validateToken = async () => {
      // token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        // check validation with backend API
        await api.get('/auth/validate');
        // Decode token to get user role
        const decodedToken = decodeJWT(token);
        // Store role from token in local storage
        localStorage.setItem('role', decodedToken.role);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Token validation failed:', err.response || err.message);
        localStorage.removeItem('token'); // Clear invalid token
        localStorage.removeItem('role'); // Clear role
        setIsLoggedIn(false);
      } finally {
        setLoading(false); // Done loading
      }
    };

    validateToken();
  }, []);


  
  // Log the user out by clearing stored credentials and session state.
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
  };

  /**
     * Route guard for admin-only pages. 
     * CONSIDER IF NEEDED
  */
  const ProtectedAdminRoute = ({ element }) => {
    const role = localStorage.getItem('role');
    return role === 'admin' ? element : <Navigate to="/datasets" />;
  };

  // Show a loading message while validating the token
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            !isLoggedIn ? <LoginForm setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/datasets" />
          }
        />
        <Route
          path="/register"
          element={
            !isLoggedIn ? <RegistrationForm /> : <Navigate to="/datasets" />
          }
        />
        <Route
          path="/datasets"
          element={
            isLoggedIn ? <DatasetsPage onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/upload"
          element={<ProtectedAdminRoute element={<UploadDatasetPage />} />}
        />
        <Route
          path="/delete"
          element={<ProtectedAdminRoute element={<DeleteDatasetPage />} />}
        />
        <Route
          path="/analytics"
          element={<ProtectedAdminRoute element={<AnalyticsPage />} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
