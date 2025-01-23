import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import React from "react";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
      });
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Register</h1>
        {error && <p className="auth-form-error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="register-email" className="auth-form-label">Email:</label>
          <input
            id="register-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <label htmlFor="register-password" className="auth-form-label">Password:</label>
          <input
            id="register-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <label htmlFor="register-confirmPassword" className="auth-form-label">Confirm Password:</label>
          <input
            id="register-confirmPassword"
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
