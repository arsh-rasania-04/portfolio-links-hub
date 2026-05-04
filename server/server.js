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

// 3. API ROUTES
app.get('/', (req, res) => {
  res.send("The Link-Hub Cloud Server is officially alive! 🚀");
});

// GET all links
app.get('/api/links', async (req, res) => {
  try {
    const links = await Link.find(); 
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ message: "Error fetching links: " + err.message });
  }
});

// POST a new link
app.post('/api/links', async (req, res) => {
  const { name, url, color, category } = req.body;
  if (!name || !url) {
    return res.status(400).json({ message: "Name and URL are required." });
  }
  try {
    const newLink = new Link({
      name,
      url,
      color: color || '#4ade80',
      category: category || 'learning'
    });
    const savedLink = await newLink.save(); 
    res.status(201).json(savedLink);
  } catch (err) {
    res.status(400).json({ message: "Error saving link: " + err.message });
  }
});

// DELETE a link
app.delete('/api/links/:id', async (req, res) => {
  try {
    const deletedLink = await Link.findByIdAndDelete(req.params.id);
    if (!deletedLink) {
      return res.status(404).json({ message: "Link not found in database." });
    }
    res.status(200).json({ message: "Link successfully deleted from cloud." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting link: " + err.message });
  }
});

// 4. START SERVER (Only one listener!)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});