import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [isSwiped, setIsSwiped] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`,
      size: `${Math.random() * 4 + 1}px`
    }));
    setParticles(newParticles);
  }, []);

  const handleSwipeUp = () => {
    if (isSwiped) return;
    setIsSwiped(true);
    setTimeout(() => {
      onComplete();
    }, 1000); // Wait for CSS transition to finish
  };

  const handleWheel = (e) => {
    if (e.deltaY > 0) handleSwipeUp();
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    if (touchStartY.current - touchY > 50) {
      handleSwipeUp();
    }
  };

  // For mouse drag
  const handleMouseDown = (e) => {
    touchStartY.current = e.clientY;
  };
  
  const handleMouseUp = (e) => {
    if (touchStartY.current - e.clientY > 50) {
      handleSwipeUp();
    }
  };

  return (
    <div 
      className={`splash-container ${isSwiped ? 'swiped-up' : ''}`}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="splash-overlay"></div>
      
      <div className="particles">
        {particles.map(p => (
          <div 
            key={p.id} 
            className="particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay
            }}
          />
        ))}
      </div>

      <div className="splash-content">
        <div className="splash-moon">☾</div>
        <h1 className="splash-logo">LUMINAR</h1>
        <p className="splash-tagline">Enter the magical arena...</p>
      </div>

      <div className="swipe-hint" onClick={handleSwipeUp}>
        ⌃ Swipe up to enter ⌃
      </div>
    </div>
  );
};

export default SplashScreen;
