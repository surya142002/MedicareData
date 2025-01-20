import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const RegistrationForm = () => {
  // State variables
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Send registration request to the backend
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
      });
      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-page">
      {/* Registration form */}
      <div className="auth-form-container">
        <h1 className="auth-form-title">Register</h1>
        {error && <p className="auth-form-error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <label className="auth-form-label">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <label className="auth-form-label">Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <button type="submit" className="auth-form-button">Register</button>
          <p className="auth-form-link">
            Already have an account? <Link to="/login" className="link">Log in here</Link>.
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
