/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Verify token and get user data
          const response = await api.get('/auth/me');
          if (isMounted) {
            setUser(response.data.data);
            setToken(storedToken);
          }
        } catch (err) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data.data;
      
      // Store tokens
      localStorage.setItem('token', newToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      const { token: newToken, refreshToken: newRefreshToken, user: newUser } = response.data.data;
      
      // Store tokens
      localStorage.setItem('token', newToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      const response = await api.put('/auth/me', updates);
      setUser(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    const roleHierarchy = { admin: 3, faculty: 2, student: 1 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  // Check if user is admin
  const isAdmin = () => user?.role === 'admin';

  // Check if user is faculty
  const isFaculty = () => user?.role === 'faculty' || user?.role === 'admin';

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    isFaculty,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
