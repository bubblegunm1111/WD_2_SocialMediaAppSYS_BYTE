import React, { useState, useRef } from 'react';
import './PetCard.css';
import catFoodGif from '../catfood2.gif';
import catPlayGif from '../catplay.gif';

const MOODS = ['happy', 'sleepy', 'hungry', 'playful', 'cozy'];

const PetCard = ({ catGif }) => {
  const [mood, setMood] = useState('happy');
  const [hunger, setHunger] = useState(80);
  const [energy, setEnergy] = useState(90);
  const [activeAction, setActiveAction] = useState(null); // 'eat' | 'play' | null
  const timerRef = useRef(null);

  const triggerAction = (action, duration, moodChange) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveAction(action);
    setMood(moodChange.active);
    timerRef.current = setTimeout(() => {
      setActiveAction(null);
      setMood(moodChange.after);
    }, duration);
  };

  const feed = () => {
    setHunger(prev => Math.min(100, prev + 20));
    triggerAction('eat', 2500, { active: 'happy', after: 'happy' });
  };

  const play = () => {
    setEnergy(prev => Math.max(0, prev - 15));
    setHunger(prev => Math.max(0, prev - 10));
    triggerAction('play', 2500, { active: 'playful', after: 'happy' });
  };

  const rest = () => {
    setEnergy(prev => Math.min(100, prev + 20));
    triggerAction('rest', 2500, { active: 'sleepy', after: 'cozy' });
  };

  return (
    <div className="pet-card">
      <div className="pet-card-header">
        <span className="pet-card-title">✧ YOUR COMPANION</span>
        <span className="pet-card-mood-badge">{mood}</span>
      </div>

      <div className="pet-card-stage">
        <div className="pet-gif-wrapper">
          <img 
            src={catGif} 
            alt="Mooncat Idle" 
            className={`pet-card-gif cat-idle-gif ${!activeAction || activeAction === 'rest' ? 'active' : ''}`} 
          />
          <img 
            src={catFoodGif} 
            alt="Mooncat Eating" 
            className={`pet-card-gif cat-eat-gif ${activeAction === 'eat' ? 'active' : ''}`} 
          />
          <img 
            src={catPlayGif} 
            alt="Mooncat Playing" 
            className={`pet-card-gif cat-play-gif ${activeAction === 'play' ? 'active' : ''}`} 
          />
        </div>
        <div className="pet-card-name">MOONCAT</div>
      </div>

      <div className="pet-card-bars">
        <div className="pet-bar-row">
          <span>🐟 Hunger</span>
          <div className="pet-bar-track">
            <div className="pet-bar-fill hunger" style={{ width: `${hunger}%` }} />
          </div>
          <span className="pet-bar-val">{hunger}%</span>
        </div>
        <div className="pet-bar-row">
          <span>⚡ Energy</span>
          <div className="pet-bar-track">
            <div className="pet-bar-fill energy" style={{ width: `${energy}%` }} />
          </div>
          <span className="pet-bar-val">{energy}%</span>
        </div>
      </div>

      <div className="pet-card-actions">
        <button className="pet-btn" onClick={feed} title="Feed">🐟 Feed</button>
        <button className="pet-btn" onClick={play} title="Play">🎵 Play</button>
        <button className="pet-btn" onClick={rest} title="Rest">💤 Rest</button>
      </div>
    </div>
  );
};

export default PetCard;
