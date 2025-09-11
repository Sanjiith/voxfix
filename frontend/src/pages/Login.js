// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from 'axios';


const API = 'http://localhost:5000';

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
    const res = await axios.post(`${API}/login`, {
      email: formData.email,
      password: formData.password,
    });

    if (res.status === 200) {
      alert("Login successful!");
      navigate("/");
    }
  } catch (err) {
    alert(err.response?.data?.msg || "Login failed. Try again.");
  }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff, #04749c)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg"
        style={{ background: "linear-gradient(135deg,#04749c,#ffffff)" }}
      >
        <div className="container">
          {/* ✅ Force white text for brand */}
          <a className="navbar-brand fw-bold text-white" href="/home">
            VoxFix
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
        <div className="card shadow p-4 text-center" style={{ width: "100%", maxWidth: "450px", zIndex: 1 }}>
          <h3 className="mb-4">Login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 text-start">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 form-check text-start">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-100" onClick={handleSubmit}>
              Login
            </button>
            <div className="text-center mt-3">
              <small>
                Don't have an account? <a href="/signup">Sign up</a>
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white text-center py-3 mt-auto">
        <div className="container">
          &copy; 2025 VoiceGrammar. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Login;
