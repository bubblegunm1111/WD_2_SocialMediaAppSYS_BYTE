import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import MessagesModal from '../components/MessagesModal';
import TarotCarousel from '../components/TarotCarousel';
import SidebarNav from '../components/SidebarNav';
import PetCard from '../components/PetCard';
import { postService, notificationService, userService } from '../services/api';
import '../Dashboard.css';
import '../components/PostModal.css';
import catGif from '../cat.gif';

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [followedBack, setFollowedBack] = useState({});

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

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

  const handleFollowBack = async (senderId, notifId) => {
    try {
      await userService.followUser(senderId);
      await notificationService.markAsRead(notifId);
      setFollowedBack(prev => ({ ...prev, [senderId]: true }));
    } catch (err) {
      console.error('Failed to follow back:', err);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const feedPosts = posts.filter(p => !p.isStory && !p.isNote);
  const storyPosts = posts.filter(p => p.isStory && !p.isNote);

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
        
        <SidebarNav onLettersClick={() => setIsMessagesOpen(true)} />

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
            <Link to={`/profile/${user?._id || user?.id}`}>
              <img src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} alt="Profile" className="nav-avatar" />
            </Link>
          </div>
        </header>

        <div className="feed-scrollable">
          <CreatePost onPostCreated={handlePostCreated} />

          <div className="section-title" style={{marginTop: '30px', marginBottom: '10px'}}>
            <span>☾ Stories ✧</span>
            <a href="#" className="view-all">View all</a>
          </div>
          
          <div className="feed-posts" style={{ marginTop: '0' }}>
            {loading ? (
              <div className="loading">Gathering stories...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <TarotCarousel posts={storyPosts} onStoryCreated={handlePostCreated} onStoryDeleted={handlePostDeleted} />
            )}
          </div>

          <div className="section-title" style={{marginTop: '50px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span>☾ Recent Posts ✧</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ background: 'transparent', border: 'none', color: viewMode === 'grid' ? '#caa77d' : '#888', cursor: 'pointer', fontSize: '18px' }}
              >⊞</button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ background: 'transparent', border: 'none', color: viewMode === 'list' ? '#caa77d' : '#888', cursor: 'pointer', fontSize: '18px' }}
              >☰</button>
            </div>
          </div>

          <div 
            className="feed-posts-container" 
            style={viewMode === 'grid' 
              ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' } 
              : { display: 'flex', flexDirection: 'column', gap: '24px' }
            }
          >
            {loading ? (
              <div className="loading">Gathering posts...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              feedPosts.map(post => (
                <Post key={post._id} post={post} onDelete={handlePostDeleted} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="sidebar-right">
        
        <div className="widget" style={{position: 'relative'}}>
          <div style={{position: 'absolute', top: 8, left: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div style={{position: 'absolute', top: 8, right: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div style={{position: 'absolute', bottom: 8, left: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div style={{position: 'absolute', bottom: 8, right: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div className="widget-header">
            <h3>✧ CONNECTIONS</h3>
            <a href="#">View all</a>
          </div>
          <ul className="notification-list">
            {notifications.filter(n => n.type === 'follow').slice(0, 3).map(notif => (
              <li key={notif._id}>
                <div className="notif-icon">
                  <img src={notif.sender?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${notif.sender?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} style={{width:'100%', height:'100%', borderRadius:'10px'}} alt=""/>
                </div>
                <div style={{flex: 1}}>
                  <p style={{color: '#fff', fontSize: '13px', marginBottom: '4px'}}><strong>{notif.sender?.displayName || notif.sender?.username}</strong> started following you.</p>
                  {followedBack[notif.sender?._id] ? (
                    <span style={{color: '#caa77d', fontSize: '11px'}}>✦ Following back</span>
                  ) : (
                    <button
                      onClick={() => handleFollowBack(notif.sender?._id, notif._id)}
                      style={{background: 'transparent', border: '1px solid #caa77d', color: '#caa77d', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer'}}
                    >Follow Back</button>
                  )}
                </div>
              </li>
            ))}
            {notifications.filter(n => n.type === 'follow').length === 0 && (
              <li style={{color: 'rgba(255,255,255,0.4)', fontSize: '13px', border: 'none'}}>No new connections</li>
            )}
          </ul>
        </div>

        <div className="widget" style={{position: 'relative'}}>
          <div style={{position: 'absolute', top: 8, left: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div style={{position: 'absolute', top: 8, right: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div style={{position: 'absolute', bottom: 8, left: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div style={{position: 'absolute', bottom: 8, right: 8, color: 'rgba(220,200,150,0.3)', fontSize: '8px'}}>✦</div>
          <div className="widget-header">
            <h3>☾ NOTIFICATIONS</h3>
            <a href="#">View all</a>
          </div>
          <ul className="notification-list">
            {notifications.filter(n => n.type !== 'follow').slice(0, 5).map(notif => (
              <li key={notif._id} style={{ cursor: notif.type === 'message' ? 'pointer' : 'default' }}
                onClick={() => notif.type === 'message' && setIsMessagesOpen(true)}
              >
                <div className="notif-icon" style={{
                  background: notif.type === 'like' ? 'rgba(255, 77, 77, 0.1)' : notif.type === 'message' ? 'rgba(142, 108, 255, 0.1)' : 'rgba(202, 167, 125, 0.1)',
                  color: notif.type === 'like' ? '#ff4d4d' : notif.type === 'message' ? '#8e6cff' : '#caa77d',
                  fontSize: '18px'
                }}>
                  {notif.type === 'like' ? '♥' : notif.type === 'message' ? '✉' : notif.type === 'comment' ? '💬' : '✧'}
                </div>
                <p><strong>{notif.sender?.displayName || notif.sender?.username}</strong> {
                  notif.type === 'like' ? 'liked your post.' :
                  notif.type === 'comment' ? 'commented on your post.' :
                  notif.type === 'message' ? <span style={{color: '#8e6cff'}}>sent you a letter. <span style={{fontSize:'10px', opacity: 0.7}}>Click to open →</span></span> :
                  'interacted with you.'
                }</p>
              </li>
            ))}
            {notifications.filter(n => n.type !== 'follow').length === 0 && (
              <li style={{color: 'rgba(255,255,255,0.4)', fontSize: '13px', border: 'none'}}>No new notifications</li>
            )}
          </ul>
        </div>

        <PetCard catGif={catGif} />



      </aside>

      {/* Messages Modal */}
      {isMessagesOpen && <MessagesModal onClose={() => setIsMessagesOpen(false)} />}
    </div>
  );
};

export default Home;
