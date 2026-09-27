import React, { useState } from 'react';

const AuthCat = ({ moving, onMoveEnd }) => {
  const [entering, setEntering] = useState(true);

  const handleAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return;

    if (event.animationName === 'catWalkIn' || event.animationName === 'catWalkOnTouch') {
      setEntering(false);
    }
    if (event.animationName === 'catWalkOnTouch') {
      onMoveEnd();
    }
  };

  return (
  <div
    className={`auth-cat${entering ? ' is-entering' : ''}${moving ? ' is-moving' : ''}`}
    aria-hidden="true"
    onAnimationEnd={handleAnimationEnd}
  >
    <svg viewBox="0 0 240 130" role="presentation">
      <defs>
        <linearGradient id="catFur" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f5d9b4" />
          <stop offset="0.55" stopColor="#c58b67" />
          <stop offset="1" stopColor="#754c49" />
        </linearGradient>
        <linearGradient id="catChest" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff0d7" />
          <stop offset="1" stopColor="#d6a47d" />
        </linearGradient>
        <linearGradient id="catEar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6b4a4" />
          <stop offset="1" stopColor="#a65f62" />
        </linearGradient>
        <filter id="catShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#05020b" floodOpacity="0.65" />
        </filter>
      </defs>

      <g className="auth-cat-body" filter="url(#catShadow)">
        <path
          className="auth-cat-tail"
          d="M164 76 C204 82 222 62 211 42 C203 28 184 36 190 49 C194 57 204 54 205 47"
          fill="none"
          stroke="#986653"
          strokeLinecap="round"
          strokeWidth="13"
        />
        <path
          className="auth-cat-tail-highlight"
          d="M164 73 C201 80 216 62 207 47"
          fill="none"
          stroke="#d6a078"
          strokeLinecap="round"
          strokeWidth="3"
        />

        <ellipse cx="126" cy="78" rx="48" ry="28" fill="url(#catFur)" />
        <path
          d="M103 94 C112 110 126 111 133 94 M146 94 C153 108 166 107 170 91"
          fill="none"
          stroke="#70484a"
          strokeLinecap="round"
          strokeWidth="9"
        />
        <path
          d="M91 73 C94 50 111 36 135 37 C157 39 169 55 166 76 C156 68 146 65 133 66 C118 66 105 70 91 73Z"
          fill="url(#catChest)"
          opacity="0.9"
        />

        <g className="auth-cat-head">
          <path d="M58 55 L61 18 L84 40 C92 35 104 36 112 42 L132 18 L136 61Z" fill="url(#catFur)" />
          <path d="M65 28 L67 21 L81 40 C75 38 70 34 65 28Z" fill="url(#catEar)" />
          <path d="M119 40 L131 22 L132 35 L126 46Z" fill="url(#catEar)" />
          <ellipse cx="96" cy="61" rx="39" ry="31" fill="url(#catFur)" />
          <path d="M67 51 C75 42 84 39 95 41 C83 46 77 58 76 70Z" fill="#eac29e" opacity="0.7" />
          <path d="M114 42 C126 45 133 55 134 67 C126 59 120 54 112 52Z" fill="#875453" opacity="0.72" />

          <ellipse cx="82" cy="59" rx="5" ry="7" fill="#241722" />
          <ellipse cx="113" cy="59" rx="5" ry="7" fill="#241722" />
          <ellipse cx="83" cy="57" rx="1.8" ry="2.5" fill="#fff8e9" />
          <ellipse cx="114" cy="57" rx="1.8" ry="2.5" fill="#fff8e9" />
          <path d="M77 49 Q83 45 89 48 M107 48 Q114 44 120 49" fill="none" stroke="#70484a" strokeLinecap="round" strokeWidth="2.5" />
          <path d="M94 68 Q98 65 102 68 L98 72Z" fill="#7a3f50" />
          <path d="M98 72 Q94 78 88 75 M98 72 Q103 78 109 75" fill="none" stroke="#5e3944" strokeLinecap="round" strokeWidth="2" />
          <path d="M70 69 C58 67 50 65 42 61 M70 74 C57 74 50 76 41 80 M125 69 C138 67 145 65 153 61 M125 74 C138 74 145 76 154 80" fill="none" stroke="#f5dcc2" strokeLinecap="round" strokeWidth="1.5" opacity="0.9" />
          <path d="M65 79 Q72 88 81 87 M130 79 Q123 88 115 87" fill="none" stroke="#eab996" strokeLinecap="round" strokeWidth="3" opacity="0.8" />
        </g>
      </g>
    </svg>
  </div>
  );
};

AuthCat.defaultProps = {
  moving: false,
  onMoveEnd: () => {}
};

export default AuthCat;
