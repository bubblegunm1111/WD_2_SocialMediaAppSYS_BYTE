import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { reflectionService } from '../services/api';
import './Reflections.css';

const MOODS = [
  { id: 'Peaceful', icon: '☾' },
  { id: 'Happy', icon: '☼' },
  { id: 'Restless', icon: '☁' },
  { id: 'Tired', icon: '♨' },
  { id: 'Lost', icon: '✢' },
  { id: 'Inspired', icon: '✺' },
  { id: 'Grateful', icon: '🙐' },
];

const Reflections = () => {
  const [reflections, setReflections] = useState([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      const res = await reflectionService.getReflections();
      setReflections(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const newRef = await reflectionService.createReflection({
        content,
        mood: selectedMood,
      });
      setReflections([newRef.data, ...reflections]);
      setContent('');
      setSelectedMood(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save reflection.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredReflections = reflections.filter((r) =>
    r.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentReflections = filteredReflections.slice(0, 4);
  const olderReflections = filteredReflections.slice(4, 7);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
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
          <Link to="/reflections" className={`nav-item ${location.pathname === '/reflections' ? 'active' : ''}`}>
            <span className="nav-icon"><svg viewBox="0 0 24 24"><path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.9 4.9L7.7 7.7M16.3 16.3L19.1 19.1M4.9 19.1L7.7 16.3M16.3 4.9L19.1 7.7"/><circle cx="12" cy="12" r="3"/></svg></span> Reflections
          </Link>
          <a href="#" className="nav-item">
            <span className="nav-icon"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none"/></svg></span> My Room
          </a>
        </nav>
        
        <div className="sidebar-footer">
          <p>A quiet mind creates a beautiful world. ✦</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="reflections-page">
        <div className="reflections-header">
          <div className="reflections-title">
            <div>
              <h1>REFLECTIONS ✦</h1>
              <div className="reflections-subtitle">Take a moment to look inward.</div>
            </div>
          </div>
          <div className="reflections-actions">
            <div className="search-bar">
              <span>⌕</span>
              <input 
                type="text" 
                placeholder="A moment, a thought, a you..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-new-reflection">☾ New Reflection</button>
          </div>
        </div>

        <div className="reflections-main">
          {/* Mood Section */}
          <div className="ref-card">
            <div className="ref-card-header">✦ How are you feeling tonight?</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '-10px 0 10px' }}>Choose the feeling that feels closest to you right now.</p>
            <div className="mood-selector">
              {MOODS.map(m => (
                <div 
                  key={m.id} 
                  className={`mood-btn ${selectedMood === m.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(m.id)}
                >
                  {m.icon}
                  <span className="mood-label">{m.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Editor Section */}
          <div className="ref-card">
            <div className="ref-card-header">🙐 What is on your mind?</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '-10px 0 15px' }}>Write your thoughts, worries, dreams... anything.</p>
            
            <div className="ref-editor">
              <textarea 
                placeholder="Your thoughts are safe here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={1000}
              />
              <div className="ref-editor-toolbar">
                <div className="ref-tools">
                  <button className="ref-tool-btn">📷</button>
                  <button className="ref-tool-btn">♫</button>
                  <button className="ref-tool-btn">🔗</button>
                  <button className="ref-tool-btn">⭐</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{content.length}/1000</span>
                  <button className="btn-save-ref" onClick={handleSave} disabled={isSaving}>
                    ✦ {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Journal Section */}
          <div className="ref-card" style={{ padding: '20px' }}>
            <div className="journal-header">
              <div className="ref-card-header" style={{ margin: 0 }}>☾ Your Moon Journal</div>
              <a href="#" className="view-all">View all</a>
            </div>
            
            <div className="journal-grid">
              {recentReflections.map(r => (
                <div key={r._id} className="journal-item">
                  <div className="journal-date">{formatDate(r.createdAt)}</div>
                  <div className="journal-snippet">{r.content}</div>
                  {r.mood && <div className="journal-mood">✦ {r.mood}</div>}
                  <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.3 }}>🔖</div>
                </div>
              ))}
              {recentReflections.length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.3)', padding: '20px', gridColumn: '1 / -1', textAlign: 'center' }}>
                  No reflections yet. Write your first thought above.
                </div>
              )}
            </div>
          </div>

          {/* Looking Back Section */}
          {olderReflections.length > 0 && (
            <div className="ref-card" style={{ padding: '20px' }}>
              <div className="journal-header">
                <div className="ref-card-header" style={{ margin: 0 }}>⌚ Looking Back</div>
                <a href="#" className="view-all">View all</a>
              </div>
              
              <div className="looking-back-grid">
                {olderReflections.map(r => (
                  <div key={r._id} className="looking-back-item">
                    <div className="lb-content">
                      <div className="lb-date">{formatDate(r.createdAt)}</div>
                      <div className="lb-text">"{r.content.substring(0, 40)}..."</div>
                      {r.mood && <div className="lb-sub">{r.mood}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="reflections-sidebar">
          <div className="sidebar-widget">
            <div className="widget-title">✦ Your Constellation</div>
            <div className="widget-subtitle">A glimpse into your inner world.</div>
            <div className="constellation-map">
              <div style={{ fontSize: '30px', color: 'rgba(220, 200, 150, 0.8)', textShadow: '0 0 10px rgba(220, 200, 150, 0.5)' }}>☾</div>
              {filteredReflections.slice(0, 5).map((r, i) => {
                const pos = [
                  { top: '20%', left: '30%' },
                  { top: '40%', right: '25%' },
                  { bottom: '30%', right: '35%' },
                  { top: '70%', left: '20%' },
                  { bottom: '15%', left: '50%' }
                ];
                const p = pos[i] || pos[0];
                const moodObj = MOODS.find(m => m.id === r.mood);
                const icon = moodObj ? moodObj.icon : '✦';
                
                return (
                  <div key={r._id} className="constellation-star" style={p}>
                    {icon}
                    <div className="constellation-tooltip">
                      <div className="tt-date">{formatDate(r.createdAt)}</div>
                      <div className="tt-content">{r.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="info-row">
              <div className="info-icon">🌑</div>
              <div className="info-text">
                <h4>Waxing Crescent</h4>
                <p>18% visible</p>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(220,200,150,0.1)', margin: '15px 0' }}></div>
            
            <div className="widget-title" style={{ fontSize: '14px' }}>✦ Tonight's Sky</div>
            <div className="info-row" style={{ marginTop: '15px' }}>
              <div className="info-icon" style={{ background: 'transparent' }}>⚝</div>
              <div className="info-text">
                <h4>Venus</h4>
                <p>Brightest in the west</p>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon" style={{ background: 'transparent' }}>♃</div>
              <div className="info-text">
                <h4>Jupiter</h4>
                <p>Visible throughout the evening</p>
              </div>
            </div>
          </div>

          <div className="sidebar-widget quote-widget">
            <p>Not all storms<br/>come to destroy you.</p>
            <p style={{ marginTop: '10px' }}>Some come to clear<br/>your path.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reflections;
