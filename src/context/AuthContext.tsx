import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  login: (name: string, role: UserRole, email?: string) => void;
  updateProfile: (name: string, schoolName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edumonitor_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Fresh default user (Guru by default, editable)
    return {
      id: 'user_teacher_1',
      name: 'Guru', // Clean default, editable anytime
      email: 'guru@sekolah.sch.id',
      role: 'TEACHER',
      schoolName: 'Sekolah EduMonitor',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString()
    };
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edumonitor_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edumonitor_user');
    }
  }, [currentUser]);

  const login = (name: string, role: UserRole, email?: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name || (role === 'TEACHER' ? 'Guru' : 'Siswa'),
      email: email || `${role.toLowerCase()}@sekolah.sch.id`,
      role,
      schoolName: 'Sekolah EduMonitor',
      avatarUrl: role === 'TEACHER' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
  };

  const updateProfile = (name: string, schoolName?: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      schoolName: schoolName !== undefined ? schoolName : currentUser.schoolName
    };
    setCurrentUser(updated);
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
        updateProfile,
        logout,
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
