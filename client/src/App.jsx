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
      position: 'relative',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{name}</h3>
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
            style={{ backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(_id)}
            style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
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
  
  // --- FOLDER & MODAL STATES ---
  const [categoryOption, setCategoryOption] = useState("Saved"); 
  const [customCategory, setCustomCategory] = useState("");     
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the add link popup

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

  const toggleFolder = (folderName) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
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
      color: finalCategory === 'Saved' ? "#4ade80" : "#60a5fa" 
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
      setIsModalOpen(false); // Close modal on success
      
      if (collapsedFolders[finalCategory]) {
        toggleFolder(finalCategory);
      }
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

  const inputStyles = {
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #3f3f3f',
    backgroundColor: '#262626',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%'
  };

  return (
    <div style={{ padding: '40px', color: 'white', backgroundColor: '#121212', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* Top Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 40px auto' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '1px', fontWeight: '800' }}>LINKHUB</h2>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => setIsModalOpen(true)} 
            style={{ backgroundColor: '#4ade80', border: 'none', color: '#000', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s' }}
          >
            + Add Link
          </button>
          <button 
            onClick={handleLogout} 
            style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Modal Overlay for Adding Links */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ 
            width: '100%', maxWidth: '500px', backgroundColor: '#1e1e1e', 
            padding: '30px', borderRadius: '16px', border: '1px solid #333',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#aaa', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h3 style={{ marginTop: 0, marginBottom: '25px', fontSize: '1.3rem', color: '#4ade80', fontWeight: '600' }}>Add new link</h3>
            
            <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '500' }}>Name</label>
                <input 
                  type="text" placeholder="e.g. Reddit" value={newName} 
                  onChange={(e) => setNewName(e.target.value)} style={inputStyles}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '500' }}>URL</label>
                <input 
                  type="url" placeholder="https://..." value={newUrl} 
                  onChange={(e) => setNewUrl(e.target.value)} style={inputStyles}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '500' }}>Folder</label>
                  <select 
                    value={categoryOption} onChange={(e) => setCategoryOption(e.target.value)}
                    style={{ ...inputStyles, cursor: 'pointer', appearance: 'auto' }}
                  >
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="NEW_FOLDER" style={{ color: '#60a5fa', fontWeight: 'bold' }}>+ New Subfolder</option>
                  </select>
                </div>

                {categoryOption === "NEW_FOLDER" && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: '500' }}>Folder Name</label>
                    <input 
                      type="text" placeholder="e.g. Work" value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      style={{ ...inputStyles, border: '1px solid #60a5fa' }}
                    />
                  </div>
                )}
              </div>

              <button type="submit" style={{ 
                padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#4ade80', color: '#000', 
                fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px'
              }}>
                Save Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid Layout - FIX FOR THE STRETCHING ISSUE */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '30px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {uniqueCategories.map(folderName => {
          const folderLinks = links.filter(link => {
            const currentCat = link.category || "Saved";
            return currentCat === folderName;
          });

          if (folderName !== "Saved" && folderLinks.length === 0) return null;
          
          const isCollapsed = collapsedFolders[folderName];

          return (
            <div key={folderName} style={{ 
              backgroundColor: '#161616', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid #252525',
              height: 'fit-content'
            }}>
              {/* Header with Toggle Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: `2px solid ${folderName === 'Saved' ? '#4ade80' : '#60a5fa'}`,
                paddingBottom: '8px', 
                marginBottom: '20px'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'capitalize' }}>
                  {folderName} <span style={{ color: '#888', fontSize: '1rem' }}>({folderLinks.length})</span>
                </h2>
                <button 
                  onClick={() => toggleFolder(folderName)}
                  style={{ 
                    backgroundColor: 'transparent', border: 'none', color: '#888', cursor: 'pointer', 
                    fontSize: '1rem', padding: '5px', display: 'flex', alignItems: 'center'
                  }}
                >
                  {isCollapsed ? '▶' : '▼'}
                </button>
              </div>

              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {folderLinks.length === 0 ? (
                    <p style={{ color: '#555', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>No links yet.</p>
                  ) : (
                    folderLinks.map(proj => (
                      <ProjectCard key={proj._id} {...proj} onDelete={handleDelete} onEdit={handleEdit} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default App;