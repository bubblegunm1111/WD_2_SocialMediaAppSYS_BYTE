import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { userService, postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const fallbackAvatar = (username) => (
  `https://api.dicebear.com/7.x/initials/svg?seed=${username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`
);

const Profile = () => {
  const { user: currentUser, updateUserContext } = useAuth();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [formData, setFormData] = useState({ displayName: '', bio: '' });
  const fileInputRef = useRef(null);

  const isOwnProfile = String(currentUser?._id || currentUser?.id) === String(userId);
  const isFollowing = user?.followers?.includes(currentUser?.id || currentUser?._id);
  const displayName = user?.displayName || user?.username || 'Wanderer';

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setUser({ ...user, followers: user.followers.filter(id => String(id) !== String(currentUser?.id || currentUser?._id)) });
      } else {
        await userService.followUser(userId);
        setUser({ ...user, followers: [...(user.followers || []), currentUser?.id || currentUser?._id] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        const [userResponse, postsResponse] = await Promise.all([
          userService.getUser(userId),
          postService.getPosts({ userId, isArchived: false, limit: 100 })
        ]);

        if (!isMounted) return;
        setUser(userResponse.data);
        setPosts(postsResponse.data || []);
        
        if (String(currentUser?._id || currentUser?.id) === String(userId)) {
          const [archivedResponse, savedResponse] = await Promise.all([
            postService.getPosts({ userId, isArchived: true, limit: 100 }),
            userService.getUserSavedPosts(userId)
          ]);
          setArchivedPosts(archivedResponse.data || []);
          setSavedPosts(savedResponse.data || []);
        }
        setFormData({
          displayName: userResponse.data.displayName || '',
          bio: userResponse.data.bio || ''
        });
      } catch (err) {
        if (isMounted) setError('Failed to load profile');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await userService.updateUser(userId, formData);
      setUser(response.data);
      if (isOwnProfile && updateUserContext) updateUserContext(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64String = reader.result;
        
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.src = base64String;
          await new Promise((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 400;
              let scale = 1;
              if (img.width > MAX_WIDTH) scale = MAX_WIDTH / img.width;
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              base64String = canvas.toDataURL('image/jpeg', 0.85);
              resolve();
            };
          });
        }

        try {
          const response = await userService.updateUser(userId, { profilePicture: base64String });
          setUser(response.data);
          if (isOwnProfile && updateUserContext) updateUserContext(response.data);
        } catch (err) {
          console.error("Failed to update avatar", err);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div style={{textAlign: 'center', paddingTop: '100px', color: '#eee5dc'}}>Opening the mystical room...</div>
        </main>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div style={{textAlign: 'center', paddingTop: '100px', color: '#eee5dc'}}>{error || 'Profile not found'}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <header className="profile-header">
          <Link to="/" style={{textDecoration: 'none'}}><button className="back-btn">← Back</button></Link>
          <h1>{isOwnProfile ? "Your Room ✦" : `${displayName}'s Room ✦`}</h1>
          {isOwnProfile ? (
            <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
              ⚙ {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          ) : (
            <button className="edit-btn" onClick={handleFollowToggle} style={{ background: isFollowing ? 'transparent' : '#caa77d', color: isFollowing ? '#caa77d' : '#070a1d', border: isFollowing ? '1px solid #caa77d' : 'none' }}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </header>

        <section className="profile-hero">
          <div className="profile-info">
            {isEditing ? (
              <form className="room-edit-form" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <label style={{display: 'flex', flexDirection: 'column', gap: '5px', color: '#d8ccd1'}}>
                  Display Name
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    style={{padding: '10px', background: 'transparent', border: '1px solid #caa77d', color: '#eee5dc', borderRadius: '5px'}}
                  />
                </label>
                <label style={{display: 'flex', flexDirection: 'column', gap: '5px', color: '#d8ccd1'}}>
                  Bio
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    style={{padding: '10px', background: 'transparent', border: '1px solid #caa77d', color: '#eee5dc', borderRadius: '5px', resize: 'none'}}
                  />
                </label>
                <button type="submit" style={{padding: '10px', background: '#caa77d', border: 'none', color: '#070a1d', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer'}}>
                  Save Changes
                </button>
              </form>
            ) : (
              <>
                <div className="avatar-container" onClick={() => isOwnProfile && fileInputRef.current?.click()} style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}>
                  <div 
                    className="avatar"
                    style={{ backgroundImage: `url(${user.profilePicture || fallbackAvatar(user.username)})` }}
                  ></div>
                  <div className="avatar-stars">
                    <span className="star-icon">✦</span>
                    <span className="star-icon">✧</span>
                    <span className="star-icon">✦</span>
                    <span className="star-icon">✧</span>
                  </div>
                  {isOwnProfile && (
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleAvatarChange} 
                    />
                  )}
                </div>

                <h2>{displayName}</h2>
                <p>"{user.bio || 'Collecting little beautiful things.'}"</p>

                <div className="stats">
                  <div><strong>{posts.length}</strong><span>Posts</span></div>
                  <div><strong>{user?.followers?.length || 0}</strong><span>Followers</span></div>
                  <div><strong>{user?.following?.length || 0}</strong><span>Following</span></div>
                </div>
              </>
            )}
          </div>

          <div className="room-image"></div>
        </section>

        <nav className="profile-tabs">
          <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>✧ Posts</button>
          {isOwnProfile && (
            <>
              <button className={activeTab === 'collections' ? 'active' : ''} onClick={() => setActiveTab('collections')}>♧ Collections</button>
              <button className={activeTab === 'memories' ? 'active' : ''} onClick={() => setActiveTab('memories')}>✦ Memories</button>
            </>
          )}
        </nav>

        <section className="post-grid">
          {activeTab === 'posts' && posts.filter(p => p.mediaUrl).map((post) => (
            <article 
              key={post._id}
              className="post-item"
              style={{ backgroundImage: `url(${post.mediaUrl})` }}
            ></article>
          ))}
          {activeTab === 'posts' && posts.filter(p => p.mediaUrl).length === 0 && (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#bcb2c0'}}>No image posts found.</div>
          )}

          {activeTab === 'collections' && archivedPosts.filter(p => p.mediaUrl).map((post) => (
            <article 
              key={post._id}
              className="post-item"
              style={{ backgroundImage: `url(${post.mediaUrl})` }}
            ></article>
          ))}
          {activeTab === 'collections' && archivedPosts.filter(p => p.mediaUrl).length === 0 && (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#bcb2c0'}}>No collections found.</div>
          )}

          {activeTab === 'memories' && savedPosts.filter(p => p.mediaUrl).map((post) => (
            <article 
              key={post._id}
              className="post-item"
              style={{ backgroundImage: `url(${post.mediaUrl})` }}
            ></article>
          ))}
          {activeTab === 'memories' && savedPosts.filter(p => p.mediaUrl).length === 0 && (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#bcb2c0'}}>No memories found.</div>
          )}
        </section>
      </div>
    </>
  );
};

export default Profile;
