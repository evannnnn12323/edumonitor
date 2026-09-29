import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClassItem } from '../types';
import { DEMO_CLASSES } from '../lib/demoData';

interface ClassContextType {
  classes: ClassItem[];
  joinedClassIds: string[];
  addClass: (name: string, subject: string, grade: string, teacherName: string, teacherId: string) => ClassItem;
  deleteClass: (classId: string) => void;
  joinClassByCode: (code: string) => { success: boolean; message: string; classItem?: ClassItem };
  getJoinedClasses: () => ClassItem[];
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('edumonitor_classes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEMO_CLASSES;
  });

  const [joinedClassIds, setJoinedClassIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('edumonitor_joined_class_ids');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return ['class_mtk_x_a'];
  });

  useEffect(() => {
    localStorage.setItem('edumonitor_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('edumonitor_joined_class_ids', JSON.stringify(joinedClassIds));
  }, [joinedClassIds]);

  const addClass = (
    name: string,
    subject: string,
    grade: string,
    teacherName: string,
    teacherId: string
  ): ClassItem => {
    const randomCode = `${(subject || 'KLS').substring(0, 3).toUpperCase()}-${(grade || 'X').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClass: ClassItem = {
      id: `class_${Date.now()}`,
      name: name.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      code: randomCode,
      teacherId: teacherId || 'user_teacher_1',
      teacherName: teacherName.trim() || 'Guru',
      createdAt: new Date().toISOString(),
      studentCount: 0
    };
    setClasses((prev) => [newClass, ...prev]);
    return newClass;
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    setJoinedClassIds((prev) => prev.filter((id) => id !== classId));
  };

  const joinClassByCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Kode kelas tidak boleh kosong.' };
    }

    const targetClass = classes.find((c) => c.code.trim().toUpperCase() === cleanCode);
    if (!targetClass) {
      return {
        success: false,
        message: `Kode kelas "${cleanCode}" tidak ditemukan. Mohon pastikan kode dari Guru sudah benar.`
      };
    }

    if (joinedClassIds.includes(targetClass.id)) {
      return {
        success: false,
        message: `Anda sudah terdaftar di kelas "${targetClass.name}".`
      };
    }

    setJoinedClassIds((prev) => [...prev, targetClass.id]);
    setClasses((prev) =>
      prev.map((c) =>
        c.id === targetClass.id ? { ...c, studentCount: (c.studentCount || 0) + 1 } : c
      )
    );

    return {
      success: true,
      message: `Berhasil bergabung ke kelas "${targetClass.name}"!`,
      classItem: targetClass
    };
  };

  const getJoinedClasses = (): ClassItem[] => {
    return classes.filter((c) => joinedClassIds.includes(c.id));
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        joinedClassIds,
        addClass,
        deleteClass,
        joinClassByCode,
        getJoinedClasses
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
};
