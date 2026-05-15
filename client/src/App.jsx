import React, { useState, useEffect } from 'react';
import Auth from './Auth';

const ProjectCard = ({ _id, name, url, progress, color, onDelete, onEdit }) => { 
  
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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [links, setLinks] = useState([]); // Cleaned up the duplicate state line here
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("learning");

  // --- AUTH COMPONENT TRACKERS ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setLinks([]);
  };

  const handleAuthSuccess = () => {
    setToken(localStorage.getItem('token'));
  };

  // 1. FETCH LINKS (Modified to look for and send token)
  useEffect(() => {
    if (!token) return; // Do not fetch if there is no logged-in user

    fetch('http://localhost:5001/api/links', {
      headers: { 'x-auth-token': token } // Pass token checkpoint to backend
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout(); // Auto-logout if token is invalid or expired
          throw new Error("Session expired. Please log in again.");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setLinks(data);
      })
      .catch(err => console.error("Could not fetch links:", err));
  }, [token]); // Refetches immediately when a user logs in

  // 2. ADD LINK (Modified to send token)
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
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token // Assigns current user ownership in MongoDB
        },
        body: JSON.stringify(newLinkObject)
      });
      
      if (!response.ok) throw new Error("Failed to save link");
      
      const savedLink = await response.json();
      setLinks([...links, savedLink]); 
      setNewName("");
      setNewUrl("");
    } catch (err) {
      console.error("Error saving link:", err);
    }
  };

  // 3. DELETE LINK (Modified to send token)
  const handleDelete = async (id) => {
    if (window.confirm("Delete this link permanently?")) {
      try {
        const response = await fetch(`http://localhost:5001/api/links/${id}`, { 
          method: 'DELETE',
          headers: { 'x-auth-token': token } // Verifies delete ownership
        });

        if (response.ok) {
          setLinks(links.filter(link => link._id !== id));
        } else {
          const errData = await response.json();
          alert(errData.message || "Failed to delete resource");
        }
      } catch (err) {
        console.error("Error deleting link:", err);
      }
    }
  };

  // 4. EDIT LINK (Modified to send token)
  const handleEdit = async (id, currentName, currentUrl) => {
    const updatedName = prompt("Edit link name:", currentName);
    const updatedUrl = prompt("Edit link URL:", currentUrl);

    if (updatedName && updatedUrl) {
      try {
        const response = await fetch(`http://localhost:5001/api/links/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token // Verifies update ownership
          },
          body: JSON.stringify({ name: updatedName, url: updatedUrl })
        });
        
        const updatedData = await response.json();

        if (response.ok) {
          setLinks(prevLinks => prevLinks.map(link => 
            link._id === id ? updatedData : link
          ));
        } else {
          alert(updatedData.message || "Failed to update resource");
        }
      } catch (err) {
        console.error("Update failed:", err);
      }
    }
  };

  // 1. If there is no token, completely intercept and show the Login/Signup page
  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // 2. If a token exists, render the main dashboard layout
  return (
    <div style={{ padding: '40px', color: 'white', backgroundColor: '#121212', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Top Header Row with Profile Circle and Logout Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', backgroundColor: '#333', borderRadius: '50%', border: '2px solid #4ade80' }}></div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '0.5px' }}>LINKHUB</h2>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: '0.2s' }}
        >
          Logout
        </button>
      </div>

      {/* Add a New Link Form Box */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem', color: '#4ade80' }}>Add Links</h3>
        <form onSubmit={handleAddLink} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Name" 
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
            style={{ padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white', cursor: 'pointer' }}
          >
            <option value="learning">Learning</option>
            <option value="social">Social</option>
          </select>
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4ade80', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
            Add
          </button>
        </form>
      </div>

      {/* Two-Column Links View Layout */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Socials Column */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '450px' }}>
          <h2 style={{ borderBottom: '2px solid #6e57e0', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px', fontSize: '1.3rem' }}>Socials & Portfolio</h2>
          {links.filter(link => link.category === 'social').map(proj => (
            <ProjectCard 
              key={proj._id} 
              {...proj} 
              onDelete={handleDelete} 
              onEdit={handleEdit} 
            />
          ))}
        </div>

        {/* Learning Resources Column */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '450px' }}>
          <h2 style={{ borderBottom: '2px solid #4ade80', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px', fontSize: '1.3rem' }}>Learning Resources</h2>
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