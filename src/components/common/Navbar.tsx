import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../lib/demoData';
import { ShieldCheck, UserCheck, LogOut, Sparkles, ChevronDown, Bell } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { currentUser, loginAsDemo, logout } = useAuth();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">EduMonitor</span>
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400 ring-1 ring-blue-500/30">
                PROCTOR PRO
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">Smart Online Learning & Assessment</p>
          </div>
        </div>

        {/* Right Section: Demo Quick Switcher & User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Quick Switch Demo Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="flex items-center space-x-2 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30 transition hover:bg-indigo-500/20"
              title="Ganti Akun Demo Pengujian Realtime"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Ganti Akun Demo</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {showDemoDropdown && (
              <div className="glass-panel absolute right-0 mt-2 w-64 rounded-xl p-2 shadow-2xl ring-1 ring-white/10">
                <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Pilih Akun Demo (Uji 2 Browser):
                </div>
                <div className="space-y-1">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        loginAsDemo(u.email);
                        setShowDemoDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                        currentUser?.email === u.email
                          ? 'bg-blue-600/30 font-semibold text-blue-300 ring-1 ring-blue-500/40'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                      <span className={`ml-2 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        u.role === 'TEACHER' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {u.role === 'TEACHER' ? 'GURU' : 'SISWA'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current User Info */}
          {currentUser && (
            <div className="flex items-center space-x-3 border-l border-white/10 pl-3 sm:pl-4">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold text-white">{currentUser.name}</div>
                <div className="flex items-center space-x-1">
                  <UserCheck className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {currentUser.role === 'TEACHER' ? 'GURU' : 'SISWA'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-red-400 transition"
                title="Keluar / Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
