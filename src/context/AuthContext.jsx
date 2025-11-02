// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();
  const login = (loginInput, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(
      u => (u.email === loginInput || u.username === loginInput) && u.password === password
    );
    if (foundUser) {
      const userToSave = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role // This is the new, important part!
      };

      setUser(userToSave);
      sessionStorage.setItem('authUser', JSON.stringify(userToSave));
      return userToSave; // Return the user object, NOT true
    } else {
      return null; // Return null, NOT false    }
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('authUser');
    navigate('/login');
  };

  const [loading, setLoading] = useState(true); // <-- 1. Add loading state

  const value = { user, loading, login, logout };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('gymUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('gymUser'); // Clear corrupted data
    } finally {
      setLoading(false); // <-- 2. Set loading to false when check is done
    }
  }, []);

  // 3. Provide 'loading' in the value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}