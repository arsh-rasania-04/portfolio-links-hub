require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Models
const Link = require('./models/Link');
const User = require('./models/User');

const app = express();

// --- 1. ENVIRONMENT CHECK ---
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("❌ FATAL ERROR: Missing required environment variables.");
  process.exit(1);
}

// --- 2. MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.log("❌ Connection Error:", err));


// --- 4. API ROUTES ---

// Health Check
app.get('/', (req, res) => {
  res.send("The Link-Hub Cloud Server is officially alive! 🚀");
});

// SIGNUP
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error during registration" });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error during login" });
  }
});

// GET all links
app.get('/api/links', auth, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.user.id }); 
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error fetching links" });
  }
});

// POST a new link
app.post('/api/links', auth, async (req, res) => {
  const { name, url, color, category } = req.body;

  if (!name || !url) {
    return res.status(400).json({ message: "Name and URL are required." });
  }

  try {
    const newLink = new Link({
      name,
      url,
      color: color || '#4ade80',
      category: category || 'learning',
      userId: req.user.id 
    });

    const savedLink = await newLink.save(); 
    res.status(201).json(savedLink);
  } catch (err) {
    res.status(400).json({ message: "Error saving link: " + err.message });
  }
});

// UPDATE a link
app.put('/api/links/:id', auth, async (req, res) => {
  const { name, url, color, category } = req.body;

  try {
    let link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ message: "Link not found in database." });
    }

    if (link.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to edit this link." });
    }

    link = await Link.findByIdAndUpdate(
      req.params.id,
      { name, url, color, category },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json(link);
  } catch (err) {
    res.status(400).json({ message: "Error updating link: " + err.message });
  }
});

// DELETE a link
app.delete('/api/links/:id', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ message: "Link not found in database." });
    }

    if (link.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this link." });
    }

    await link.deleteOne();
    
    res.status(200).json({ message: "Link successfully deleted from cloud." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting link: " + err.message });
  }
});


// --- 5. START SERVER ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});