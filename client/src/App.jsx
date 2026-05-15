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
  const [links, setLinks] = useState([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  
  // --- FOLDER STATES ---
  const [categoryOption, setCategoryOption] = useState("Saved"); 
  const [customCategory, setCustomCategory] = useState("");     

  // Dynamically extract folders, strictly ignoring the old 'learning' and 'social' defaults
  const uniqueCategories = [
    "Saved",
    ...new Set(
      links
        .map(link => link.category)
        .filter(cat => cat && cat !== "Saved" && cat !== "learning" && cat !== "social")
    )
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setLinks([]);
  };

  const handleAuthSuccess = () => {
    setToken(localStorage.getItem('token'));
  };

  // FETCH LINKS
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5001/api/links', {
      headers: { 'x-auth-token': token }
    })
      .then(res => {
        if (res.status === 401) handleLogout();
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setLinks(data);
      })
      .catch(err => console.error("Could not fetch links:", err));
  }, [token]);

  // ADD LINK
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    let finalCategory = categoryOption;
    if (categoryOption === "NEW_FOLDER") {
      finalCategory = customCategory.trim() || "Saved";
    }

    const newLinkObject = {
      name: newName,
      url: newUrl,
      category: finalCategory,
      color: finalCategory === 'Saved' ? "#4ade80" : "#60a5fa" // Green for default, Blue for custom folders
    };

    try {
      const response = await fetch('http://localhost:5001/api/links', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify(newLinkObject)
      });
      
      if (!response.ok) throw new Error("Failed to save link");
      
      const savedLink = await response.json();
      setLinks([...links, savedLink]); 
      
      setNewName("");
      setNewUrl("");
      setCustomCategory("");
      setCategoryOption("Saved"); 
    } catch (err) {
      console.error("Error saving link:", err);
    }
  };

  // DELETE LINK
  const handleDelete = async (id) => {
    if (window.confirm("Delete this link permanently?")) {
      try {
        const response = await fetch(`http://localhost:5001/api/links/${id}`, { 
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (response.ok) {
          setLinks(links.filter(link => link._id !== id));
        }
      } catch (err) {
        console.error("Error deleting link:", err);
      }
    }
  };

  // EDIT LINK
  const handleEdit = async (id, currentName, currentUrl) => {
    const updatedName = prompt("Edit link name:", currentName);
    const updatedUrl = prompt("Edit link URL:", currentUrl);

    if (updatedName && updatedUrl) {
      try {
        const response = await fetch(`http://localhost:5001/api/links/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token 
          },
          body: JSON.stringify({ name: updatedName, url: updatedUrl })
        });
        const updatedData = await response.json();
        if (response.ok) {
          setLinks(prevLinks => prevLinks.map(link => link._id === id ? updatedData : link));
        }
      } catch (err) {
        console.error("Update failed:", err);
      }
    }
  };

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // 2. If a token exists, render the main dashboard layout
  return (
    <div style={{ padding: '40px', color: 'white', backgroundColor: '#121212', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Top Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', backgroundColor: '#333', borderRadius: '50%', border: '2px solid #4ade80' }}></div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '0.5px' }}>LINKHUB</h2>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
          LOGOUT
        </button>
      </div>

      {/* Control Form Block */}
      <div style={{ maxWidth: '700px', margin: '0 auto 50px auto', padding: '25px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem', color: '#4ade80' }}>Add new link</h3>
        <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Link Name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white' }}
            />
            <input 
              type="url" 
              placeholder="Link URL" 
              value={newUrl} 
              onChange={(e) => setNewUrl(e.target.value)}
              style={{ flex: 2, padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Choose Subfolder</label>
              <select 
                value={categoryOption} 
                onChange={(e) => setCategoryOption(e.target.value)}
                style={{ padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white', cursor: 'pointer' }}
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="NEW_FOLDER" style={{ color: '#60a5fa', fontWeight: 'bold' }}>[Create New Subfolder]</option>
              </select>
            </div>

            {categoryOption === "NEW_FOLDER" && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', color: '#60a5fa' }}>Name</label>
                <input 
                  type="text" 
                  placeholder="" 
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid #60a5fa', backgroundColor: '#222', color: 'white' }}
                />
              </div>
            )}
          </div>

          <button type="submit" style={{ padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#4ade80', color: 'black', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
            Add
          </button>
        </form>
      </div>

      {/* Dynamic Grid Distribution Display */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'flex-start', maxWidth: '1200px', margin: '0 auto' }}>
        {uniqueCategories.map(folderName => {
          const folderLinks = links.filter(link => {
            const currentCat = link.category || "Saved";
            return currentCat === folderName;
          });

          // Don't draw empty custom folders, but always render 'Saved' even if empty
          if (folderName !== "Saved" && folderLinks.length === 0) return null;

          return (
            <div key={folderName} style={{ flex: '1', minWidth: '300px', maxWidth: '380px', backgroundColor: '#161616', padding: '20px', borderRadius: '10px', border: '1px solid #252525' }}>
              <h2 style={{ borderBottom: `2px solid ${folderName === 'Saved' ? '#4ade80' : '#60a5fa'}`, width: 'fit-content', paddingBottom: '5px', marginBottom: '20px', fontSize: '1.2rem', textTransform: 'capitalize' }}>
                {folderName} ({folderLinks.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {folderLinks.map(proj => (
                  <ProjectCard 
                    key={proj._id} 
                    {...proj} 
                    onDelete={handleDelete} 
                    onEdit={handleEdit} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default App;