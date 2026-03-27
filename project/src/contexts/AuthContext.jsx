import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('registrar_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('registrar_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      const data = await apiClient('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // KEY FIX: Save both user AND token together
      if (data.user && data.token) {
        const userData = { ...data.user, token: data.token }; 
        
        setUser(userData);
        localStorage.setItem('registrar_user', JSON.stringify(userData));
        
        return { success: true, data: userData };
      }
      return { success: false, error: { message: 'Invalid server response' } };
      
    } catch (err) {
      return { success: false, error: { message: err.message } };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('registrar_user');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};