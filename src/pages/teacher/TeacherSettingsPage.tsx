import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Save, CheckCircle2, School } from 'lucide-react';

export const TeacherSettingsPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || 'Guru');
  const [schoolName, setSchoolName] = useState(currentUser?.schoolName || 'Sekolah EduMonitor');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, schoolName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold text-white">Pengaturan Profil & Nama Guru</h1>
        <p className="text-xs text-slate-400">Ubah nama guru dan instansi sekolah secara bebas. Nama ini akan tampil di seluruh dashboard, lembar ujian, dan pesan peringatan ke siswa.</p>
      </div>

      <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-2xl">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-white/10 pb-3">
          <UserCheck className="h-5 w-5 text-blue-400" />
          <span>Informasi Profil Guru</span>
        </div>

        {isSaved && (
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Nama Guru dan Sekolah berhasil diperbarui!</span>
          </div>
        )}

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
            <span>Simpan Perubahan Profile</span>
          </button>
        </div>
      </form>

    </div>
  );
};
