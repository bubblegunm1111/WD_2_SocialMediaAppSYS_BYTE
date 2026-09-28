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
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.userId._id}`}>
          <img
            src={post.userId?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${post.userId?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`}
            alt={post.userId?.username || 'User'}
            className="post-avatar"
          />
        </Link>
        <div className="post-user-info">
          <Link to={`/profile/${post.userId._id}`}>
            <div className="post-user-name">
              {post.userId.displayName || post.userId.username}
            </div>
          </Link>
          <div className="post-timestamp">{formatTimestamp(post.createdAt)}</div>
        </div>
        {isOwnPost && (
          <button
            onClick={handleDelete}
            style={{
              marginLeft: 'auto',
              padding: '8px',
              background: 'transparent',
              color: '#65676b',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        )}
      </div>

      <div className="post-content">{post.content}</div>

      {post.mediaUrl && (
        <img src={post.mediaUrl} alt="Post media" className="post-media" />
      )}

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`btn-action ${liked ? 'liked' : ''}`}
        >
          👍 {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
        </button>
        <button onClick={handleShowComments} className="btn-action">
          💬 {post.commentsCount || 0} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
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
