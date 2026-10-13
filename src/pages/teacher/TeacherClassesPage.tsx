import React, { useState } from 'react';
import { useClasses } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../lib/demoData';
import { Users, Plus, Copy, Check, Trash2, Key, Sparkles, X } from 'lucide-react';

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
      
      {/* Banner Header */}
      <div className="rounded-3xl glass-panel-accent p-6 sm:p-8 border border-blue-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 ring-1 ring-blue-500/30 flex items-center space-x-1.5 w-fit">
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span>MANAJEMEN RUANG KELAS</span>
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-white tracking-tight">Manajemen Kelas Pembelajaran</h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              Buat ruang kelas baru, dapatkan kode unik untuk siswa gabung, dan pantau anggota kelas secara terintegrasi.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Kelas Baru</span>
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4 shadow-xl">
          <div className="h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Belum Ada Kelas Dibuat</h3>
            <p className="text-xs text-slate-400 mt-1">Buat kelas pertama Anda untuk mulai membagikan kode bergabung ke siswa.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
          >
            + Buat Kelas Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map(c => (
            <div key={c.id} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl hover:border-blue-500/30 transition duration-300 flex flex-col justify-between">
              
              {/* Class Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                      {c.subject} • Kelas {c.grade}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white tracking-tight">{c.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pengajar: <strong className="text-slate-200">{c.teacherName}</strong></p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                    {c.studentCount || 0} Siswa
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus kelas "${c.name}"?`)) {
                        deleteClass(c.id);
                      }
                    }}
                    title="Hapus Kelas"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="rounded-2xl bg-slate-950/80 p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kode Gabung Siswa:</div>
                  <div className="text-base font-extrabold text-blue-400 tracking-widest font-mono mt-0.5">{c.code}</div>
                </div>
                <button
                  onClick={() => handleCopyCode(c.code)}
                  className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    copiedCode === c.code
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30'
                  }`}
                >
                  {copiedCode === c.code ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode === c.code ? 'Tercopy!' : 'Salin Kode'}</span>
                </button>
              </div>

              {/* Footer Verified Students */}
              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Siswa Terverifikasi:</span>
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

      {/* Create Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form onSubmit={handleCreateClass} className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-7 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span>Buat Kelas Pembelajaran Baru</span>
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Kelas:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Matematika Kelas X A"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mata Pelajaran:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/15 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tingkat Kelas:</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/15 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-xs text-slate-400">
                Batal
              </button>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition">
                Buat Kelas
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
