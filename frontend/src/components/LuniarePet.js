import React from 'react';
import './LuniarePet.css';

const LuniarePet = () => {
  return (
    <div className="luniare-pet-container">
      <div className="pet-cat">
        <svg viewBox="0 0 200 200" className="cat-svg">
          {/* Cat body */}
          <ellipse cx="100" cy="120" rx="45" ry="38" fill="#FAFAFA" className="cat-body"/>

          {/* Cat head */}
          <circle cx="100" cy="70" r="35" fill="#FAFAFA" className="cat-head"/>

          {/* Left ear */}
          <path d="M 75 50 L 65 25 L 85 45 Z" fill="#FAFAFA" className="cat-ear"/>

          {/* Right ear */}
          <path d="M 125 50 L 135 25 L 115 45 Z" fill="#FAFAFA" className="cat-ear"/>

          {/* Inner left ear */}
          <path d="M 75 48 L 70 32 L 82 46 Z" fill="#FFE5F0" className="cat-inner-ear"/>

          {/* Inner right ear */}
          <path d="M 125 48 L 130 32 L 118 46 Z" fill="#FFE5F0" className="cat-inner-ear"/>

          {/* Left eye */}
          <ellipse cx="88" cy="68" rx="4" ry="8" fill="#0B0E14" className="cat-eye"/>

          {/* Right eye */}
          <ellipse cx="112" cy="68" rx="4" ry="8" fill="#0B0E14" className="cat-eye"/>

          {/* Nose */}
          <ellipse cx="100" cy="80" rx="3" ry="2.5" fill="#FFB3D9"/>

          {/* Mouth */}
          <path d="M 100 82 Q 95 85 92 83" stroke="#0B0E14" fill="none" strokeWidth="1" strokeLinecap="round"/>
          <path d="M 100 82 Q 105 85 108 83" stroke="#0B0E14" fill="none" strokeWidth="1" strokeLinecap="round"/>

          {/* Whiskers left */}
          <line x1="70" y1="75" x2="45" y2="73" stroke="#E0E0E0" strokeWidth="0.5"/>
          <line x1="70" y1="80" x2="45" y2="82" stroke="#E0E0E0" strokeWidth="0.5"/>

          {/* Whiskers right */}
          <line x1="130" y1="75" x2="155" y2="73" stroke="#E0E0E0" strokeWidth="0.5"/>
          <line x1="130" y1="80" x2="155" y2="82" stroke="#E0E0E0" strokeWidth="0.5"/>

          {/* Tail */}
          <path d="M 140 130 Q 165 125 170 145" stroke="#FAFAFA" strokeWidth="16" fill="none" strokeLinecap="round" className="cat-tail"/>

          {/* Front paws */}
          <ellipse cx="85" cy="155" rx="8" ry="12" fill="#FAFAFA" className="cat-paw"/>
          <ellipse cx="115" cy="155" rx="8" ry="12" fill="#FAFAFA" className="cat-paw"/>
        </svg>
      </div>

      <div className="pet-status">
        <span className="status-dot"></span>
        <span className="status-text">Luniare</span>
      </div>
    </div>
  );
};

export default LuniarePet;
