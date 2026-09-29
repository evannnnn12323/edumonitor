import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  loginAsTeacher: (name: string, password: string) => boolean;
  loginAsStudent: (name: string) => void;
  updateProfile: (name: string, schoolName?: string) => void;
  verifyTeacherPassword: (password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

// Simple hash function so the default password is never stored as plain text in source code
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
};

// Pre-computed hash of the default teacher password — the actual password text is NOT in the code
const DEFAULT_PASS_HASH = "6bg4bl";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edumonitor_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null; // Fresh start: User lands on Login Portal selection screen first
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edumonitor_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edumonitor_user');
    }
  }, [currentUser]);

  const verifyTeacherPassword = (password: string): boolean => {
    const customPass = localStorage.getItem('edumonitor_teacher_password');
    if (customPass) {
      // User has set a custom password — compare directly with stored custom password
      return password.trim() === customPass.trim();
    }
    // No custom password set — compare hash against default
    return simpleHash(password.trim()) === DEFAULT_PASS_HASH;
  };

  const loginAsTeacher = (name: string, password: string): boolean => {
    if (!verifyTeacherPassword(password)) {
      return false;
    }
    const newUser: User = {
      id: `user_teacher_${Date.now()}`,
      name: name.trim() || 'Guru',
      email: 'guru@sekolah.sch.id',
      role: 'TEACHER',
      schoolName: 'Sekolah EduMonitor',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    return true;
  };

  const loginAsStudent = (name: string) => {
    const newUser: User = {
      id: `user_student_${Date.now()}`,
      name: name.trim() || 'Siswa',
      email: 'siswa@sekolah.sch.id',
      role: 'STUDENT',
      schoolName: 'Sekolah EduMonitor',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
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
        loginAsTeacher,
        loginAsStudent,
        updateProfile,
        verifyTeacherPassword,
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
