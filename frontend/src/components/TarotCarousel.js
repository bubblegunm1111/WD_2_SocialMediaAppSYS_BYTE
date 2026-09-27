import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import './TarotCarousel.css';

const DRAG_BUFFER = 50;
const SWIPE_VELOCITY = 500;
const CARD_WIDTH = 260; // Card width + gap

const TarotCarousel = ({ posts, onPostClick }) => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(posts.length / 2) || 0);
  const containerRef = useRef(null);
  
  // Motion values
  const x = useMotionValue(0);
  const springX = useSpring(x, {
    stiffness: 250,
    damping: 35,
    mass: 1
  });

  useEffect(() => {
    // Snap to the active index when it changes (if changed via dots or click)
    const targetX = -activeIndex * CARD_WIDTH;
    if (x.get() !== targetX) {
      animate(x, targetX, { type: 'spring', stiffness: 250, damping: 35 });
    }
  }, [activeIndex]);

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipePower = Math.abs(velocity.x) * offset.x;
    
    let newIndex = activeIndex;
    
    if (swipePower > SWIPE_VELOCITY * DRAG_BUFFER) {
      // Swiped right
      newIndex = Math.max(0, activeIndex - 1);
    } else if (swipePower < -SWIPE_VELOCITY * DRAG_BUFFER) {
      // Swiped left
      newIndex = Math.min(posts.length - 1, activeIndex + 1);
    } else if (offset.x > DRAG_BUFFER) {
      newIndex = Math.max(0, activeIndex - 1);
    } else if (offset.x < -DRAG_BUFFER) {
      newIndex = Math.min(posts.length - 1, activeIndex + 1);
    }
    
    setActiveIndex(newIndex);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    
    if (Math.abs(delta) > 20) {
      if (delta > 0 && activeIndex < posts.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else if (delta < 0 && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    }
  };

  // Add event listener for wheel to prevent default page scrolling while hovering
  useEffect(() => {
    const current = containerRef.current;
    if (current) {
      let isThrottled = false;
      const onWheel = (e) => {
        e.preventDefault();
        if (isThrottled) return;
        isThrottled = true;
        
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        
        if (delta > 30) {
          setActiveIndex(prev => Math.min(posts.length - 1, prev + 1));
        } else if (delta < -30) {
          setActiveIndex(prev => Math.max(0, prev - 1));
        }
        
        setTimeout(() => { isThrottled = false; }, 300); // 300ms throttle for smooth scrolling
      };
      
      current.addEventListener('wheel', onWheel, { passive: false });
      return () => current.removeEventListener('wheel', onWheel);
    }
  }, [posts.length]);

  if (!posts || posts.length === 0) {
    return <div className="empty-state">No stories found.</div>;
  }

  return (
    <div className="tarot-carousel-container" ref={containerRef}>
      <motion.div 
        className="tarot-carousel-track"
        drag="x"
        dragConstraints={{
          left: -((posts.length - 1) * CARD_WIDTH),
          right: 0
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x: springX }}
      >
        {posts.map((post, index) => {
          // Calculate motion values for 3D transforms based on x position
          const input = [
            -(index + 1) * CARD_WIDTH,
            -index * CARD_WIDTH,
            -(index - 1) * CARD_WIDTH
          ];
          
          const scale = useTransform(springX, input, [0.85, 1.15, 0.85]);
          const rotateY = useTransform(springX, input, [-20, 0, 20]);
          const zIndex = useTransform(springX, input, [1, 10, 1]);
          const opacity = useTransform(springX, input, [0.6, 1, 0.6]);
          const filter = useTransform(springX, input, ['brightness(0.5)', 'brightness(1)', 'brightness(0.5)']);

          return (
            <motion.div 
              key={post._id || index} 
              className="tarot-card"
              style={{
                scale,
                rotateY,
                zIndex,
                opacity
              }}
              onClick={() => {
                if (activeIndex === index && onPostClick) {
                  onPostClick(post);
                } else {
                  setActiveIndex(index);
                }
              }}
            >
              <div className="card-inner">
                {/* Image Background */}
                <motion.div 
                  className="card-bg" 
                  style={{ 
                    backgroundImage: `url(${post.mediaUrl || post.image || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'})`,
                    filter
                  }}
                ></motion.div>
                
                {/* Content Overlay */}
                <div className="card-content">
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

                {/* Highly Magical Ornate Borders */}
                <div className="magical-border-frame">
                  <div className="corner-dec top-left">✧</div>
                  <div className="corner-dec top-right">✧</div>
                  <div className="corner-dec bottom-left">✧</div>
                  <div className="corner-dec bottom-right">✧</div>
                  <div className="border-line top-line"></div>
                  <div className="border-line bottom-line"></div>
                  <div className="border-line left-line"></div>
                  <div className="border-line right-line"></div>
                  
                  {activeIndex === index && (
                    <>
                      <div className="center-star-top">✨</div>
                      <div className="center-star-bottom">✨</div>
                      <div className="magical-glow-overlay"></div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

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
