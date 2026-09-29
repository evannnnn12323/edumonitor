import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  loginAsTeacher: (name?: string, password?: string) => boolean;
  loginAsStudent: (name?: string) => void;
  updateProfile: (name: string, schoolName?: string) => void;
  verifyTeacherPassword: (password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
};

const DEFAULT_PASS_HASH = "6bg4bl";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edumonitor_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
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
      return password.trim() === customPass.trim();
    }
    return simpleHash(password.trim()) === DEFAULT_PASS_HASH;
  };

  const loginAsTeacher = (name?: string, password?: string): boolean => {
    if (password && !verifyTeacherPassword(password)) {
      return false;
    }

    const savedName = localStorage.getItem('edumonitor_saved_teacher_name');
    let finalName = name?.trim() || '';

    if (finalName && finalName !== 'Guru') {
      localStorage.setItem('edumonitor_saved_teacher_name', finalName);
    } else if (savedName) {
      finalName = savedName;
    } else {
      finalName = 'Guru';
    }

    const newUser: User = {
      id: currentUser?.role === 'TEACHER' ? currentUser.id : `user_teacher_${Date.now()}`,
      name: finalName,
      email: 'guru@sekolah.sch.id',
      role: 'TEACHER',
      schoolName: currentUser?.schoolName || 'Sekolah EduMonitor',
      avatarUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: currentUser?.createdAt || new Date().toISOString()
    };
    setCurrentUser(newUser);
    return true;
  };

  const loginAsStudent = (name?: string) => {
    const savedName = localStorage.getItem('edumonitor_saved_student_name');
    let finalName = name?.trim() || '';

    if (finalName && finalName !== 'Siswa') {
      localStorage.setItem('edumonitor_saved_student_name', finalName);
    } else if (savedName) {
      finalName = savedName;
    } else {
      finalName = 'Siswa';
    }

    const newUser: User = {
      id: currentUser?.role === 'STUDENT' ? currentUser.id : `user_student_${Date.now()}`,
      name: finalName,
      email: 'siswa@sekolah.sch.id',
      role: 'STUDENT',
      schoolName: currentUser?.schoolName || 'Sekolah EduMonitor',
      avatarUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      createdAt: currentUser?.createdAt || new Date().toISOString()
    };
    setCurrentUser(newUser);
  };

  const updateProfile = (name: string, schoolName?: string) => {
    if (!currentUser) return;
    const trimmedName = name.trim() || currentUser.name;
    if (currentUser.role === 'TEACHER') {
      localStorage.setItem('edumonitor_saved_teacher_name', trimmedName);
      const savedClassesStr = localStorage.getItem('edumonitor_classes');
      if (savedClassesStr) {
        try {
          const parsed = JSON.parse(savedClassesStr);
          if (Array.isArray(parsed)) {
            const updated = parsed.map(c => ({ ...c, teacherName: trimmedName }));
            localStorage.setItem('edumonitor_classes', JSON.stringify(updated));
          }
        } catch (e) {}
      }
    } else if (currentUser.role === 'STUDENT') {
      localStorage.setItem('edumonitor_saved_student_name', trimmedName);
    }

    const updated: User = {
      ...currentUser,
      name: trimmedName,
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
