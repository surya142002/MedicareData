import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import DatasetsPage from './components/DatasetsPage';
import AnalyticsPage from './components/AnalyticsPage';
import UploadDatasetPage from './components/UploadDatasetPage';
import DeleteDatasetPage from './components/DeleteDatasetPage';
import api from './utils/api';
import { decodeJWT } from './utils/decodeJWT';

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
        const decodedToken = decodeJWT(token);
        localStorage.setItem('role', decodedToken.role); // Store role from token
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Token validation failed:', err.response || err.message);
        localStorage.removeItem('token'); // Clear invalid token
        localStorage.removeItem('role'); // Clear role
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
  };

  const ProtectedAdminRoute = ({ element }) => {
    const role = localStorage.getItem('role');
    return role === 'admin' ? element : <Navigate to="/datasets" />;
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while validating token
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
