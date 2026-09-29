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

// Default system PIN/Password for Teacher Access
export const DEFAULT_TEACHER_PASSWORD = "guru123";

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
    const customPass = localStorage.getItem('edumonitor_teacher_password') || DEFAULT_TEACHER_PASSWORD;
    return password.trim() === customPass.trim();
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
