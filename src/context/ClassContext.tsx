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
  updateTeacherNameInClasses: (newTeacherName: string) => void;
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

  // Helper to ensure teacherName uses the latest saved teacher name
  const resolveClassesTeacherName = (items: ClassItem[]): ClassItem[] => {
    const savedTeacherName = localStorage.getItem('edumonitor_saved_teacher_name');
    if (!savedTeacherName) return items;
    return items.map((c) => ({
      ...c,
      teacherName: (c.teacherName === 'Guru' || c.teacherId === 'user_teacher_1' || !c.teacherName)
        ? savedTeacherName
        : c.teacherName
    }));
  };

  const formattedClasses = resolveClassesTeacherName(classes);

  useEffect(() => {
    localStorage.setItem('edumonitor_classes', JSON.stringify(formattedClasses));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('edumonitor_joined_class_ids', JSON.stringify(joinedClassIds));
  }, [joinedClassIds]);

  const updateTeacherNameInClasses = (newTeacherName: string) => {
    const trimmed = newTeacherName.trim();
    if (!trimmed) return;
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        teacherName: trimmed
      }))
    );
  };

  const addClass = (
    name: string,
    subject: string,
    grade: string,
    teacherName: string,
    teacherId: string
  ): ClassItem => {
    const savedTeacherName = localStorage.getItem('edumonitor_saved_teacher_name');
    const finalTeacherName = savedTeacherName || teacherName.trim() || 'Guru';
    const randomCode = `${(subject || 'KLS').substring(0, 3).toUpperCase()}-${(grade || 'X').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClass: ClassItem = {
      id: `class_${Date.now()}`,
      name: name.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      code: randomCode,
      teacherId: teacherId || 'user_teacher_1',
      teacherName: finalTeacherName,
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

    const currentClasses = resolveClassesTeacherName(classes);
    const targetClass = currentClasses.find((c) => c.code.trim().toUpperCase() === cleanCode);
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
    const currentClasses = resolveClassesTeacherName(classes);
    return currentClasses.filter((c) => joinedClassIds.includes(c.id));
  };

  return (
    <ClassContext.Provider
      value={{
        classes: formattedClasses,
        joinedClassIds,
        addClass,
        deleteClass,
        joinClassByCode,
        getJoinedClasses,
        updateTeacherNameInClasses
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
