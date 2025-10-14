import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff, #04749c)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{ background: 'linear-gradient(135deg,#04749c,#ffffff)' }}
      >
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            VoxFix
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end navbar-black"
            id="navbarNav"
          >
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link active text-black" to="/home">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active text-black" to="/about">
                  About Us
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active text-black" to="/contact">
                  Contact Us
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active text-black" to="/speech">
                  Speech Generator
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active text-black" to="/login">
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-light py-5 text-center">
        <div className="container">
          <h1 className="display-4 fw-bold">Speak Clearly. Write Perfectly.</h1>
          <p className="lead mt-3">
            Our VoxFix listens to your speech, detects grammatical mistakes, and instantly gives you the correct version.
          </p>
          <Link to="/tryit" className="btn btn-white btn-lg mt-4">
            Try It Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            {/* Voice Input Feature — Clickable */}
            <div className="col-md-4 mb-4">
              <Link to="/tryit" className="text-decoration-none text-dark">
                <div className="card h-100 shadow-sm hover-scale">
                  <div className="card-body">
                    <i className="bi bi-mic-fill text-danger fs-2"></i>
                    <h5 className="card-title mt-2">Voice Input</h5>
                    <p className="card-text">
                      Just click the mic and start speaking. No typing needed!
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Grammar Correction Feature */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm hover-scale">
                <div className="card-body">
                  <i className="bi bi-spellcheck text-primary fs-2"></i>
                  <h5 className="card-title mt-2">Grammar Correction</h5>
                  <p className="card-text">
                    Instant feedback on grammar errors in your spoken sentences.
                  </p>
                </div>
              </div>
            </div>

            {/* User-Friendly Feature */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm hover-scale">
                <div className="card-body">
                  <i className="bi bi-device-ssd text-success fs-2"></i>
                  <h5 className="card-title mt-2">User-Friendly</h5>
                  <p className="card-text">
                    Minimal interface, responsive design — perfect for all devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-white text-center py-3 mt-auto"
        style={{ background: 'linear-gradient(135deg,#04749c,#023b50)' }}
      >
        <div className="container">&copy; 2025 VoiceGrammar. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Home;
