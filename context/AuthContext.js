
// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ADDED THE MISSING LOGIN FUNCTION
  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  // Simulate loading user
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading,
      login,  // ← ADDED THIS
      logout  // ← ADDED THIS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};