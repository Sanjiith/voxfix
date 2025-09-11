import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/Contact.css"; // Optional if you move inline styles to a CSS file

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #ffffff, #04749c)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: "linear-gradient(135deg,#04749c,#ffffff)" }}>
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">VoxFix</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link text-black" href="/">Home</a>
              </li>
              
              <li className="nav-item dropdown">
                <a className="nav-link text-black" href="/about">About Us</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active text-black" href="/contact">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Contact Section */}
      <section className="bg-light py-5 text-center" style={{ flex: "1" }}>
        <div className="container">
          <h1 className="display-4 fw-bold">Contact Us</h1>
          <p className="lead mt-3">We'd love to hear from you! Fill out the form below and we'll get back to you soon.</p>
          <div className="row justify-content-center mt-4">
            <div className="col-md-6">
              <div className="card shadow-sm p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 text-start">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name" 
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3 text-start">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3 text-start">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea 
                      className="form-control" 
                      id="message" 
                      rows="4" 
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white text-center py-3 mt-auto">
        <div className="container">
          &copy; 2025 VoiceGrammar. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Contact;
