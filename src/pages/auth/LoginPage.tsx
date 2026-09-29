import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../lib/demoData';
import { ShieldCheck, LogIn, Sparkles, User, Lock } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email);
    onLoginSuccess();
  };

  const handleDemoSelect = (demoEmail: string) => {
    loginAsDemo(demoEmail);
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

        {/* Quick Demo Login Card */}
        <div className="glass-panel-accent rounded-3xl p-5 border border-indigo-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Login Cepat Demo (Siap Uji 2 Browser):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoSelect('guru.demo@edumonitor.local')}
              className="rounded-xl bg-purple-600/30 border border-purple-500/40 p-3 text-left hover:bg-purple-600/40 transition"
            >
              <div className="text-xs font-bold text-white">Guru Demo</div>
              <div className="text-[10px] text-purple-200">Pak Andi (Pengawas)</div>
            </button>
            <button
              onClick={() => handleDemoSelect('siswa.demo@edumonitor.local')}
              className="rounded-xl bg-emerald-600/30 border border-emerald-500/40 p-3 text-left hover:bg-emerald-600/40 transition"
            >
              <div className="text-xs font-bold text-white">Siswa Demo</div>
              <div className="text-[10px] text-emerald-200">Budi Santoso (Peserta)</div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-2xl">
          <h2 className="text-sm font-bold text-white text-center border-b border-white/10 pb-3">
            Masuk Akun Pengguna
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Sekolah / Pengguna:</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Kata Sandi / Password:</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
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
