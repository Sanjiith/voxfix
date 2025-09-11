// src/pages/TryIt.js
import React, { useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function TryIt() {
  const [output, setOutput] = useState("Your corrected sentence will appear here...");
  const [input, setInput] = useState("Your sentence appears here.");
  const recognitionRef = useRef(null);

  const handleMicClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser.");
      setOutput("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setInput("Listening...");
        console.log("🎤 Listening started...");
      };

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("📝 Raw Transcript:", transcript);
        setInput(`You said: ${transcript}`);

        try {
          // Send transcript to Flask backend
          const res = await axios.post("http://localhost:5001/generate_response", {
            prompt: transcript,
          });

          if (res.data.text) {
            setOutput("Corrected: " + res.data.text);
          } else {
            setOutput("⚠️ No correction returned from backend.");
          }
        } catch (error) {
          console.error("❌ Grammar check error:", error);
          setOutput("Error while checking grammar. Please try again.");
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
        setOutput("Error occurred. Please try again.");
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 Listening ended.");
      };
    }

    recognitionRef.current.start();
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#ffffff, #04749c)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{
          background: "linear-gradient(135deg,#04749c,#ffffff)",
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
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
              <li className="nav-item">
                <a className="nav-link text-black" href="/about">
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-black" href="/login">
                  Login
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-black" href="/contact">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mic Interaction Card */}
      <div
        className="mic-container"
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "15px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          maxWidth: "600px",
          margin: "auto",
          marginTop: "120px",
          textAlign: "center",
        }}
      >
        <h2 className="mb-3 text-dark">Start Speaking</h2>
        <p className="text-muted mb-4">
          Click the mic and start talking. We'll show your grammar-corrected text below.
        </p>

        <button
          className="mic-button"
          onClick={handleMicClick}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            fontSize: "2rem",
            lineHeight: "80px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          <i className="bi bi-mic-fill"></i>
        </button>

        {/* Input (spoken text) */}
        <div
          className="output-box mt-4"
          style={{
            backgroundColor: "#f1f5f9",
            padding: "1.2rem",
            borderRadius: "10px",
            marginTop: "1.5rem",
            textAlign: "left",
            minHeight: "100px",
            whiteSpace: "pre-wrap",
            border: "1px solid #cbd5e1",
          }}
        >
          <em className="text-muted">{input}</em>
        </div>

        {/* Corrected output */}
        <div
          className="output-box mt-4"
          style={{
            backgroundColor: "#f1f5f9",
            padding: "1.2rem",
            borderRadius: "10px",
            marginTop: "1.5rem",
            textAlign: "left",
            minHeight: "100px",
            whiteSpace: "pre-wrap",
            border: "1px solid #cbd5e1",
          }}
        >
          <em className="text-muted">{output}</em>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white text-center py-3 mt-auto">
        &copy; 2025 VoiceGrammar. All rights reserved.
      </footer>
    </div>
  );
}

export default TryIt;
