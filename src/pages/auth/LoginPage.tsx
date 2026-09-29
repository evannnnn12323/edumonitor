import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, GraduationCap, Lock, LogIn, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginAsTeacher, loginAsStudent } = useAuth();
  
  const [activePortal, setActivePortal] = useState<UserRole>('STUDENT');
  
  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherError, setTeacherError] = useState('');

  // Student Form State
  const [studentName, setStudentName] = useState('');

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');
    if (!teacherPassword) {
      setTeacherError('Password Guru wajib diisi!');
      return;
    }
    const success = loginAsTeacher(teacherName, teacherPassword);
    if (!success) {
      setTeacherError('Password Guru yang Anda masukkan salah!');
      return;
    }
    onLoginSuccess();
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsStudent(studentName);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/30 ring-1 ring-white/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">EduMonitor</h1>
          <p className="text-xs text-slate-400">Smart Online Learning & Assessment Platform</p>
        </div>

        {/* Portal Separator Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/10">
          <button
            onClick={() => setActivePortal('STUDENT')}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition ${
              activePortal === 'STUDENT'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>PORTAL SISWA</span>
          </button>

          <button
            onClick={() => setActivePortal('TEACHER')}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition ${
              activePortal === 'TEACHER'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <Lock className="h-3 w-3" />
            <span>PORTAL GURU</span>
          </button>
        </div>

        {/* PORTAL SISWA FORM */}
        {activePortal === 'STUDENT' && (
          <form onSubmit={handleStudentLogin} className="glass-panel rounded-3xl p-6 border border-emerald-500/30 space-y-4 shadow-2xl animate-in fade-in">
            <div className="text-center border-b border-white/10 pb-3">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                AKSES PESERTA UJIAN
              </span>
              <h2 className="text-sm font-bold text-white mt-2">Masuk Sebagai Siswa</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap Siswa:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk Ke Halaman Siswa</span>
            </button>
          </form>
        )}

        {/* PORTAL GURU FORM (With Password Protection, No Hints) */}
        {activePortal === 'TEACHER' && (
          <form onSubmit={handleTeacherLogin} className="glass-panel rounded-3xl p-6 border border-blue-500/30 space-y-4 shadow-2xl animate-in fade-in">
            <div className="text-center border-b border-white/10 pb-3">
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-300 ring-1 ring-blue-500/30">
                AKSES TERPROTEKSI PENGAWAS
              </span>
              <h2 className="text-sm font-bold text-white mt-2">Masuk Sebagai Guru</h2>
            </div>

            {teacherError && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{teacherError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap Guru:</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Contoh: Pak Andi Wijaya, S.Pd."
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password Akses Guru:</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Masukkan password guru..."
                  required
                  className="w-full rounded-xl bg-slate-900 border border-white/15 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk Ke Dashboard Pengawas</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
