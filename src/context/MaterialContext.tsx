import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material } from '../types';
import { DEMO_MATERIALS } from '../lib/demoData';

interface AddMaterialData {
  classId: string;
  className: string;
  title: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  teacherId: string;
}

interface MaterialContextType {
  materials: Material[];
  addMaterial: (data: AddMaterialData) => Material;
  deleteMaterial: (id: string) => void;
  getMaterialsForClasses: (classIds: string[]) => Material[];
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export const MaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('edumonitor_materials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEMO_MATERIALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('edumonitor_materials', JSON.stringify(materials));
    } catch (e) {
      console.error('Failed to save materials to localStorage:', e);
    }
  }, [materials]);

  const addMaterial = (data: AddMaterialData): Material => {
    const newMaterial: Material = {
      id: `mat_${Date.now()}`,
      classId: data.classId,
      className: data.className,
      title: data.title.trim(),
      content: data.content.trim(),
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      createdAt: new Date().toISOString(),
      teacherId: data.teacherId
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    return newMaterial;
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const getMaterialsForClasses = (classIds: string[]): Material[] => {
    if (!classIds || classIds.length === 0) return materials;
    return materials.filter((m) => classIds.includes(m.classId));
  };

  return (
    <MaterialContext.Provider
      value={{
        materials,
        addMaterial,
        deleteMaterial,
        getMaterialsForClasses
      }}
    >
      {children}
    </MaterialContext.Provider>
  );
};

export const useMaterials = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return context;
};
