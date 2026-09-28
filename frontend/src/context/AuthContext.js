import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Fetch latest user data in background to sync profile picture, etc.
        try {
          const response = await userService.getUser(parsedUser.id || parsedUser._id);
          const freshUser = { ...response.data, id: response.data._id || response.data.id };
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Failed to sync latest user data', err);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.data.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserContext = (newUser) => {
    const standardizedUser = { ...newUser, id: newUser._id || newUser.id };
    setUser(standardizedUser);
    try {
      localStorage.setItem('user', JSON.stringify(standardizedUser));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUserContext,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
