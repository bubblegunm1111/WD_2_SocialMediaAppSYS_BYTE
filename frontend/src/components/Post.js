import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Post = ({ post, onDelete }) => {
  const { user: currentUser } = useAuth();
  
  // check if current user liked it
  const isUserLiked = post.likes?.includes(currentUser?.id || currentUser?._id);
  
  const [liked, setLiked] = useState(isUserLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');

  const isOwnPost = String(currentUser?.id || currentUser?._id) === String(post.userId?._id || post.userId?.id || post.userId);

  const handleLike = async () => {
    try {
      if (liked) {
        await postService.unlikePost(post._id);
        setLikesCount(prev => prev - 1);
        setLiked(false);
      } else {
        await postService.likePost(post._id);
        setLikesCount(likesCount + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const response = await postService.getComments(post._id);
        setComments(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await postService.addComment(post._id, commentText);
      setComments([response.data, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const isUserSaved = post.savedBy?.includes(currentUser?.id || currentUser?._id);
  const [saved, setSaved] = useState(isUserSaved || false);

  const handleSaveToggle = async () => {
    try {
      if (saved) {
        await postService.unsavePost(post._id);
      } else {
        await postService.savePost(post._id);
      }
      setSaved(!saved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post._id);
        onDelete(post._id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleArchive = async () => {
    try {
      await postService.updatePost(post._id, { isArchived: !post.isArchived });
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await postService.updatePost(post._id, { content: editContent });
      post.content = editContent;
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="post-card" style={{
      background: 'rgba(12, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(220, 200, 150, 0.2)',
      borderRadius: '16px',
      padding: '0',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'transform 0.2s ease',
    }}>
      {/* Decorative Corners */}
      <div style={{position: 'absolute', top: 12, left: 12, color: 'rgba(220,200,150,0.35)', fontSize: '10px', zIndex: 2}}>✦</div>
      <div style={{position: 'absolute', top: 12, right: 12, color: 'rgba(220,200,150,0.35)', fontSize: '10px', zIndex: 2}}>✦</div>

      {/* Top Tag */}
      <div style={{
        fontSize: '10px',
        color: 'rgba(220, 200, 150, 0.8)',
        fontWeight: '600',
        letterSpacing: '1.5px',
        padding: '14px 16px 0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        textTransform: 'uppercase'
      }}>
        <span style={{ fontSize: '8px' }}>✧</span> {post.category || 'ART & CREATORS'}
      </div>

      <div className="post-header" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 0 16px', gap: '12px' }}>
        <Link to={`/profile/${post.userId._id || post.userId.id || post.userId}`}>
          <img
            src={post.userId?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${post.userId?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`}
            alt={post.userId?.username || 'User'}
            className="post-avatar"
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(220, 200, 150, 0.3)' }}
          />
        </Link>
        <div className="post-user-info" style={{ flex: 1 }}>
          <Link to={`/profile/${post.userId._id || post.userId.id || post.userId}`} style={{ textDecoration: 'none' }}>
            <div className="post-user-name" style={{ color: '#f8f6f2', fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px' }}>
              {post.userId.displayName || post.userId.username}
            </div>
          </Link>
          <div className="post-timestamp" style={{ color: 'rgba(220, 200, 150, 0.6)', fontSize: '11px', marginTop: '2px' }}>{formatTimestamp(post.createdAt)}</div>
        </div>
        {isOwnPost && (
          <div className="post-options-menu" style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '16px', cursor: 'pointer', outline: 'none' }}>•••</button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: '20px', background: 'rgba(20,15,35,0.95)', border: '1px solid rgba(220, 200, 150, 0.2)', borderRadius: '8px', padding: '5px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 10, minWidth: '120px' }}>
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} style={{ background: 'transparent', border: 'none', color: '#f7e8d5', padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '12px' }}>Edit Caption</button>
                <button onClick={handleArchive} style={{ background: 'transparent', border: 'none', color: '#f7e8d5', padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '12px' }}>{post.isArchived ? 'Unarchive' : 'Archive'}</button>
                <button onClick={handleDelete} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="post-edit-container" style={{ padding: '0 16px 12px 16px' }}>
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} style={{ width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.4)', color: '#f8f6f2', border: '1px solid rgba(220, 200, 150, 0.25)', borderRadius: '8px', padding: '12px', resize: 'none', fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '1.6' }} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleEditSubmit} style={{ background: 'rgba(220, 200, 150, 0.15)', color: '#f7e8d5', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Save</button>
            <button onClick={() => { setIsEditing(false); setEditContent(post.content); }} style={{ background: 'transparent', color: '#f7e8d5', border: '1px solid rgba(220, 200, 150, 0.2)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="post-content" style={{ color: '#e8e5df', fontSize: '14px', padding: '12px 16px', lineHeight: '1.6', letterSpacing: '0.2px' }}>{post.content}</div>
      )}

      {post.mediaUrl && (
        <div style={{
          margin: '0 16px 16px 16px',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(220, 200, 150, 0.15)',
        }}>
          <img src={post.mediaUrl} alt="Post media" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />

          {/* Decorative scattered flowers on image */}
          <div style={{position: 'absolute', top: '12px', right: '14px', fontSize: '16px', opacity: 0.6, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🌸</div>
          <div style={{position: 'absolute', bottom: '16px', left: '18px', fontSize: '14px', opacity: 0.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🌸</div>
        </div>
      )}

      <div className="post-actions" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '12px 16px 16px 16px',
        borderTop: '1px solid rgba(220, 200, 150, 0.1)',
        marginTop: 'auto'
      }}>
        <button
          onClick={handleLike}
          style={{
            background: 'transparent',
            border: 'none',
            color: liked ? '#ff6b6b' : 'rgba(220, 200, 150, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            padding: 0,
            transition: 'color 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? '#ff6b6b' : 'none'} stroke="currentColor" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span style={{ fontWeight: '500', color: '#f8f6f2' }}>{likesCount}</span>
        </button>
        <button onClick={handleShowComments} style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(220, 200, 150, 0.6)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          padding: 0,
          transition: 'color 0.2s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span style={{ fontWeight: '500', color: '#f8f6f2' }}>{post.commentsCount || 0}</span>
        </button>
        <button onClick={handleSaveToggle} style={{
          background: 'transparent',
          border: 'none',
          color: saved ? '#caa77d' : 'rgba(220, 200, 150, 0.6)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          padding: 0,
          marginLeft: 'auto',
          transition: 'color 0.2s ease'
        }} title="Save to Memories">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? '#caa77d' : 'none'} stroke="currentColor" strokeWidth="1.8">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      {showComments && (
        <div className="comments-section" style={{ padding: '12px 16px 16px 16px', borderTop: '1px solid rgba(220, 200, 150, 0.1)' }}>
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength="1000"
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(220, 200, 150, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f8f6f2',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button type="submit" style={{
              background: 'rgba(220, 200, 150, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              color: '#f7e8d5',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Post
            </button>
          </form>

          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: '10px', color: 'rgba(220, 200, 150, 0.5)', fontSize: '13px' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px', color: 'rgba(220, 200, 150, 0.5)', fontSize: '13px' }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <Link to={`/profile/${comment.userId._id}`}>
                  <img
                    src={comment.userId.profilePicture || 'https://via.placeholder.com/32'}
                    alt={comment.userId.username}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(220, 200, 150, 0.25)' }}
                  />
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${comment.userId._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ color: '#f8f6f2', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                      {comment.userId.displayName || comment.userId.username}
                    </div>
                  </Link>
                  <div style={{ color: '#e8e5df', fontSize: '13px', lineHeight: '1.5' }}>{comment.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
