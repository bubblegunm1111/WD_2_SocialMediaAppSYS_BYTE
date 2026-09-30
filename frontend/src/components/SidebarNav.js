import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JellyRadio from './JellyRadio';

const NAV_ITEMS = [
  { value: '/', label: 'Home', icon: '✦' },
  { value: '/observatory', label: 'Observatory', icon: '🔭' },
  { value: '/letters', label: 'Letters', icon: '✉' },
  { value: '/reflections', label: 'Reflections', icon: '✺' },
  { value: 'PROFILE', label: 'My Room', icon: '☾' }
];

export default function SidebarNav({ onLettersClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const profilePath = `/profile/${user?._id || user?.id}`;

  const navItems = NAV_ITEMS.map(item =>
    item.value === 'PROFILE' ? { ...item, value: profilePath } : item
  );

  let currentPath = location.pathname;
  if (!navItems.find(item => item.value === currentPath)) {
    if (currentPath.startsWith('/profile')) currentPath = profilePath;
    else currentPath = '/';
  }

  const handleChange = (val) => {
    if (val === '/letters' && onLettersClick) {
      onLettersClick();
      return;
    }
    navigate(val);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <JellyRadio
        items={navItems}
        value={currentPath}
        onChange={handleChange}
        className="jelly-sidebar-nav"
        chipColor="transparent"
        activeColor="rgba(25, 20, 45, 0.6)"
        textColor="#e6d8c8"
        activeTextColor="#fff"
        size="lg"
        gap={8}
        radius={12}
        swell={0.1}
        barge={15}
        shrink={0}
        jelly={0.8}
        bounce={0.4}
        stagger={30}
        stiffness={400}
      />
      <div style={{
        margin: '30px 0',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.4)',
        borderRadius: '12px',
        padding: '15px',
        color: '#ffd700',
        fontSize: '12px',
        fontFamily: "'Cinzel', serif",
        letterSpacing: '1.5px',
        textAlign: 'center',
        textTransform: 'uppercase',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(255, 215, 0, 0.15)',
        backdropFilter: 'blur(5px)',
        fontWeight: 'bold',
        textShadow: '0 0 8px rgba(255, 215, 0, 0.8)'
      }}>
        Powered by SYS ✧
      </div>
    </div>
  );
}
