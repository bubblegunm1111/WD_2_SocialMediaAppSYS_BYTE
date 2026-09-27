import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);

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
    
    // Automatically complete after 4 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-container">
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
        <div className="splash-moon">🌙</div>
        <h1 className="splash-logo">LUMINAR</h1>
        <p className="splash-tagline">Enter the magical arena...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
