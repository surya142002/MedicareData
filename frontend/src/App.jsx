import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import DatasetsPage from './components/DatasetsPage';
import UploadDatasetPage from './components/UploadDatasetPage'; // Import UploadDatasetPage
import DeleteDatasetPage from './components/DeleteDatasetPage'; // Import DeleteDatasetPage
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while validating token
  }

  return (
    <Router>
      <Routes>
        {/* Redirect to login by default */}
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
            isLoggedIn ? (
              <DatasetsPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Add route for Upload Dataset page */}
        <Route
          path="/upload"
          element={
            isLoggedIn ? (
              <UploadDatasetPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Add route for Delete Dataset page */}
        <Route
          path="/delete"
          element={
            isLoggedIn ? (
              <DeleteDatasetPage />
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
