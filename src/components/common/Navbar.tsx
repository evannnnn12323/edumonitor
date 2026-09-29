import React, { useState } from 'react';
import { useAuth, DEFAULT_TEACHER_PASSWORD } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, Edit3, X, Save, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, loginAsTeacher, loginAsStudent, updateProfile, verifyTeacherPassword, logout } = useAuth();
  
  // Edit Profile Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editSchool, setEditSchool] = useState(currentUser?.schoolName || '');

  // Teacher Password Protection Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passError, setPassError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateProfile(editName, editSchool);
    setIsEditingName(false);
  };

  const handleSwitchToTeacher = () => {
    if (currentUser?.role === 'TEACHER') return;
    setIsPasswordModalOpen(true);
    setPassError('');
    setInputPassword('');
  };

  const handleConfirmTeacherPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!verifyTeacherPassword(inputPassword)) {
      setPassError(`Password Guru salah! (Default: ${DEFAULT_TEACHER_PASSWORD})`);
      return;
    }
    loginAsTeacher('Guru', inputPassword);
    setIsPasswordModalOpen(false);
  };

  const handleSwitchToStudent = () => {
    if (currentUser?.role === 'STUDENT') return;
    loginAsStudent('Siswa');
  };

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

        {/* Right Section: Role Switcher & Edit Name */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Protected Role Selector Buttons */}
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
            <button
              onClick={handleSwitchToTeacher}
              className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                currentUser?.role === 'TEACHER' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="h-3 w-3" />
              <span>Portal Guru</span>
            </button>
            <button
              onClick={handleSwitchToStudent}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                currentUser?.role === 'STUDENT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Portal Siswa
            </button>
          </div>

          {/* Current User Info & Edit Name Trigger */}
          {currentUser && (
            <div className="flex items-center space-x-3 border-l border-white/10 pl-3 sm:pl-4">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="hidden text-left sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">{currentUser.name}</span>
                  <button
                    onClick={() => {
                      setEditName(currentUser.name);
                      setEditSchool(currentUser.schoolName || '');
                      setIsEditingName(true);
                    }}
                    className="rounded p-0.5 text-slate-400 hover:bg-white/10 hover:text-blue-400 transition"
                    title="Edit Nama Pengguna"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <UserCheck className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {currentUser.role === 'TEACHER' ? 'GURU' : 'SISWA'}
                  </span>
                </div>
              </div>

              {/* Edit Name Button for Mobile */}
              <button
                onClick={() => {
                  setEditName(currentUser.name);
                  setEditSchool(currentUser.schoolName || '');
                  setIsEditingName(true);
                }}
                className="sm:hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-blue-400"
                title="Edit Nama"
              >
                <Edit3 className="h-4 w-4" />
              </button>

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

      {/* Edit Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form onSubmit={handleSaveProfile} className="w-full max-w-md rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-white">
                <Edit3 className="h-4 w-4 text-blue-400" />
                <span>Edit Nama Pengguna / Guru</span>
              </div>
              <button type="button" onClick={() => setIsEditingName(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap Guru / Pengguna:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ketik nama Anda di sini..."
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Sekolah / Instansi:</label>
              <input
                type="text"
                value={editSchool}
                onChange={(e) => setEditSchool(e.target.value)}
                placeholder="Contoh: SMA Negeri 1 Indonesia"
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Nama</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teacher Password Verification Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form onSubmit={handleConfirmTeacherPassword} className="w-full max-w-md rounded-2xl glass-panel p-6 border border-blue-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-white">
                <Lock className="h-4 w-4 text-blue-400" />
                <span>Verifikasi Password Guru</span>
              </div>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            {passError && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{passError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Masukkan Password Guru:</label>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Password pengawas..."
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Password Bawaan: <code className="text-blue-400 font-bold">{DEFAULT_TEACHER_PASSWORD}</code></span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
              >
                <span>Masuk Mode Guru</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </header>
  );
};
