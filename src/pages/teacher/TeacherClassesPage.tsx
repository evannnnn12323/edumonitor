import React, { useState } from 'react';
import { useClasses } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../lib/demoData';
import { Users, Plus, Copy, Check, Trash2 } from 'lucide-react';

export const TeacherClassesPage: React.FC = () => {
  const { classes, addClass, deleteClass } = useClasses();
  const { currentUser } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [grade, setGrade] = useState('X');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addClass(
      name,
      subject,
      grade,
      currentUser?.name || 'Guru',
      currentUser?.id || 'user_teacher_1'
    );
    setShowModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Manajemen Kelas Pembelajaran</h1>
          <p className="text-xs text-slate-400">Buat kelas baru, bagikan kode kelas, dan kelola daftar anggota siswa.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Kelas Baru</span>
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-3">
          <p className="text-sm text-slate-400">Belum ada kelas yang dibuat.</p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
          >
            + Buat Kelas Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map(c => (
            <div key={c.id} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl relative group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400">{c.subject} • Kelas {c.grade}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pengajar: {c.teacherName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 ring-1 ring-blue-500/30">
                    {c.studentCount || 0} Siswa
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus kelas "${c.name}"?`)) {
                        deleteClass(c.id);
                      }
                    }}
                    title="Hapus Kelas"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Kode Gabung Siswa:</div>
                  <div className="text-base font-extrabold text-blue-400 tracking-wider font-mono">{c.code}</div>
                </div>
                <button
                  onClick={() => handleCopyCode(c.code)}
                  className="flex items-center space-x-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30"
                >
                  {copiedCode === c.code ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode === c.code ? 'Tercopy!' : 'Salin Kode'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-400">Daftar Siswa Terverifikasi:</span>
                <div className="flex -space-x-2">
                  {DEMO_USERS.slice(1).map(u => (
                    <img key={u.id} src={u.avatarUrl} alt={u.name} title={u.name} className="h-7 w-7 rounded-full border-2 border-slate-900 object-cover" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreateClass} className="w-full max-w-md rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Buat Kelas Baru</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Kelas:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Matematika Kelas X A"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mata Pelajaran:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tingkat Kelas:</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-xs text-slate-400">
                Batal
              </button>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-500">
                Buat Kelas
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

