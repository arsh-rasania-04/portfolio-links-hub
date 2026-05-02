import React, { useState } from 'react';

// 1. The Card Component remains exactly the same
const ProjectCard = ({ name, url, progress, color }) => {
  const getStatus = (p) => {
    if (p === 0) return "Pending";
    if (p === 100) return "Completed";
    return "In Progress";
  };

  const getBarColor = (p) => {
    if (p === 0) return "#555";
    if (p === 100) return "#60a5fa";
    return "#4ade80";
  };

  return (
    <div style={{
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '15px',
      backgroundColor: '#1e1e1e',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{name}</h3>
      <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Status: {getStatus(progress)}</p>

      <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', margin: '10px 0' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: getBarColor(progress), borderRadius: '4px' }}></div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ color: color || '#4ade80', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
      >
        Open Resource →
      </a>
    </div>
  );
};

function App() {
  // 2. Wrap your data in State so it can be updated dynamically
  const [links, setLinks] = useState([
    { id: 1, name: "Main Portfolio", url: "https://arsh.dev", color: "#6e57e0", progress: 100, category: 'social' },
    { id: 5, name: "Mongo DB University", url: "https://www.mongodb.com/resources/languages/mern-stack-tutorial", color: "#4ade80", progress: 0, category: 'learning' },
  ]);

  // State for the new link form
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("learning");

  // 3. Function to handle form submission
  const handleAddLink = (e) => {
    e.preventDefault(); // Prevents page reload
    if (!newName || !newUrl) return; // Basic validation

    const newLinkObject = {
      id: Date.now(), // Generate a temporary unique ID
      name: newName,
      url: newUrl,
      color: newCategory === 'social' ? "#6e57e0" : "#4ade80",
      progress: 0,
      category: newCategory
    };

    setLinks([...links, newLinkObject]); // Add new link to existing state
    
    // Clear form
    setNewName("");
    setNewUrl("");
  };

  return (
    <div style={{ padding: '40px', color: 'white', backgroundColor: '#121212', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#333', borderRadius: '50%', margin: '0 auto 15px', border: '2px solid #4ade80' }}></div>
        <h1>Arsh M. Rasania</h1>
        <p style={{ color: '#888' }}>24CE10034 | IIT Kharagpur</p>
      </div>

      {/* NEW: Input Form */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0 }}>Add a New Link</h3>
        <form onSubmit={handleAddLink} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Link Name" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white' }}
          />
          <input 
            type="url" 
            placeholder="https://..." 
            value={newUrl} 
            onChange={(e) => setNewUrl(e.target.value)}
            style={{ flex: 2, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white' }}
          />
          <select 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white' }}
          >
            <option value="learning">Learning</option>
            <option value="social">Social</option>
          </select>
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4ade80', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
            Add
          </button>
        </form>
      </div>

      {/* Render Lists Dynamically filtering by category */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ minWidth: '300px' }}>
          <h2 style={{ borderBottom: '2px solid #6e57e0', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px' }}>Socials & Portfolio</h2>
          {links.filter(link => link.category === 'social').map(proj => (
            <ProjectCard key={proj.id} {...proj} />
          ))}
        </div>

        <div style={{ minWidth: '300px' }}>
          <h2 style={{ borderBottom: '2px solid #4ade80', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px' }}>Learning Resources</h2>
          {links.filter(link => link.category === 'learning').map(proj => (
            <ProjectCard key={proj.id} {...proj} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;