import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Post from '../components/Post';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: ''
  });

  const isOwnProfile = currentUser.id === userId;

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userResponse, postsResponse] = await Promise.all([
        userService.getUser(userId),
        userService.getUserPosts(userId)
      ]);

      setUser(userResponse.data);
      setPosts(postsResponse.data);
      setFormData({
        displayName: userResponse.data.displayName || '',
        bio: userResponse.data.bio || ''
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.updateUser(userId, formData);
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading profile...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="post-card" style={{ marginBottom: '20px' }}>
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <img
              src={user.profilePicture || 'https://via.placeholder.com/150'}
              alt={user.username}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '20px'
              }}
            />

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    maxLength="50"
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength="500"
                    rows="3"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-logout"
                    style={{ padding: '10px 20px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 style={{ marginBottom: '5px' }}>{user.displayName || user.username}</h2>
                <p style={{ color: '#65676b', marginBottom: '10px' }}>@{user.username}</p>
                {user.bio && <p style={{ marginBottom: '15px' }}>{user.bio}</p>}
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '10px 20px' }}
                  >
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <h3 style={{ marginBottom: '15px' }}>Posts ({posts.length})</h3>
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet</p>
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
    </>
  );
};

export default Profile;
