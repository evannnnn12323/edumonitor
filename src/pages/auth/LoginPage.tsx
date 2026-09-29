import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogIn, UserCheck, GraduationCap } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('TEACHER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || (role === 'TEACHER' ? 'Guru' : 'Siswa'), role);
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

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5 shadow-2xl">
          <h2 className="text-sm font-bold text-white text-center border-b border-white/10 pb-3">
            Masuk Aplikasi (Kosongan / Fresh)
          </h2>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Pilih Peran Pengguna:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-bold border transition ${
                  role === 'TEACHER'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <UserCheck className="h-4 w-4 text-blue-400" />
                <span>Guru (Pengawas)</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-bold border transition ${
                  role === 'STUDENT'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>Siswa (Peserta)</span>
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {role === 'TEACHER' ? 'Nama Lengkap Guru:' : 'Nama Lengkap Siswa:'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'TEACHER' ? 'Contoh: Pak Andi, S.Pd.' : 'Contoh: Budi Santoso'}
              className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              *Dapat diubah kapan saja via tombol edit di atas navbar.
            </p>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk Ke Aplikasi</span>
          </button>
        </form>

      </div>
    </div>
  );
};
