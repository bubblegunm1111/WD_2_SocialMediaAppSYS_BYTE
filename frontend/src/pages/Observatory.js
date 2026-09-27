import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LuniarePet from '../components/LuniarePet';
import catGif from '../cat.gif';
import '../Dashboard.css';
import './Observatory.css';
import { postService } from '../services/api';

const Observatory = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [hoveredConstellation, setHoveredConstellation] = useState(null);
  const [discoveries, setDiscoveries] = useState([]);

  useEffect(() => {
    const fetchDiscoveries = async () => {
      try {
        const res = await postService.getPosts();
        if (res.data) setDiscoveries(res.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchDiscoveries();
  }, []);

  const handleWander = () => {
    alert("Wandering into the unknown... ✦\n(Imagine transitioning to a random user's page)");
  };

  const handleConstellationClick = (name) => {
    alert(`Entering the ${name} constellation... ✦`);
  };

  const constellations = [
    { id: 'art', name: 'ART', x: 20, y: 25, pages: '14.2K', creators: '4.1K', active: '84' },
    { id: 'books', name: 'BOOKS', x: 10, y: 55, pages: '9.8K', creators: '2.3K', active: '112' },
    { id: 'film', name: 'FILM', x: 30, y: 75, pages: '11.4K', creators: '3.5K', active: '45' },
    { id: 'writing', name: 'WRITING', x: 50, y: 85, pages: '31.2K', creators: '12K', active: '400' },
    { id: 'photography', name: 'PHOTOGRAPHY', x: 85, y: 65, pages: '24.8K', creators: '8.2K', active: '143' },
    { id: 'music', name: 'MUSIC', x: 75, y: 35, pages: '22.1K', creators: '7.8K', active: '230' },
  ];

  return (
    <div className="dashboard-layout observatory-layout">
      {/* Left Sidebar */}
      <aside className="sidebar-left">
        <div className="brand-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" strokeDasharray="1 3"/>
            <path d="M14 6C10 6 7 9 7 13C7 16.5 9.5 19.5 13 20C9.5 19 7.5 16 7.5 12C7.5 8.5 10 6.5 14 6Z" fill="currentColor"/>
            <path d="M12 2V4M12 20V22M2 12H4M20 12H22"/>
          </svg>
          LUNARIA
        </div>
        
        <nav className="side-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <span className="nav-icon"><svg viewBox="0 0 24 24"><path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10Z"/></svg></span> Home
          </Link>
          <Link to="/observatory" className={`nav-item ${location.pathname === '/observatory' ? 'active' : ''}`}>
            <span className="nav-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M4 20L20 4"/></svg></span> Observatory
          </Link>
          <a href="#" className="nav-item">
            <span className="nav-icon"><svg viewBox="0 0 24 24"><path d="M20 4C20 4 18 2 14 4C10 6 6 12 4 18L2 22L6 20C12 18 18 14 20 10C22 6 20 4 20 4Z M14 4C14 4 16 10 10 16"/></svg></span> Pages
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 6L12 13L21 6"/></svg></span> Letters
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon"><svg viewBox="0 0 24 24"><path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.9 4.9L7.7 7.7M16.3 16.3L19.1 19.1M4.9 19.1L7.7 16.3M16.3 4.9L19.1 7.7"/><circle cx="12" cy="12" r="3"/></svg></span> Reflections
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none"/></svg></span> My Room
          </a>
        </nav>

        <div className="companion-ornate-card">
          <img src={catGif} className="companion-cat-top" alt="Companion Cat" />
          <div className="companion-text">Your little companion<br/>is nearby...</div>
          <div className="companion-symbol">✧</div>
        </div>
      </aside>

      {/* Main Content (Observatory) */}
      <main className="obs-main">
        <header className="obs-header">
          <div className="obs-title-area">
            <h1>OBSERVATORY</h1>
            <p>Discover beyond your room</p>
          </div>
          
          <div className="obs-search-bar">
            <span className="obs-search-icon">⌕</span>
            <input type="text" placeholder="Search the night..." />
          </div>
        </header>

        <div className="obs-map-container">
          <svg className="obs-lines" width="100%" height="100%">
            <line x1="20%" y1="25%" x2="10%" y2="55%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="20%" y1="25%" x2="75%" y2="35%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="10%" y1="55%" x2="30%" y2="75%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="30%" y1="75%" x2="50%" y2="85%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="50%" y1="85%" x2="85%" y2="65%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="85%" y1="65%" x2="75%" y2="35%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </svg>

          {constellations.map((c) => (
            <div 
              key={c.id} 
              className={`obs-node ${hoveredConstellation === c.id ? 'active' : ''}`}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              onMouseEnter={() => setHoveredConstellation(c.id)}
              onMouseLeave={() => setHoveredConstellation(null)}
              onClick={() => handleConstellationClick(c.name)}
            >
              <div className="obs-node-star">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"/></svg>
              </div>
              <div className="obs-node-label">{c.name}</div>
              
              {hoveredConstellation === c.id && (
                <div className="obs-node-tooltip">
                  <h4>{c.name}</h4>
                  <p>{c.pages} Pages</p>
                  <p>{c.creators} creators</p>
                  <p className="active-stat">✦ {c.active} active tonight</p>
                </div>
              )}
            </div>
          ))}

          <div className="obs-wander-container">
            <button className="obs-wander-btn" onClick={handleWander}>
              <span className="wander-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"/></svg>
              </span> WANDER
            </button>
            <p>"Take me somewhere unexpected."</p>
          </div>
        </div>

        <div className="obs-bottom-sections">
          <div className="obs-tonight">
            <h3>───── Tonight's Discoveries ─────</h3>
            <div className="obs-tonight-cards">
              {discoveries.map((post, index) => (
                <div className="discovery-card" key={post._id || index}>
                  <div className={`disc-image ${index % 2 === 0 ? 'bg-photo' : 'bg-art'}`} style={{backgroundImage: post.image ? `url(${post.image})` : undefined}}></div>
                  <div className="disc-info">
                    <h4>@{post.user?.username || 'wanderer'}</h4>
                    <p>"{post.content?.substring(0, 40)}{post.content?.length > 40 ? '...' : ''}"</p>
                    <span>✦ {Math.floor(Math.random() * 200) + 50} Mesmerized</span>
                  </div>
                </div>
              ))}
              {discoveries.length === 0 && <p style={{color: '#ccc', fontStyle: 'italic'}}>No discoveries tonight...</p>}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar (Optional for Observatory, let's keep it similar to wireframe) */}
      <aside className="sidebar-right obs-sidebar-right">
        
        <div className="widget obs-widget">
          <div className="widget-header">
            <h3>✦ CONSTELLATIONS TONIGHT</h3>
          </div>
          <ul className="notification-list obs-list">
            <li>
              <div>
                <h4>Midnight Photographers</h4>
                <p>4.8K members</p>
              </div>
            </li>
            <li>
              <div>
                <h4>The Writers' Attic</h4>
                <p>2.1K members</p>
              </div>
            </li>
            <li>
              <div>
                <h4>Dreamcore</h4>
                <p>7.3K members</p>
              </div>
            </li>
            <li>
              <div>
                <h4>Indie Music</h4>
                <p>12K members</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="widget obs-widget">
          <div className="widget-header">
            <h3>✦ PEOPLE YOU MIGHT DISCOVER</h3>
          </div>
          <div className="obs-people">
            <div className="obs-person">
              <img src="https://i.pravatar.cc/150?img=1" alt="moonchild" />
              <div>
                <h4>moonchild</h4>
                <p>12 Pages</p>
              </div>
            </div>
            <div className="obs-person">
              <img src="https://i.pravatar.cc/150?img=9" alt="violetink" />
              <div>
                <h4>violetink</h4>
                <p>28 Pages</p>
              </div>
            </div>
            <div className="obs-person">
              <img src="https://i.pravatar.cc/150?img=12" alt="nocturne" />
              <div>
                <h4>nocturne</h4>
                <p>41 Pages</p>
              </div>
            </div>
          </div>
        </div>

        <div className="widget obs-widget orbit-widget">
          <div className="widget-header">
            <h3>NEAR YOUR ORBIT</h3>
          </div>
          <p className="orbit-sub">People whose worlds overlap with yours.</p>
          <div className="orbit-overlap">
            <span>Photography</span>
            <span>Books</span>
            <span>Night walks</span>
          </div>
          <div className="orbit-match">
            <div className="obs-person">
              <img src="https://i.pravatar.cc/150?img=5" alt="luna.archive" />
              <div>
                <h4>@luna.archive</h4>
                <p className="overlap-stat">✦ 42% of your interests overlap</p>
              </div>
            </div>
          </div>
        </div>

      </aside>

      <LuniarePet />
    </div>
  );
};

export default Observatory;
