import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    setLoading(true);
    try {
      const response = await postService.createPost({
        content: content.trim(),
        mediaUrl: mediaUrl
      });
      onPostCreated(response.data);
      setContent('');
      setMediaUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card" style={{
      background: 'rgba(10, 5, 20, 0.95)',
      backgroundImage: 'url("./bg-lunar.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(220, 200, 150, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '25px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(220, 200, 150, 0.05)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          <Link to={`/profile/${user?._id || user?.id}`}>
            <img 
              src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(220, 200, 150, 0.5)' }}
            />
          </Link>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || user?.username}?`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f7e8d5',
              fontFamily: "'Palatino Linotype', serif",
              fontSize: '16px',
              resize: 'none',
              minHeight: '60px',
              outline: 'none'
            }}
          />
        </div>

        {mediaUrl && (
          <div style={{ margin: '15px 0 0 55px', position: 'relative' }}>
            <img src={mediaUrl} alt="Upload preview" style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid rgba(220,200,150,0.2)', maxHeight: '300px', objectFit: 'contain' }} />
            <button 
              type="button" 
              onClick={() => setMediaUrl('')}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(220, 200, 150, 0.15)' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id="create-post-file"
            />
            <label htmlFor="create-post-file" style={{ cursor: 'pointer', color: 'rgba(255, 223, 150, 0.8)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>⌕</span> Photo/Video
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || (!content.trim() && !mediaUrl)}
            style={{
              background: (!content.trim() && !mediaUrl) ? 'rgba(220,200,150,0.2)' : 'linear-gradient(135deg, rgba(220,200,150,0.8), rgba(180,140,80,0.9))',
              color: (!content.trim() && !mediaUrl) ? 'rgba(255,255,255,0.4)' : '#0a0514',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: (!content.trim() && !mediaUrl) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
