import React from 'react';

// 1. Separate Component for the Cards
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
      
      {/* Progress Bar */}
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
  const myLinks = [
    { id: 1, name: "Main Portfolio", url: "https://arsh.dev", color: "#6e57e0", progress: 100 },
    { id: 2, name: "GitHub Profile", url: "https://github.com/Arsh-M-Rasania", color: "#333", progress: 100 },
    { id: 3, name: "LinkedIn", url: "https://linkedin.com/in/arsh", color: "#0077b5", progress: 100 },
    { id: 4, name: "Civil Engineering Blog", url: "https://kgp-blog.com", color: "#e67e22", progress: 50 }
  ];

  const otherProjects = [
    { id: 5, name: "Mongo DB University", progress: 0, url: "https://www.mongodb.com/resources/languages/mern-stack-tutorial" },
    { id: 6, name: "Mern blog", progress: 0, url: "https://nareshit.com/blogs/full-stack-project-build-a-mern-to-do-application" },
    { id: 7, name: "University of Helsinki", progress: 0, url: "https://fullstackopen.com/en/" },
    { id: 8, name: "Github resource", progress: 0, url: "https://github.com/AmanKumarSinhaGitHub/MERN" }
  ];

  return (
    <div style={{ 
      padding: '40px', 
      color: 'white', 
      backgroundColor: '#121212', 
      minHeight: '100vh', 
      fontFamily: 'sans-serif'
    }}>
      
      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#333', borderRadius: '50%', margin: '0 auto 15px', border: '2px solid #4ade80' }}></div>
        <h1>Arsh M. Rasania</h1>
        <p style={{ color: '#888' }}>24CE10034 | IIT Kharagpur</p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '40px', 
        flexWrap: 'wrap', 
        justifyContent: 'center' 
      }}>
        
        {/* LEFT COLUMN: My Links */}
        <div>
          <h2 style={{ borderBottom: '2px solid #6e57e0', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px' }}>Socials & Portfolio</h2>
          {myLinks.map((proj) => (
            <ProjectCard key={proj.id} {...proj} />
          ))}
        </div>

        {/* RIGHT COLUMN: Tasks */}
        <div>
          <h2 style={{ borderBottom: '2px solid #4ade80', width: 'fit-content', paddingBottom: '5px', marginBottom: '20px' }}>Learning Resources</h2>
          {otherProjects.map((proj) => (
            <ProjectCard key={proj.id} {...proj} />
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;