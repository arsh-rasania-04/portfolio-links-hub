const express = require('express');
const cors = require('cors');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5001;

// ==========================================
// 1. MIDDLEWARE
// ==========================================
// Allows your React app to communicate with this API without security blocks
app.use(cors()); 
// Tells Express how to read incoming JSON data from POST requests
app.use(express.json()); 

// ==========================================
// 2. IN-MEMORY DATABASE (Temporary Phase 2 Setup)
// ==========================================
// We will replace this array with MongoDB in Phase 3. 
// For now, if the server restarts, this resets.
let links = [
  { id: 1, name: "Main Portfolio", url: "https://arsh.dev", color: "#6e57e0", progress: 100, category: 'social' },
  { id: 2, name: "Mongo DB University", url: "https://www.mongodb.com/resources/languages/mern-stack-tutorial", color: "#4ade80", progress: 0, category: 'learning' }
];

// ==========================================
// 3. API ROUTES (The Endpoints)
// ==========================================

// Route A: GET all links
// What it does: Sends your current list of links to the frontend.

app.get('/', (req, res) => {
  res.send("The server is reachable!");
});

app.get('/api/links', (req, res) => {
  res.status(200).json(links);
});

// Route B: POST a new link
// What it does: Receives new link data from React and adds it to the list.
app.post('/api/links', (req, res) => {
  const { name, url, color, category } = req.body;

  // Crucial Backend Validation: Never trust the frontend completely
  if (!name || !url) {
    return res.status(400).json({ message: "Please provide both a name and a URL." });
  }

  const newLink = {
    id: Date.now(), // Generate a temporary unique ID
    name: name,
    url: url,
    color: color || '#4ade80', // Default color if none provided
    progress: 0,
    category: category || 'learning'
  };

  links.push(newLink); // Save to our "database"
  
  // Status 201 means "Created successfully"
  res.status(201).json(newLink); 
});

// Route C: DELETE a link
// What it does: Finds a link by its ID and removes it.
app.delete('/api/links/:id', (req, res) => {
  const linkId = parseInt(req.params.id); // Convert the ID from the URL into a number
  
  // Check if the link actually exists before trying to delete it
  const linkExists = links.some(link => link.id === linkId);
  
  if (!linkExists) {
    return res.status(404).json({ message: "Link not found." });
  }

  // Filter out the requested link
  links = links.filter(link => link.id !== linkId);
  
  res.status(200).json({ message: "Link successfully deleted.", deletedId: linkId });
});

// ==========================================
// 4. START THE SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Backend Server is running smoothly on http://localhost:${PORT}`);
});