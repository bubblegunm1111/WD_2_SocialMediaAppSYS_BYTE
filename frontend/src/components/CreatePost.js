import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await postService.createPost({
        content: content.trim(),
        mediaUrl: mediaUrl.trim()
      });

      onPostCreated(response.data);
      setContent('');
      setMediaUrl('');
    } catch (err) {
      console.error(err);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-pill">
      <form onSubmit={handleSubmit} className="create-post-form">
        <Link to={`/profile/${user?._id || user?.id}`} className="cp-avatar-link">
          <img src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} alt="Profile" />
        </Link>
        
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || user?.username}?`}
          className="cp-input"
          required
        />
        
        <div className="cp-options">
          <span>⌕ Photo</span>
          <span>⧉ Video</span>
          <span>♪ Music</span>
          <span>▤ Page</span>
        </div>

        <button
          type="submit"
          className="cp-submit-btn"
          disabled={loading || !content.trim()}
        >
          {loading ? '...' : '→'}
        </button>
      </form>

      {/* Ornate corners */}
      <div className="pill-corner tl"></div>
      <div className="pill-corner tr"></div>
      <div className="pill-corner bl"></div>
      <div className="pill-corner br"></div>
    </div>
  );
};

export default CreatePost;
