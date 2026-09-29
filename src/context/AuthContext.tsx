import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../lib/demoData';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  loginAsDemo: (demoEmail: string) => void;
  logout: () => void;
  register: (name: string, email: string, role: UserRole) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edumonitor_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0]; // Default to Teacher Demo for immediate instant preview
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edumonitor_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edumonitor_user');
    }
  }, [currentUser]);

  const login = async (email: string): Promise<boolean> => {
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Fallback: create dynamic user for testing
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: email.includes('guru') || email.includes('teacher') ? 'TEACHER' : 'STUDENT',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    return true;
  };

  const loginAsDemo = (demoEmail: string) => {
    const found = DEMO_USERS.find(u => u.email === demoEmail);
    if (found) {
      setCurrentUser(found);
    }
  };

  const register = async (name: string, email: string, role: UserRole): Promise<boolean> => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        login,
        loginAsDemo,
        logout,
        register,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
