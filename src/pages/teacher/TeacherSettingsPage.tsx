import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Save, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

export const TeacherSettingsPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || 'Guru');
  const [schoolName, setSchoolName] = useState(currentUser?.schoolName || 'Sekolah EduMonitor');
  
  // Custom Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, schoolName);
    setPasswordMsg({ type: 'success', text: 'Profil Guru dan Nama Sekolah berhasil diperbarui!' });
    setTimeout(() => setPasswordMsg(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!newPassword.trim()) {
      setPasswordMsg({ type: 'error', text: 'Password baru tidak boleh kosong!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password tidak cocok!' });
      return;
    }

    // Save custom secret password in local storage
    localStorage.setItem('edumonitor_teacher_password', newPassword.trim());
    setPasswordMsg({ type: 'success', text: 'Password Rahasia Guru berhasil diubah & disimpan secara aman!' });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold text-white">Pengaturan Profil & Keamanan Guru</h1>
        <p className="text-xs text-slate-400">Atur nama lengkap guru, instansi sekolah, serta ubah password rahasia akses pengawas.</p>
      </div>

      {passwordMsg && (
        <div className={`rounded-xl p-3 text-xs flex items-center space-x-2 ${
          passwordMsg.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/20 border border-red-500/40 text-red-300'
        }`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{passwordMsg.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-2xl">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-white/10 pb-3">
          <UserCheck className="h-5 w-5 text-blue-400" />
          <span>Informasi Profil Guru</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap Guru (Dapat Diubah):</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Pak Andi Wijaya, S.Pd."
            required
            className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Sekolah / Lembaga:</label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Contoh: SMA Negeri 1 Indonesia"
            className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Informasi Profil</span>
          </button>
        </div>
      </form>

      {/* Secret Password Settings Form */}
      <form onSubmit={handleChangePassword} className="glass-panel-accent rounded-3xl p-6 border border-indigo-500/30 space-y-4 shadow-2xl">
        <div className="flex items-center space-x-2 text-sm font-bold text-indigo-300 border-b border-white/10 pb-3">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <span>Ubah Password Rahasia Pengawas Guru</span>
        </div>

        <p className="text-xs text-slate-300">
          Buat password rahasia tersendiri agar hanya Anda yang memiliki akses ke Portal Guru dan Dashboard Pengawasan.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Password Baru Guru:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Masukkan password baru rahasia..."
            required
            className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Ulangi Konfirmasi Password Baru:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ketik ulang password baru..."
            required
            className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition"
          >
            <Lock className="h-4 w-4" />
            <span>Ubah Password Rahasia</span>
          </button>
        </div>
      </form>

    </div>
  );
};
