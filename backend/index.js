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

// API's
// 3. Signup route
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

// login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email, password });
    if (!existingUser) {
      return res.status(400).json({ msg: "Invalid email or password!" });
    }

    res.status(200).json({ msg: "Login successful", email: existingUser.email });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

app.post("/api/check", async (req, res) => {
  const { text } = req.body;
  const encodedParams = new URLSearchParams();
  encodedParams.append("text", text);
  encodedParams.append("language", "en-US");

  const options = {
    method: "POST",
    url: "https://grammarbot.p.rapidapi.com/check",
    headers: {
      "x-rapidapi-key": "07710571a5msh54e4bda940f3c90p13d6b6jsnb86fa33b8a6b", // keep secret
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

// 4. Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
