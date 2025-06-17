import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const DUMMY_USER = { email: 'admin@chashma.test', name: 'Admin User', isAdmin: true };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = (email, password) => {
    if (email === 'admin@chashma.test' && password === 'admin') {
      setUser(DUMMY_USER);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};