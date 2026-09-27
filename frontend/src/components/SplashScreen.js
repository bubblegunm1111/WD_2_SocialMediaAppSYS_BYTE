import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [isSwiped, setIsSwiped] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const touchStartY = useRef(0);
  const mouseMoveTimeout = useRef(null);

  useEffect(() => {
    // Generate random particles with enhanced properties
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 4 + 3}s`,
      animationDelay: `${Math.random() * 3}s`,
      size: `${Math.random() * 5 + 2}px`,
      opacity: Math.random() * 0.6 + 0.2
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMouseMoving(true);

      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }

      mouseMoveTimeout.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseMoveTimeout.current) {
        clearTimeout(mouseMoveTimeout.current);
      }
    };
  }, []);

  const handleSwipeUp = () => {
    if (isSwiped) return;
    setIsSwiped(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
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

  const handleMouseDown = (e) => {
    touchStartY.current = e.clientY;
  };

  const handleMouseUp = (e) => {
    if (touchStartY.current - e.clientY > 50) {
      handleSwipeUp();
    }
  };

  const calculateParallax = (baseX, baseY, depth) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (mousePosition.x - centerX) * depth;
    const moveY = (mousePosition.y - centerY) * depth;
    return {
      transform: `translate(calc(${baseX} + ${moveX}px), calc(${baseY} + ${moveY}px))`
    };
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

      {/* Mouse cursor effect */}
      {isMouseMoving && (
        <div
          className="cursor-glow"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`
          }}
        />
      )}

      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay
            }}
          />
        ))}
      </div>

      <div className="splash-content" style={calculateParallax('0px', '0px', 0.02)}>
        <div className="splash-moon" style={calculateParallax('0px', '0px', 0.05)}>☾</div>
        <h1 className="splash-logo">LUMINAR</h1>
        <p className="splash-tagline">Enter the magical arena...</p>
        <div className="splash-orbs">
          <div className="orb orb-1" style={calculateParallax('0px', '0px', 0.08)}></div>
          <div className="orb orb-2" style={calculateParallax('0px', '0px', 0.06)}></div>
          <div className="orb orb-3" style={calculateParallax('0px', '0px', 0.04)}></div>
        </div>
      </div>

      <div className="swipe-hint" onClick={handleSwipeUp}>
        <span className="hint-icon">⌃</span>
        <span>Swipe up to enter</span>
        <span className="hint-icon">⌃</span>
      </div>
    </div>
  );
};

export default SplashScreen;
