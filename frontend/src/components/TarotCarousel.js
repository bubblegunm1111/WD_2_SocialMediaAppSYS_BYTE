import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { postService } from '../services/api';
import './TarotCarousel.css';

const TarotCard = ({ post, index, currentIndex, isClosest, onPostClick, onStoryCreated }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [likePending, setLikePending] = useState(false);
  // `currentIndex` is a continuous spring value (e.g., 0.0, 0.5, 1.0)
  
  // Calculate relative offset from this card to the current view center
  const offset = useTransform(currentIndex, (current) => index - current);
  
  // Map offset to absolute offset for scaling/z-index
  const absOffset = useTransform(offset, (val) => Math.abs(val));
  
  // Spacing between cards
  const x = useTransform(offset, (val) => val * 260);
  
  // Scale: 1.15 at center, shrinking to 0.8 as it moves away
  const scale = useTransform(absOffset, [0, 1, 2], [1.15, 0.95, 0.85], { clamp: false });
  
  // Rotate: 0 at center, -25 if right, 25 if left
  // We want a smooth transition of rotation as it passes the center
  const rotateY = useTransform(offset, [-2, -1, 0, 1, 2], [25, 25, 0, -25, -25]);
  
  // Z-index calculation (Framer Motion supports numbers for zIndex)
  const zIndex = useTransform(absOffset, (val) => Math.round(100 - val * 10));

  // Opacity: center 1, edge 0.95 to keep them visible
  const opacity = useTransform(absOffset, [0, 1, 2], [1, 0.98, 0.95]);

  const handleLike = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (likePending) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    setLikePending(true);

    try {
      const response = nextLiked
        ? await postService.likePost(post._id)
        : await postService.unlikePost(post._id);
      const serverCount = response?.data?.data?.likesCount;
      if (typeof serverCount === 'number') setLikesCount(serverCount);
    } catch (error) {
      setLiked(!nextLiked);
      setLikesCount((count) => Math.max(0, count + (nextLiked ? -1 : 1)));
      console.error(error);
    } finally {
      setLikePending(false);
    }
  };

  const handleStoryUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let mediaUrl = reader.result;
        
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.src = mediaUrl;
          await new Promise((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1080;
              let scale = 1;
              if (img.width > MAX_WIDTH) scale = MAX_WIDTH / img.width;
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              mediaUrl = canvas.toDataURL('image/jpeg', 0.85);
              resolve();
            };
          });
        }

        const response = await postService.createPost({
          content: '',
          mediaUrl,
          isStory: true
        });
        
        if (onStoryCreated) onStoryCreated(response.data);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Failed to upload story');
    }
  };

  return (
    <motion.div 
      className={`tarot-card ${isClosest ? 'active' : ''}`}
      style={{
        position: 'absolute',
        x,
        scale,
        rotateY,
        zIndex,
        opacity,
        left: 'calc(50% - 120px)', // Center card horizontally (240px / 2 = 120px)
        top: '40px'
      }}
      onClick={() => {
        if (onPostClick) onPostClick(post, index);
      }}
    >
      <div className="card-inner">
        {post.isAddStory ? (
          <div className="add-story-card" style={{ height: '100%', background: 'rgba(10,5,20,0.8)', borderRadius: '16px' }}>
            <input type="file" id="story-upload" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleStoryUpload} />
            <label htmlFor="story-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <div className="add-story-icon" style={{ fontSize: '48px', color: 'rgba(255, 223, 150, 0.8)', marginBottom: '16px' }}>+</div>
              <h3 style={{ color: '#f7e8d5', fontFamily: "'Palatino Linotype', serif", fontSize: '18px', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>Create Story</h3>
            </label>
          </div>
        ) : (
          <>
            <div 
              className="card-bg" 
              style={{ 
                backgroundImage: `url(${post.mediaUrl || post.image || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'})`
              }}
            ></div>
            
            <div className="card-content">
              <div className="card-user-info">
                <img 
                  src={post.user?.profilePicture || post.userId?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${post.user?.username || post.userId?.username || 'user'}&backgroundColor=19142d&textColor=f7e8d5`} 
                  alt="Avatar" 
                  className="card-user-avatar" 
                />
                <span className="card-username">{post.user?.username || post.userId?.username || 'Magician'}</span>
              </div>

              <div className="card-meta">
                <span className="card-time">
                  {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                </span>
                <div className="card-actions">
                  <button
                    type="button"
                    className={`card-like-button ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                    aria-label={liked ? 'Unlike post' : 'Like post'}
                    aria-pressed={liked}
                    disabled={likePending}
                  >
                    <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
                    {likesCount}
                  </button>
                  <span className="card-action-icon">💬 {post.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ornate border decorations */}
        <div className="ornate-corner top-left"></div>
        <div className="ornate-corner top-right"></div>
        <div className="ornate-corner bottom-left"></div>
        <div className="ornate-corner bottom-right"></div>

        {/* Decorative sparkles around the card */}
        <motion.div style={{ opacity: useTransform(absOffset, [0, 0.3, 0.7], [1, 0.6, 0]) }}>
          <div className="sparkle sparkle-1">✦</div>
          <div className="sparkle sparkle-2">✧</div>
          <div className="sparkle sparkle-3">✦</div>
          <div className="sparkle sparkle-4">✧</div>
          <div className="sparkle sparkle-5">✦</div>
          <div className="sparkle sparkle-6">✧</div>
        </motion.div>

        <motion.div style={{ opacity: useTransform(absOffset, [0, 0.2, 0.5], [1, 0, 0]) }}>
          <div className="active-star top-star">✧</div>
          <div className="active-star bottom-star">✧</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const TarotCarousel = ({ posts, onPostClick, onStoryCreated }) => {
  const containerRef = useRef(null);
  
  const carouselItems = [{ isAddStory: true, _id: 'add-story' }, ...(posts || [])];

  // We use a spring to hold the current continuous index.
  // It starts at the middle item.
  const targetIndex = useRef(Math.floor((carouselItems?.length || 0) / 2));
  
  const currentIndex = useSpring(targetIndex.current, {
    stiffness: 150,
    damping: 25,
    mass: 1
  });

  // Native trackpad smooth scrolling handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let accumulatedDelta = 0;

    const handleWheel = (e) => {
      e.preventDefault();
      
      // Trackpad events send many small deltas. We accumulate them.
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      // Very gentle sensitivity for trackpads
      accumulatedDelta += delta * 0.0015; 
      
      let nextTarget = targetIndex.current + accumulatedDelta;
      
      // Clamp to bounds
      if (nextTarget < 0) nextTarget = 0;
      if (nextTarget > posts.length - 1) nextTarget = posts.length - 1;

      // Update the spring target continuously
      currentIndex.set(nextTarget);
      
      // Reset accumulated delta slightly faster for snappy stops
      accumulatedDelta *= 0.85;
      targetIndex.current = nextTarget;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [currentIndex, posts.length]);

  const handlePostClick = (post, index) => {
    // If clicking the focused card, open it.
    if (Math.abs(targetIndex.current - index) < 0.5) {
      if (onPostClick) onPostClick(post);
    } else {
      // Otherwise scroll to it
      targetIndex.current = index;
      currentIndex.set(index);
    }
  };

  // Calculate discrete active index for dots
  const [activeDot, setActiveDot] = React.useState(Math.round(targetIndex.current));
  
  useEffect(() => {
    const unsubscribe = currentIndex.on('change', (val) => {
      setActiveDot(Math.round(val));
    });
    return () => unsubscribe();
  }, [currentIndex]);

  if (!carouselItems || carouselItems.length === 0) {
    return <div className="empty-state">No stories found.</div>;
  }

  return (
    <div className="tarot-carousel-container" ref={containerRef}>
      <div className="tarot-carousel" style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
        {carouselItems.map((post, index) => (
          <TarotCard 
            key={post._id || index}
            post={post}
            index={index}
            currentIndex={currentIndex}
            isClosest={index === activeDot}
            onPostClick={handlePostClick}
            onStoryCreated={onStoryCreated}
          />
        ))}
      </div>

      <div className="carousel-dots-wrapper">
        <div className="carousel-dots-line"></div>
        <div className="carousel-dots">
          {carouselItems.map((_, i) => (
            <span 
              key={i} 
              className={`dot ${i === activeDot ? 'active' : ''}`}
              onClick={() => {
                targetIndex.current = i;
                currentIndex.set(i);
              }}
            >
              {i === activeDot ? '✦' : '•'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TarotCarousel;
