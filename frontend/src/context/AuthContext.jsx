import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const API_URL = 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Configure axios default headers
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check if user is logged in on load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthHeader(token);
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('token');
            setAuthHeader(null);
          }
        } catch (err) {
          console.error('Error loading user:', err.response?.data?.message || err.message);
          localStorage.removeItem('token');
          setAuthHeader(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Show toast notification
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      if (res.data.success) {
        const { token, ...userDetails } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(userDetails);
        triggerToast('Registration successful! Welcome.', 'success');
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      triggerToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        const { token, ...userDetails } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(userDetails);
        triggerToast(`Welcome back, ${userDetails.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      triggerToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
    triggerToast('Logged out successfully', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        toast,
        register,
        login,
        logout,
        triggerToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
