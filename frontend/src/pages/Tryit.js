import React, { useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { diffWords } from "diff";

function TryIt() {
  const [output, setOutput] = useState("Your corrected sentence will appear here...");
  const [input, setInput] = useState("Your sentence appears here.");
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState("voice");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  const highlightCorrections = (original, corrected) => {
    const diff = diffWords(original, corrected);
    return diff.map((part, index) =>
      part.added ? (
        <span key={index} style={{ color: "red", fontWeight: "bold" }}>
          {part.value}
        </span>
      ) : part.removed ? null : (
        part.value
      )
    );
  };

  const speakText = (text) => {
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    if (!text || text === "Your corrected sentence will appear here...") {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      console.error("Speech synthesis error");
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

      recognitionRef.current.onstart = () => setInput("Listening...");
      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(`You said: ${transcript}`);
        await processGrammarCheck(transcript);
      };
      recognitionRef.current.onerror = () => setOutput("Error occurred. Please try again.");
    }

    recognitionRef.current.start();
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      setOutput("Please enter some text to check.");
      return;
    }
    setInput(`You typed: ${textInput}`);
    await processGrammarCheck(textInput);
  };

  const processGrammarCheck = async (text) => {
    try {
      const res = await axios.post("http://localhost:5001/generate_response", { prompt: text });
      if (res.data.text) {
        const highlighted = highlightCorrections(text, res.data.text);
        setOutput({
          highlighted: highlighted,
          plainText: res.data.text,
        });
      } else {
        setOutput({
          highlighted: "⚠️ No correction returned from backend.",
          plainText: "",
        });
      }
    } catch (error) {
      console.error("❌ Grammar check error:", error);
      setOutput({
        highlighted: "Error while checking grammar. Please try again.",
        plainText: "",
      });
    }
  };

  const handleClear = () => {
    setTextInput("");
    setInput("Your sentence appears here.");
    setOutput({
      highlighted: "Your corrected sentence will appear here...",
      plainText: "",
    });
    stopSpeech();
  };

  React.useEffect(() => {
    if (typeof output === "string") {
      setOutput({
        highlighted: output,
        plainText: output === "Your corrected sentence will appear here..." ? "" : output,
      });
    }
  }, []);

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
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
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
                <a className="nav-link text-black" href="/speech">
                  Speech Generator
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-black" href="/contact">
                  Contact Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-black" href="/login">
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Input Mode Section */}
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center mb-4">
              <h2 className="text-dark mb-3">Choose Input Method</h2>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${inputMode === "voice" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setInputMode("voice")}
                >
                  <i className="bi bi-mic-fill me-2"></i>Voice Input
                </button>
                <button
                  type="button"
                  className={`btn ${inputMode === "text" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setInputMode("text")}
                >
                  <i className="bi bi-keyboard-fill me-2"></i>Text Input
                </button>
              </div>
            </div>

            {/* Mic / Text Input Section */}
            <div
              className="mic-container"
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "15px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                margin: "auto",
                textAlign: "center",
              }}
            >
              {inputMode === "voice" ? (
                <>
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
                </>
              ) : (
                <>
                  <h2 className="mb-3 text-dark">Type Your Sentence</h2>
                  <p className="text-muted mb-4">
                    Enter your sentence below and we'll correct the grammar for you.
                  </p>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Type your sentence here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        resize: "vertical",
                      }}
                    />
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-primary" onClick={handleTextSubmit}>
                      <i className="bi bi-check-lg me-2"></i>Check Grammar
                    </button>
                    <button className="btn btn-outline-secondary" onClick={handleClear}>
                      <i className="bi bi-x-lg me-2"></i>Clear
                    </button>
                  </div>
                </>
              )}

              {/* Display Input and Output */}
              <div className="output-box mt-4 p-3 bg-light rounded" style={{ minHeight: "80px" }}>
                <em className="text-muted">{input}</em>
              </div>

              <div className="output-container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-dark mb-0">Corrected Sentence:</h6>
                  {output.plainText && (
                    <button
                      className={`btn ${isSpeaking ? "btn-warning" : "btn-success"} btn-sm`}
                      onClick={isSpeaking ? stopSpeech : () => speakText(output.plainText)}
                    >
                      <i className={`bi ${isSpeaking ? "bi-stop-fill" : "bi-volume-up-fill"} me-1`}></i>
                      {isSpeaking ? "Stop" : "Listen"}
                    </button>
                  )}
                </div>
                <div className="output-box bg-light p-3 rounded" style={{ minHeight: "100px" }}>
                  <em className="text-muted">
                    {typeof output === "string" ? output : output.highlighted}
                  </em>
                </div>
              </div>
            </div>
          </div>
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
