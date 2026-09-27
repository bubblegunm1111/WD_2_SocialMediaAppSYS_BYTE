import React, { useState } from 'react';
import { postService } from '../services/api';

const CreatePost = ({ onPostCreated }) => {
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          maxLength="5000"
          required
        />
        <input
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="Image URL (optional)"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e4e6eb',
            borderRadius: '6px',
            marginBottom: '10px',
            fontSize: '14px'
          }}
        />
        <button
          type="submit"
          className="btn-post"
          disabled={loading || !content.trim()}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
