const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require('body-parser')

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// 1. Connect to MongoDB
mongoose.connect("mongodb+srv://sanjith:sanjith@login.71bjb.mongodb.net/voicecheckerdb?retryWrites=true&w=majority&appName=Login", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected to voiceheckerdb"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 2. Define User schema & model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true }
}, { collection: "users" });

const User = mongoose.model("User", userSchema);

// 3. Define Chat History schema
const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true }, // For easy querying
  sessionId: { type: String, required: true },
  input: { type: String, required: true },
  output: { type: String, required: true },
  correctedText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { collection: "chat_histories" });

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

// API's
// 4. Signup route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists!" });
    }

    const newUser = new User({ name, email, password, confirmPassword });
    await newUser.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// 5. Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email, password });
    if (!existingUser) {
      return res.status(400).json({ msg: "Invalid email or password!" });
    }

    res.status(200).json({ 
      msg: "Login successful", 
      email: existingUser.email,
      userId: existingUser._id,
      name: existingUser.name
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 6. Save Chat History
app.post("/api/save-chat", async (req, res) => {
  try {
    const { userId, email, sessionId, input, output, correctedText } = req.body;

    const chatHistory = new ChatHistory({
      userId,
      email,
      sessionId,
      input,
      output: output.plainText || output,
      correctedText
    });

    await chatHistory.save();
    res.json({ msg: "Chat saved successfully" });
  } catch (err) {
    console.error("Error saving chat:", err);
    res.status(500).json({ msg: "Failed to save chat history" });
  }
});

// 7. Get User Chat History
app.get("/api/chat-history/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const chatHistory = await ChatHistory.find({ email })
      .sort({ timestamp: -1 })
      .limit(50); // Get last 50 chats

    res.json(chatHistory);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ msg: "Failed to fetch chat history" });
  }
});

// 8. Grammar Check API (Existing)
app.post("/api/check", async (req, res) => {
  const { text } = req.body;
  const encodedParams = new URLSearchParams();
  encodedParams.append("text", text);
  encodedParams.append("language", "en-US");

  const options = {
    method: "POST",
    url: "https://grammarbot.p.rapidapi.com/check",
    headers: {
      "x-rapidapi-key": "07710571a5msh54e4bda940f3c90p13d6b6jsnb86fa33b8a6b",
      "x-rapidapi-host": "grammarbot.p.rapidapi.com",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    let corrected = text;

    if (response.data.matches && response.data.matches.length > 0) {
      const match = response.data.matches[0];
      corrected = text.substring(0, match.offset) +
                  match.replacements[0].value +
                  text.substring(match.offset + match.length);
    }

    res.json({ corrected });
  } catch (error) {
    console.error("Backend API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Grammar API request failed" });
  }
});

// Add this to your existing index.js file after the other routes

// 9. Delete Chat History Item
app.delete("/api/chat-history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid chat history ID" });
    }

    const deletedChat = await ChatHistory.findByIdAndDelete(id);
    
    if (!deletedChat) {
      return res.status(404).json({ msg: "Chat history item not found" });
    }

    res.json({ msg: "Chat history deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat history:", err);
    res.status(500).json({ msg: "Failed to delete chat history" });
  }
});

// 10. Delete All Chat History for User
app.delete("/api/chat-history/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await ChatHistory.deleteMany({ email });
    
    res.json({ 
      msg: "All chat history deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Error deleting all chat history:", err);
    res.status(500).json({ msg: "Failed to delete chat history" });
  }
});

// 4. Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));