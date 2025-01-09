import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const LoginForm = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', formData);
      console.log('Login Response:', response.data);

      // Store the JWT token and update login state
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);

      alert('Login successful!');
      navigate('/datasets', { replace: true });
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form">
        <h2 className="form-title">Login</h2>
        {error && <p className="form-error">{error}</p>}
        <label className="form-label">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
        />
        <label className="form-label">Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-input"
        />
        <button type="submit" className="form-button">Login</button>
        <p className="form-link">
          Don’t have an account? <Link to="/register" className="link">Register here</Link>.
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
