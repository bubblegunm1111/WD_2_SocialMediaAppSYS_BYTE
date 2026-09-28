import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Post = ({ post, onDelete }) => {
  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');

  const isOwnPost = currentUser.id === post.userId._id;

  const handleLike = async () => {
    try {
      if (liked) {
        await postService.unlikePost(post._id);
        setLikesCount(likesCount - 1);
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
      background: 'rgba(15, 10, 25, 0.95)',
      border: '1px solid rgba(220, 200, 150, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Decorative Corners */}
      <div style={{position: 'absolute', top: 5, left: 5, color: 'rgba(220,200,150,0.5)', fontSize: '10px'}}>✦</div>
      <div style={{position: 'absolute', top: 5, right: 5, color: 'rgba(220,200,150,0.5)', fontSize: '10px'}}>✦</div>
      <div style={{position: 'absolute', bottom: 5, left: 5, color: 'rgba(220,200,150,0.5)', fontSize: '10px'}}>✦</div>
      <div style={{position: 'absolute', bottom: 5, right: 5, color: 'rgba(220,200,150,0.5)', fontSize: '10px'}}>✦</div>

      {/* Top Tag */}
      <div style={{ fontSize: '10px', color: '#caa77d', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }}>
        ✧ ART & CREATORS
      </div>

      <div className="post-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
        <Link to={`/profile/${post.userId._id || post.userId.id || post.userId}`}>
          <img
            src={post.userId?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${post.userId?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`}
            alt={post.userId?.username || 'User'}
            className="post-avatar"
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(220, 200, 150, 0.4)' }}
          />
        </Link>
        <div className="post-user-info" style={{ flex: 1 }}>
          <Link to={`/profile/${post.userId._id || post.userId.id || post.userId}`} style={{ textDecoration: 'none' }}>
            <div className="post-user-name" style={{ color: '#eee5dc', fontSize: '14px', fontWeight: 'bold' }}>
              {post.userId.displayName || post.userId.username}
            </div>
          </Link>
          <div className="post-timestamp" style={{ color: '#888', fontSize: '11px' }}>{formatTimestamp(post.createdAt)}</div>
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
        <div className="post-edit-container" style={{ marginBottom: '12px' }}>
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} style={{ width: '100%', minHeight: '60px', background: 'rgba(0,0,0,0.5)', color: '#f7e8d5', border: '1px solid rgba(220, 200, 150, 0.3)', borderRadius: '8px', padding: '10px', resize: 'none', fontFamily: "'Palatino Linotype', serif", fontSize: '13px' }} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <button onClick={handleEditSubmit} style={{ background: 'rgba(220, 200, 150, 0.2)', color: '#f7e8d5', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
            <button onClick={() => { setIsEditing(false); setEditContent(post.content); }} style={{ background: 'transparent', color: '#f7e8d5', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="post-content" style={{ color: '#eee5dc', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>{post.content}</div>
      )}

      {post.mediaUrl && (
        <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <img src={post.mediaUrl} alt="Post media" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      <div className="post-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto', borderTop: 'none', paddingTop: '0' }}>
        <button
          onClick={handleLike}
          style={{ background: 'transparent', border: 'none', color: liked ? '#ff4d4d' : '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', padding: 0 }}
        >
          {liked ? '♥' : '♡'} {likesCount}
        </button>
        <button onClick={handleShowComments} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', padding: 0 }}>
          💬 {post.commentsCount || 0}
        </button>
        <button style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '14px', padding: 0, marginLeft: 'auto' }}>
          ⚲
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleAddComment} className="comment-input">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength="1000"
            />
            <button type="submit" className="btn-comment">
              Post
            </button>
          </form>

          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#65676b' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#65676b' }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment">
                <Link to={`/profile/${comment.userId._id}`}>
                  <img
                    src={comment.userId.profilePicture || 'https://via.placeholder.com/32'}
                    alt={comment.userId.username}
                    className="comment-avatar"
                  />
                </Link>
                <div className="comment-content">
                  <Link to={`/profile/${comment.userId._id}`}>
                    <div className="comment-author">
                      {comment.userId.displayName || comment.userId.username}
                    </div>
                  </Link>
                  <div className="comment-text">{comment.content}</div>
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
