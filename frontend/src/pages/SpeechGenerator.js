import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/Home.css"; // assuming you want to reuse Home.css

const SpeechGenerator = () => {
  const [topic, setTopic] = useState("");
  const [speech, setSpeech] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic first!");
      return;
    }
    setLoading(true);
    setSpeech("");

    try {
      const res = await fetch("http://localhost:5001/generate_speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.speech) setSpeech(data.speech);
      else alert(data.error || "Error generating speech");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  const playSpeech = () => {
    if (!speech) {
      alert("No speech to play!");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(speech);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
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

      {/* Speech Generator Content */}
      <div
        className="d-flex justify-content-center align-items-center flex-grow-1"
        style={{
          padding: "2rem",
          background: "linear-gradient(to bottom, #cce0eb, #6b99b6)",
        }}
      >
        <div
          className="card p-4 shadow"
          style={{ maxWidth: "600px", width: "100%", borderRadius: "12px" }}
        >
          <h4 className="text-primary mb-3 text-center">Speech Generator 🎙️</h4>
          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="Enter a topic or description..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          ></textarea>
          <div className="d-flex justify-content-center mb-3">
            <button
              className="btn btn-success me-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Speech"}
            </button>
            <button className="btn btn-secondary" onClick={playSpeech}>
              🔊 Play Speech
            </button>
          </div>

          {speech && (
            <div
              className="alert alert-light border mt-4"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {speech}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-white text-center py-3 mt-auto"
        style={{ background: "linear-gradient(135deg,#04749c,#023b50)" }}
      >
        <div className="container">&copy; 2025 VoiceGrammar. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default SpeechGenerator;
