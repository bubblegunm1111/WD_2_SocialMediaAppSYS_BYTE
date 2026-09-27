import React, { useState } from 'react';
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
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <div className="create-post-header">
          <img src={user?.profilePicture || 'https://i.pravatar.cc/150?img=5'} alt="Profile" />
          <div className="create-post-input-area">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || user?.username}?`}
              required
            />
          </div>
        </div>
        
        {/* Optional Media Input if they want to add one (hidden unless they click photo, but we'll show it for functionality) */}
        {content.length > 0 && (
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Image URL (optional)"
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '6px',
              marginBottom: '10px',
              fontSize: '14px'
            }}
          />
        )}

        <div className="create-post-actions">
          <div className="post-options">
            <span>📷 Photo</span>
            <span>📹 Video</span>
            <span>🎵 Music</span>
            <span>📄 Page</span>
          </div>
          <button
            type="submit"
            className="btn-post"
            disabled={loading || !content.trim()}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
