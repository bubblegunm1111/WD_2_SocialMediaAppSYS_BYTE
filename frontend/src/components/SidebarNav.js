import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JellyRadio from './JellyRadio';

const NAV_ITEMS = [
  { value: '/', label: 'Home', icon: <svg viewBox="0 0 24 24"><path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10Z" fill="currentColor"/></svg> },
  { value: '/observatory', label: 'Observatory', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" stroke="currentColor" fill="none"/><path d="M4 20L20 4" stroke="currentColor"/></svg> },
  { value: '/pages', label: 'Pages', icon: <svg viewBox="0 0 24 24"><path d="M20 4C20 4 18 2 14 4C10 6 6 12 4 18L2 22L6 20C12 18 18 14 20 10C22 6 20 4 20 4Z M14 4C14 4 16 10 10 16" stroke="currentColor" fill="none"/></svg> },
  { value: '/letters', label: 'Letters', icon: <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" fill="none"/><path d="M3 6L12 13L21 6" stroke="currentColor" fill="none"/></svg> },
  { value: '/reflections', label: 'Reflections', icon: <svg viewBox="0 0 24 24"><path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.9 4.9L7.7 7.7M16.3 16.3L19.1 19.1M4.9 19.1L7.7 16.3M16.3 4.9L19.1 7.7" stroke="currentColor"/><circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/></svg> },
  { value: 'PROFILE', label: 'My Room', icon: <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" fill="none"/></svg> }
];

export default function SidebarNav() {
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
    if (val === '/pages') {
      // Future placeholder
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
    </div>
  );
}
