// src/pages/Login.js
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email: formData.email,
        password: formData.password,
      });
      
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify({
        email: res.data.email,
        userId: res.data.userId,
        name: res.data.name
      }));
      
      alert(res.data.msg);
      window.location.href = "/tryit";
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
        className="navbar navbar-expand-lg navbar-dark"
        style={{ background: "linear-gradient(135deg,#04749c,#ffffff)" }}
      >
        <div className="container">
          <a className="navbar-brand fw-bold text-white" href="/">
            VoxFix
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link text-black" href="/">
                  Home
                </a>
              </li>
              <li>
                <a className="nav-link text-black" href="/contact">
                  Contact Us
                </a>
              </li>
              <li>
                <a className="nav-link text-black" href="/about">
                  About Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "90vh" }}
      >
        <div
          className="card shadow p-4 text-center"
          style={{ width: "100%", maxWidth: "450px", zIndex: 1 }}
        >
          <h3 className="mb-4">Login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label htmlFor="email" className="form-label">
                Email Address
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
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
            <div className="text-center mt-3">
              <small>
                Don't have an account? <a href="/signup">Sign up here</a>
              </small>
            </div>
            <div className="text-center mt-2">
              <small>
                <a href="/forgot-password">Forgot your password?</a>
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