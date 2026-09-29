import React, { useState } from 'react';
import './PetCard.css';
import catFoodGif from '../catfood2.gif';

const MOODS = ['happy', 'sleepy', 'hungry', 'playful', 'cozy'];

const PetCard = ({ catGif }) => {
  const [mood, setMood] = useState('happy');
  const [hunger, setHunger] = useState(80);
  const [energy, setEnergy] = useState(90);
  const [lastAction, setLastAction] = useState('');
  const [isEating, setIsEating] = useState(false);

  const feed = () => {
    setHunger(prev => Math.min(100, prev + 20));
    setMood('happy');
    setLastAction('🐟 Yum! Mooncat is munching...');
    setIsEating(true);
    setTimeout(() => {
      setLastAction('');
      setIsEating(false);
    }, 5000);
  };

  const play = () => {
    setEnergy(prev => Math.max(0, prev - 15));
    setHunger(prev => Math.max(0, prev - 10));
    setMood('playful');
    setLastAction('🎵 Mooncat is chasing stars!');
    setTimeout(() => { setMood('happy'); setLastAction(''); }, 2500);
  };

  const rest = () => {
    setEnergy(prev => Math.min(100, prev + 20));
    setMood('sleepy');
    setLastAction('💤 Mooncat is curled up...');
    setTimeout(() => { setMood('cozy'); setLastAction(''); }, 2500);
  };

  return (
    <div className="pet-card">
      <div className="pet-card-header">
        <span className="pet-card-title">✧ YOUR COMPANION</span>
        <span className="pet-card-mood-badge">{mood}</span>
      </div>

      <div className="pet-card-stage">
        {lastAction && (
          <div className="pet-card-action-toast">{lastAction}</div>
        )}
        <div className="pet-gif-wrapper">
          <img 
            src={catGif} 
            alt="Mooncat Idle" 
            className={`pet-card-gif cat-idle-gif ${!isEating ? 'active' : ''}`} 
          />
          <img 
            src={catFoodGif} 
            alt="Mooncat Eating" 
            className={`pet-card-gif cat-eat-gif ${isEating ? 'active' : ''}`} 
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
