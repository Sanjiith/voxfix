import React, { useState, useRef, useEffect } from "react";
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
  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadChatHistory(userData.email);
    }
  }, []);

  // Close delete menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDeleteMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Load chat history for the user
  const loadChatHistory = async (email) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat-history/${email}`);
      setChatHistory(res.data);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  // Save chat to MongoDB
  const saveChat = async (inputText, outputText, correctedText) => {
    if (!user) return;

    try {
      await axios.post("http://localhost:5000/api/save-chat", {
        userId: user.userId,
        email: user.email,
        sessionId: Date.now().toString(),
        input: inputText,
        output: outputText,
        correctedText: correctedText
      });
      
      // Reload chat history after saving
      loadChatHistory(user.email);
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  };

  // Delete single chat history item
  const deleteChatItem = async (chatId, e) => {
    e.stopPropagation(); // Prevent triggering the chat load
    try {
      await axios.delete(`http://localhost:5000/api/chat-history/${chatId}`);
      
      // Remove from local state
      setChatHistory(prev => prev.filter(chat => chat._id !== chatId));
      setShowDeleteMenu(null);
      
      // Show success message
      alert("Chat history deleted successfully");
    } catch (err) {
      console.error("Error deleting chat history:", err);
      alert("Failed to delete chat history");
    }
  };

  // Delete all chat history for user
  const deleteAllChatHistory = async () => {
    if (!user) return;
    
    if (window.confirm("Are you sure you want to delete all your chat history? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5000/api/chat-history/user/${user.email}`);
        
        // Clear local state
        setChatHistory([]);
        setShowDeleteMenu(null);
        
        alert("All chat history deleted successfully");
      } catch (err) {
        console.error("Error deleting all chat history:", err);
        alert("Failed to delete chat history");
      }
    }
  };

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
        const outputData = {
          highlighted: highlighted,
          plainText: res.data.text,
        };
        setOutput(outputData);

        // Save to MongoDB if user is logged in
        if (user) {
          saveChat(text, outputData, res.data.text);
        }
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setChatHistory([]);
    window.location.href = "/login";
  };

  const loadHistoryItem = (item) => {
    setInput(`Previous: ${item.input}`);
    setOutput({
      highlighted: item.correctedText,
      plainText: item.output
    });
    setShowHistory(false);
  };

  const handleThreeDotsClick = (chatId, e) => {
    e.stopPropagation();
    setShowDeleteMenu(showDeleteMenu === chatId ? null : chatId);
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
              {user ? (
                <>
                  <li className="nav-item">
                    <button 
                      className="nav-link text-black btn btn-link"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <i className="bi bi-clock-history me-1"></i>
                      History ({chatHistory.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <span className="nav-link text-black">
                      Welcome, {user.name}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="nav-link text-black btn btn-link"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <a className="nav-link text-black" href="/login">
                    Login
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Chat History Panel */}
      {showHistory && (
        <div 
          className="position-fixed top-0 start-0 h-100 bg-light shadow-lg"
          style={{ 
            width: "400px", 
            zIndex: 1050, 
            marginTop: "56px", 
            overflowY: "auto",
            transition: "transform 0.3s ease"
          }}
        >
          <div className="p-3 border-bottom bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Chat History</h5>
              <div className="d-flex gap-2">
                {chatHistory.length > 0 && (
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={deleteAllChatHistory}
                    title="Delete all history"
                  >
                    <i className="bi bi-trash"></i> Clear All
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowHistory(false)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            </div>
            <small className="text-muted">
              {chatHistory.length} conversation{chatHistory.length !== 1 ? 's' : ''}
            </small>
          </div>
          <div className="p-2">
            {chatHistory.length === 0 ? (
              <div className="text-center text-muted p-5">
                <i className="bi bi-chat-left-text display-4"></i>
                <p className="mt-3">No chat history found</p>
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div 
                  key={chat._id || index}
                  className="card mb-2 cursor-pointer position-relative"
                  onClick={() => loadHistoryItem(chat)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <div className="card-body p-3">
                    {/* Three dots menu */}
                    <div className="position-absolute top-0 end-0 p-2">
                      <button
                        className="btn btn-sm btn-outline-secondary border-0"
                        onClick={(e) => handleThreeDotsClick(chat._id, e)}
                        style={{ borderRadius: '50%', width: '30px', height: '30px' }}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      
                      {/* Delete dropdown menu */}
                      {showDeleteMenu === chat._id && (
                        <div 
                          className="position-absolute end-0 mt-1 bg-white shadow-lg rounded border"
                          style={{ zIndex: 1060, minWidth: '120px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn btn-sm text-danger w-100 text-start px-3 py-2"
                            onClick={(e) => deleteChatItem(chat._id, e)}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pe-4">
                      <small className="text-muted d-block">
                        {new Date(chat.timestamp).toLocaleDateString()} at{' '}
                        {new Date(chat.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </small>
                      <p className="mb-1 small text-truncate">
                        <strong className="text-primary">Input:</strong> {chat.input}
                      </p>
                      <p className="mb-0 small text-truncate text-success">
                        <strong>Corrected:</strong> {chat.correctedText}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content - Always Centered */}
      <div 
        className="container-fluid mt-5 pt-5 d-flex justify-content-center align-items-start"
        style={{ 
          minHeight: "calc(100vh - 56px)",
          transition: "all 0.3s ease",
          paddingLeft: showHistory ? "400px" : "0"
        }}
      >
        <div className="row justify-content-center w-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            {/* User Status */}
            {user ? (
              <div className="alert alert-info text-center mb-4">
                <i className="bi bi-person-check me-2"></i>
                Logged in as {user.name} ({user.email})
                {chatHistory.length > 0 && (
                  <span className="ms-2">
                    • {chatHistory.length} saved conversation{chatHistory.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ) : (
              <div className="alert alert-warning text-center mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                You are not logged in. <a href="/login" className="alert-link">Login</a> to save your chat history.
              </div>
            )}

            {/* Input Method Selection */}
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

            {/* Main Content Box - Always Centered */}
            <div
              className="card shadow-lg border-0"
              style={{
                borderRadius: "15px",
                overflow: "hidden"
              }}
            >
              <div className="card-body p-4">
                {inputMode === "voice" ? (
                  <>
                    <div className="text-center mb-4">
                      <h4 className="text-dark mb-2">Start Speaking</h4>
                      <p className="text-muted mb-4">
                        Click the mic and start talking. We'll show your grammar-corrected text below.
                      </p>
                      <button
                        className="btn btn-primary rounded-circle"
                        onClick={handleMicClick}
                        style={{
                          width: "80px",
                          height: "80px",
                          fontSize: "1.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto"
                        }}
                      >
                        <i className="bi bi-mic-fill"></i>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <h4 className="text-dark mb-2">Type Your Sentence</h4>
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
                    </div>
                  </>
                )}

                {/* Input Display */}
                <div className="mt-4">
                  <div className="card bg-light border-0">
                    <div className="card-body text-center">
                      <h6 className="card-title text-muted mb-2"></h6>
                      <p className="card-text">
                        <em>{input}</em>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Output Display */}
                <div className="mt-4">
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="card-title text-muted mb-0">Corrected Sentence:</h6>
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
                      <p className="card-text">
                        <em className="text-muted">
                          {typeof output === "string" ? output : output.highlighted}
                        </em>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default TryIt;