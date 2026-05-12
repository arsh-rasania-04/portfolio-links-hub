require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Link = require('./models/Link');

const app = express();

// 1. MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 

// 2. DATABASE CONNECTION
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.log("❌ Connection Error:", err));


const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds the user ID to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// 3. API ROUTES
app.get('/', (req, res) => {
  res.send("The Link-Hub Cloud Server is officially alive! 🚀");
});

const bcrypt = require('bcryptjs');
const User = require('./models/User');

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
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).send("Server Error");
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
    res.status(500).send("Server Error");
  }
});

// GET all links
app.get('/api/links', auth, async (req, res) => {
  try {
    // req.user.id comes from the middleware bouncer
    const links = await Link.find({ userId: req.user.id }); 
    res.json(links);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// POST a new link (Protected)
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
      // This ID is extracted from the JWT token by your 'auth' middleware
      userId: req.user.id 
    });

    const savedLink = await newLink.save(); 
    res.status(201).json(savedLink);
  } catch (err) {
    res.status(400).json({ message: "Error saving link: " + err.message });
  }
});

// UPDATE (EDIT) a link (Protected & Verified)
app.put('/api/links/:id', auth, async (req, res) => {
  const { name, url, color, category } = req.body;

  try {
    // 1. Find the link to check who owns it
    let link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ message: "Link not found in database." });
    }

    // 2. Verify ownership
    if (link.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to edit this link." });
    }

    // 3. Perform the update
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
// DELETE a link (Protected & Verified)
app.delete('/api/links/:id', auth, async (req, res) => {
  try {
    // 1. Find the link first to check ownership
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ message: "Link not found in database." });
    }

    // 2. Check if the link belongs to the user trying to delete it
    // We use .toString() because userId is a MongoDB ObjectId
    if (link.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this link." });
    }

    // 3. If ownership is confirmed, delete it
    await link.deleteOne();
    
    res.status(200).json({ message: "Link successfully deleted from cloud." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting link: " + err.message });
  }
});

// Add this to server.js
app.put('/api/links/:id', async (req, res) => {
  try {
    const updatedLink = await Link.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: 'after', runValidators: true } // This returns the UPDATED version to the frontend
    );
    if (!updatedLink) return res.status(404).json({ message: "Link not found" });
    res.json(updatedLink);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. START SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});