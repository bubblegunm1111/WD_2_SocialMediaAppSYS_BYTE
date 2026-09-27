import React, { useState } from 'react';
import './TarotCarousel.css';

const TarotCarousel = ({ posts, onPostClick }) => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(posts.length / 2) || 0);

  const handleNext = () => {
    if (activeIndex < posts.length - 1) setActiveIndex(activeIndex + 1);
  };

  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  if (!posts || posts.length === 0) {
    return <div className="empty-state">No stories found.</div>;
  }

  return (
    <div className="tarot-carousel-container">
      <button className="nav-btn prev-btn" onClick={handlePrev} disabled={activeIndex === 0}>‹</button>
      
      <div className="tarot-carousel">
        {posts.map((post, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          
          let className = "tarot-card";
          if (offset === 0) className += " active";
          else if (offset < 0) className += " left";
          else className += " right";

          // Calculate transforms for 3D effect without heavy overlap
          
          let scale = 1;
          let opacity = 1;
          
          if (absOffset === 1) {
            scale = 0.96;
            opacity = 0.85;
          } else if (absOffset >= 2) {
            scale = 0.90;
            opacity = 0.5;
          }

          const translateX = offset * 260; // Clean horizontal spacing
          const zIndex = 100 - absOffset;

          const style = {
            transform: `translateX(${translateX}px) scale(${scale})`,
            opacity: opacity,
            zIndex: zIndex,
          };

          const userObj = post.user || {};

          return (
            <div 
              key={post._id || index} 
              className={className} 
              style={style} 
              onClick={() => {
                if (offset === 0 && onPostClick) {
                  onPostClick(post);
                } else {
                  setActiveIndex(index);
                }
              }}
            >
              <div className="card-inner">
                {/* Image Background */}
                <div 
                  className="card-bg" 
                  style={{ 
                    backgroundImage: `url(${post.mediaUrl || post.image || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'})` 
                  }}
                ></div>
                
                {/* Content Overlay */}
                <div className="card-content">
                  <div className="card-author">
                    <img src={userObj.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${userObj.username}&backgroundColor=19142d&textColor=f7e8d5`} alt={userObj.username} />
                    <span>{userObj.displayName || userObj.username}</span>
                  </div>
                  <h3 className="card-title">
                    {post.title || post.content.substring(0, 40) + (post.content.length > 40 ? '...' : '')}
                  </h3>
                  <div className="card-meta">
                    <span className="card-icon">☾</span>
                    <span className="card-time">
                      {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Subtle corner detail */}
                <div className="subtle-celestial-corner top-right">✦</div>
                <div className="subtle-celestial-corner bottom-left">✦</div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="nav-btn next-btn" onClick={handleNext} disabled={activeIndex === posts.length - 1}>›</button>
      
      {/* Dots indicator with thin line */}
      <div className="carousel-dots-wrapper">
        <div className="carousel-dots-line"></div>
        <div className="carousel-dots">
          {posts.map((_, i) => (
            <span 
              key={i} 
              className={`dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              {i === activeIndex ? '✦' : '•'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TarotCarousel;
