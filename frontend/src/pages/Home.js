import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import LuniarePet from '../components/LuniarePet';
import MessagesModal from '../components/MessagesModal';
import FlexCarousel from '../components/FlexCarousel';
import { postService } from '../services/api';
import '../Dashboard.css';
import catGif from '../cat.gif';

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts();
      setPosts(response.data);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    if (selectedPost && selectedPost._id === postId) {
      setSelectedPost(null);
    }
  };

  return (
    <div className="dashboard-layout">
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
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setIsMessagesOpen(true); }}>
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

      {/* Main Content (Feed) */}
      <main className="main-feed">
        <header className="main-header">
          <div>
            <h1 className="greeting">Good evening, {user?.displayName || user?.username?.split('_')[0] || 'Magician'} ✧</h1>
            <p className="greeting-sub">The night is young, and there are so many stories waiting to be found.</p>
          </div>
          <div className="top-nav-icons">
            <span className="icon-btn">⍾</span>
            <span className="icon-btn">✉</span>
            <span className="icon-btn">✧</span>
            <Link to={`/profile/${user?._id || user?.id}`}>
              <img src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} alt="Profile" className="nav-avatar" />
            </Link>
          </div>
        </header>

        <div className="feed-scrollable">
          <CreatePost onPostCreated={handlePostCreated} />

          <div className="section-title" style={{marginTop: '30px', marginBottom: '10px'}}>
            <span>☾ Recent from Your Constellations ✧</span>
            <a href="#" className="view-all">View all</a>
          </div>
          
          <div className="feed-posts" style={{ marginTop: '0' }}>
            {loading ? (
              <div className="loading">Gathering stories...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                <FlexCarousel 
                  items={posts.map(post => ({
                    src: post.mediaUrl || post.image || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
                    title: post.user?.displayName || post.user?.username || 'Unknown',
                    subtitle: post.title || (post.content && post.content.substring(0, 40) + (post.content.length > 40 ? '...' : '')),
                    alt: 'Post image',
                    _original: post
                  }))}
                  onSelect={(idx, item) => setSelectedPost(item._original)}
                  preset="liquid"
                  intro="rise"
                  cardHeight={0.65}
                  gap={24}
                  squeeze={0.15}
                  bend={0}
                  tilt={0}
                  liquid={0}
                  curl={0}
                  dispersion={0}
                  focusOnClick
                  captions
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="sidebar-right">
        
        <div className="widget">
          <div className="widget-header">
            <h3>☾ Tonight</h3>
            <a href="#">View all</a>
          </div>
          <ul className="notification-list">
            <li>
              <div className="notif-icon">✉</div>
              <p>A letter from someone in Paris</p>
            </li>
            <li>
              <div className="notif-icon">⧉</div>
              <p>Three beautiful illustrations</p>
            </li>
            <li>
              <div className="notif-icon">⌕</div>
              <p>A midnight photography collection</p>
            </li>
            <li>
              <div className="notif-icon">✧</div>
              <p>Someone just created a new constellation</p>
            </li>
            <li>
              <div className="notif-icon">▤</div>
              <p>12 people are journaling</p>
            </li>
          </ul>
        </div>

        <div className="widget">
          <div className="widget-header">
            <h3>🏰 Your Room</h3>
            <a href="#">View Room</a>
          </div>
          <div className="room-user">
            <Link to={`/profile/${user?._id || user?.id}`}>
              <img src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} alt="User" />
            </Link>
            <div>
              <h4>{user?.displayName || user?.username || 'You'}</h4>
              <p>Collecting little beautiful things.</p>
            </div>
          </div>
          <div className="room-stats">
            <div><strong>12</strong><span>Pages</span></div>
            <div><strong>8</strong><span>Constellations</span></div>
            <div><strong>426</strong><span>Followers</span></div>
          </div>
          
          <div className="companion-box">
             <div className="companion-avatar">
               <img src={catGif} className="companion-video-avatar" alt="Mooncat" />
             </div>
             <div className="companion-details">
                <p>Your companion</p>
                <h4>Mooncat</h4>
                <span>(happy)</span>
             </div>
          </div>
        </div>

        <div className="widget">
          <h3>✧ Quick Actions</h3>
          <br/>
          <div className="quick-actions-grid">
            <button>✎ Write a Page</button>
            <button>⌖ Explore Observatory</button>
            <button>✉ Check Letters</button>
            <button>⌂ Visit Memory House</button>
          </div>
        </div>

      </aside>

      {/* Luniare Pet Companion */}
      <LuniarePet />

      {/* Messages Modal */}
      {isMessagesOpen && <MessagesModal onClose={() => setIsMessagesOpen(false)} />}
      
      {/* Post Modal */}
      {selectedPost && (
        <div className="post-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPost(null)} style={{ position: 'absolute', right: '20px', top: '20px', zIndex: 10 }}>✕</button>
            <Post post={selectedPost} onDelete={handlePostDeleted} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
