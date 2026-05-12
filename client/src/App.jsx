import React, { useState, useEffect } from 'react';

const ProjectCard = ({ _id, name, url, progress, color, onDelete, onEdit }) => { 
  // const getStatus = (p) => {
  //   if (p === 0) return "Pending";
  //   if (p === 100) return "Completed";
  //   return "In Progress";
  // };

  // const getBarColor = (p) => {
  //   if (p === 0) return "#555";
  //   if (p === 100) return "#60a5fa";
  //   return "#4ade80";
  // };

  return (
    <div style={{
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '15px',
      backgroundColor: '#1e1e1e',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{name}</h3>
      <p style={{ fontSize: '0.8rem', color: '#aaa' }}></p>

      {/* <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', margin: '10px 0' }}>
        <div style={{ width: `${progress || 0}%`, height: '100%', backgroundColor: getBarColor(progress || 0), borderRadius: '4px' }}></div>
      </div> */}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{ color: color || '#4ade80', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
        >
          Open Resource →
        </a>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onEdit(_id, name, url)}
            style={{ backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem' }}
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(_id)}
            style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [links, setLinks] = useState([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("learning");

  useEffect(() => {
    fetch('http://localhost:5001/api/links')
      .then(res => res.json())
      .then(data => setLinks(data))
      .catch(err => console.error("Could not fetch links:", err));
  }, []);

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    const newLinkObject = {
      name: newName,
      url: newUrl,
      color: newCategory === 'social' ? "#6e57e0" : "#4ade80",
      category: newCategory
    };

    try {
      const response = await fetch('http://localhost:5001/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLinkObject)
      });
      const savedLink = await response.json();
      setLinks([...links, savedLink]); 
      setNewName("");
      setNewUrl("");
    } catch (err) {
      console.error("Error saving link:", err);
    }
  };

  // --- NEW: DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (window.confirm("Delete this link permanently?")) {
      try {
        await fetch(`http://localhost:5001/api/links/${id}`, { method: 'DELETE' });
        setLinks(links.filter(link => link._id !== id));
      } catch (err) {
        console.error("Error deleting link:", err);
      }
    }
  };

  const handleEdit = async (id, currentName, currentUrl) => {
  const updatedName = prompt("Edit link name:", currentName);
  const updatedUrl = prompt("Edit link URL:", currentUrl);

  if (updatedName && updatedUrl) {
    try {
      const response = await fetch(`http://localhost:5001/api/links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedName, url: updatedUrl })
      });
      
      const updatedData = await response.json();

      // If the backend sent back the updated object, swap it in the array
      if (response.ok) {
        setLinks(prevLinks => prevLinks.map(link => 
          link._id === id ? updatedData : link
        ));
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  }
};

  return (
    <div style={{ padding: '40px', color: 'white', backgroundColor: '#121212', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#333', borderRadius: '50%', margin: '0 auto 15px', border: '2px solid #4ade80' }}></div>
      </div>

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

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ minWidth: '300px' }}>
          <h2 style={{ borderBottom: '2px solid #6e57e0', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px' }}>Socials & Portfolio</h2>
          {links.filter(link => link.category === 'social').map(proj => (
            <ProjectCard 
              key={proj._id} 
              {...proj} 
              onDelete={handleDelete} 
              onEdit={handleEdit} 
            />
          ))}
        </div>

        <div style={{ minWidth: '300px' }}>
          <h2 style={{ borderBottom: '2px solid #4ade80', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px' }}>Learning Resources</h2>
          {links.filter(link => link.category === 'learning').map(proj => (
            <ProjectCard 
              key={proj._id} 
              {...proj} 
              onDelete={handleDelete} 
              onEdit={handleEdit} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;