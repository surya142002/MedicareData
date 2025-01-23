import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { decodeJWT } from "../utils/decodeJWT";
import React from "react";

const LoginForm = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", formData);
      const { token } = response.data;

      const decodedToken = decodeJWT(token);
      localStorage.setItem("token", token);
      localStorage.setItem("role", decodedToken.role);

      setIsLoggedIn(true);
      navigate("/datasets", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Login</h1>
        {error && <p className="auth-form-error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email" className="auth-form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <label htmlFor="password" className="auth-form-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <button type="submit" className="auth-form-button">
            Login
          </button>
          <p className="auth-form-link">
            Don't have an account?{" "}
            <Link to="/register" className="link">
              Register here
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
