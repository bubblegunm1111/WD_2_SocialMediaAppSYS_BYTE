import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const fallbackAvatar = (username) => (
  `https://api.dicebear.com/7.x/initials/svg?seed=${username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`
);

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [formData, setFormData] = useState({ displayName: '', bio: '' });

  const isOwnProfile = String(currentUser?._id || currentUser?.id) === String(userId);
  const displayName = user?.displayName || user?.username || 'Wanderer';

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        const [userResponse, postsResponse] = await Promise.all([
          userService.getUser(userId),
          userService.getUserPosts(userId)
        ]);

        if (!isMounted) return;
        setUser(userResponse.data);
        setPosts(postsResponse.data || []);
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

  const postImages = useMemo(
    () => posts.filter((post) => post.mediaUrl).slice(0, 6),
    [posts]
  );

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await userService.updateUser(userId, formData);
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="profile-room-page">
          <div className="profile-loading">Opening the mystical room...</div>
        </main>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navbar />
        <main className="profile-room-page">
          <div className="profile-error">{error || 'Profile not found'}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="profile-room-page">
        <div className="profile-room-shell">
          {/* Header */}
          <div className="profile-header">
            <Link to="/" className="room-back-link">
              ← Back
            </Link>
            <div className="profile-header-title">
              {isOwnProfile ? "Your Room" : `${displayName}'s Room`}
            </div>
            {isOwnProfile && !isEditing && (
              <button
                type="button"
                className="room-back-link"
                onClick={() => setIsEditing(true)}
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
              >
                ⚙ Edit Room
              </button>
            )}
            {!isOwnProfile && <div style={{ width: '80px' }}></div>}
          </div>

          <div className="profile-main-content">
            {/* Left Sidebar - Profile Info */}
            <aside className="profile-sidebar">
              {isEditing ? (
                <form className="room-edit-form" onSubmit={handleSubmit}>
                  <label>
                    Display Name
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      maxLength="50"
                      placeholder="Your display name"
                    />
                  </label>
                  <label>
                    Bio
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      maxLength="500"
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </label>
                  <div className="room-edit-actions">
                    <button type="submit" className="room-primary-button">Save Changes</button>
                    <button
                      type="button"
                      className="room-quiet-button"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="room-avatar-wrap">
                    <img
                      src={user.profilePicture || fallbackAvatar(user.username)}
                      alt={displayName}
                      className="room-avatar"
                    />
                  </div>

                  <div className="room-hero">
                    <h1>{displayName}</h1>
                    <p className="room-handle">@{user.username}</p>
                    <p className="room-bio">
                      {user.bio || '"Collecting little beautiful things beneath the moon."'}
                    </p>
                  </div>

                  <div className="room-stats">
                    <div>
                      <strong>{posts.length}</strong>
                      <span>Posts</span>
                    </div>
                    <div>
                      <strong>1.5k</strong>
                      <span>Followers</span>
                    </div>
                    <div>
                      <strong>242</strong>
                      <span>Following</span>
                    </div>
                  </div>

                  <div className="room-actions">
                    {isOwnProfile ? (
                      <button
                        type="button"
                        className="room-primary-button"
                        onClick={() => setIsEditing(true)}
                      >
                        ✎ Edit Profile
                      </button>
                    ) : (
                      <button type="button" className="room-primary-button">
                        ✦ Follow
                      </button>
                    )}
                    <button type="button" className="room-secondary-button">
                      ☾ Collections
                    </button>
                    {!isOwnProfile && (
                      <button type="button" className="room-secondary-button">
                        ✉ Message
                      </button>
                    )}
                  </div>
                </>
              )}
            </aside>

            {/* Right Content Area - Tabs and Content */}
            <section className="profile-content-area">
              {/* Navigation Tabs */}
              <div className="profile-tabs">
                <button
                  className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  ✧ Posts
                </button>
                <button
                  className={`profile-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gallery')}
                >
                  ⚘ Gallery
                </button>
                <button
                  className={`profile-tab ${activeTab === 'collections' ? 'active' : ''}`}
                  onClick={() => setActiveTab('collections')}
                >
                  ◈ Collections
                </button>
                <button
                  className={`profile-tab ${activeTab === 'memories' ? 'active' : ''}`}
                  onClick={() => setActiveTab('memories')}
                >
                  ☾ Memories
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'posts' && (
                <div className="room-pages-section">
                  <div className="room-section-heading">
                    <h2>Recent Stories</h2>
                    <span className="room-count">{posts.length} posts</span>
                  </div>

                  {posts.length === 0 ? (
                    <div className="room-gallery-empty">
                      No stories have been shared yet...
                    </div>
                  ) : (
                    <div className="room-posts">
                      {posts.map((post) => (
                        <Post key={post._id} post={post} onDelete={handlePostDeleted} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="room-gallery-section">
                  <div className="room-section-heading">
                    <h2>Captured Moments</h2>
                    <span className="room-count">{postImages.length} images</span>
                  </div>

                  {postImages.length > 0 ? (
                    <div className="room-gallery">
                      {postImages.map((post) => (
                        <div className="room-gallery-tile" key={post._id}>
                          <div className="room-gallery-tile-inner">
                            <img src={post.mediaUrl} alt="" />
                          </div>
                          <span>{post.content?.slice(0, 50) || 'A quiet memory'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="room-gallery-empty">
                      The gallery awaits its first captured moment...
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'collections' && (
                <div className="room-gallery-empty">
                  Collections feature coming soon...
                </div>
              )}

              {activeTab === 'memories' && (
                <div className="room-gallery-empty">
                  Memories feature coming soon...
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;
