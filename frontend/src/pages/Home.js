import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { postService } from '../services/api';
import '../Dashboard.css';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  };

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <aside className="sidebar-left">
        <div className="brand-logo">
          ☾ LUMINARIA
        </div>
        
        <nav className="side-nav">
          <a href="#" className="nav-item active"><span>✧</span> Home</a>
          <a href="#" className="nav-item"><span>⌖</span> Observatory</a>
          <a href="#" className="nav-item"><span>☙</span> Pages</a>
          <a href="#" className="nav-item"><span>✉</span> Letters</a>
          <a href="#" className="nav-item"><span>✦</span> Reflections</a>
          <a href="#" className="nav-item"><span>☾</span> My Room</a>
        </nav>

        <div className="companion-widget">
          <div className="companion-text">Your companion<br/>is nearby...</div>
          <div style={{fontSize: '40px', position: 'absolute', right: '10px', bottom: '10px'}}>⚸</div>
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
            <img src={user?.profilePicture || 'https://i.pravatar.cc/150?img=5'} alt="Profile" className="nav-avatar" />
          </div>
        </header>

        <div className="feed-scrollable">
          <CreatePost onPostCreated={handlePostCreated} />

          {/* Dummy sections matching the UI */}
          <div className="section-title">
            <span>☾ Recent from Your Constellations</span>
            <a href="#" className="view-all">View all</a>
          </div>
          <div className="constellations-grid">
            <div className="constellation-card bg-art">
              <div className="card-info">
                <h4>Art & Creators</h4>
                <p>1.2k members</p>
              </div>
            </div>
            <div className="constellation-card bg-photo">
              <div className="card-info">
                <h4>Photography</h4>
                <p>856 members</p>
              </div>
            </div>
            <div className="constellation-card bg-music">
              <div className="card-info">
                <h4>Music</h4>
                <p>942 members</p>
              </div>
            </div>
            <div className="constellation-card bg-books">
              <div className="card-info">
                <h4>Books</h4>
                <p>623 members</p>
              </div>
            </div>
          </div>

          <div className="section-title" style={{marginTop: '30px'}}>
            <span>✦ Moments from People You Might Like</span>
            <a href="#" className="view-all">View all</a>
          </div>
          
          <div className="feed-posts">
            {loading ? (
              <div className="loading">Gathering stories...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <h3>No stories yet</h3>
                <p>Be the first to share something magical!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  onDelete={handlePostDeleted}
                />
              ))
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
            <img src={user?.profilePicture || 'https://i.pravatar.cc/150?img=5'} alt="User" />
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
             <div className="companion-avatar">⚸</div>
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
    </div>
  );
};

export default Home;
