// src/pages/Signup.js
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      console.log(res.data);
      window.location.href = "/login"; // redirect to login after success
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed. Try again.");
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

      {/* Signup Form */}
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "90vh" }}
      >
        <div
          className="card shadow p-4 text-center"
          style={{ width: "100%", maxWidth: "450px", zIndex: 1 }}
        >
          <h3 className="mb-4">Sign Up</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
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
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 text-start">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Sign Up
            </button>
            <div className="text-center mt-3">
              <small>
                Already have an account? <a href="/login">Login here</a>
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

export default Signup;
