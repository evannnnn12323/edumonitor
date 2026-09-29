import React, { useState } from 'react';
import { DEMO_CLASSES, DEMO_EXAM } from '../../lib/demoData';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, ClipboardList, Award, Plus, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface StudentDashboardProps {
  onStartExam: (examId: string) => void;
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onStartExam, onNavigate }) => {
  const { currentUser } = useAuth();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joinedClasses, setJoinedClasses] = useState(DEMO_CLASSES);

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    alert(`Berhasil bergabung ke kelas dengan kode: ${classCode.toUpperCase()}`);
    setShowJoinModal(false);
    setClassCode('');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="rounded-3xl glass-panel-accent p-6 sm:p-8 border border-blue-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 ring-1 ring-blue-500/30">
              PANEL SISWA ONLINE
            </span>
            <h1 className="mt-3 text-xl font-bold text-white">Halo, {currentUser?.name}!</h1>
            <p className="mt-1 text-xs text-slate-300">Siap untuk mengikuti ujian & latihan daring hari ini?</p>
          </div>

          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Gabung Kelas Baru</span>
          </button>
        </div>
      </div>

      {/* Active Exam Card */}
      <div className="glass-panel-warning rounded-3xl p-6 border border-amber-500/40 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                UJIAN AKTIF
              </span>
              <span className="text-xs text-amber-200">Batas Waktu: Hari ini, 23:59 WIB</span>
            </div>
            <h3 className="mt-2 text-lg font-bold text-white">{DEMO_EXAM.title}</h3>
            <p className="text-xs text-slate-300">{DEMO_EXAM.className} • Durasi: {DEMO_EXAM.durationMinutes} Menit • {DEMO_EXAM.totalQuestions} Soal</p>
          </div>

          <button
            onClick={() => onStartExam(DEMO_EXAM.id)}
            className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Mulai Ujian Sekarang</span>
          </button>
        </div>
      </div>

      {/* My Classes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kelas Terdaftar</h3>
          <button onClick={() => onNavigate('classes')} className="text-xs text-blue-400 hover:underline">Lihat Semua</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {joinedClasses.map(c => (
            <div key={c.id} className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-white">{c.name}</div>
              <div className="text-[11px] text-slate-400">{c.teacherName}</div>
              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5">
                <span>Kode: <strong className="text-blue-400">{c.code}</strong></span>
                <span className="text-emerald-400 font-semibold">Aktif</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleJoinClass} className="w-full max-w-md rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Gabung Kelas Dengan Kode</h3>
            <p className="text-xs text-slate-400">Masukkan kode kelas dari guru Anda (Contoh: MTK-XA-4827)</p>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Masukkan kode kelas..."
              required
              className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white uppercase tracking-wider focus:border-blue-500"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowJoinModal(false)} className="rounded-xl px-4 py-2 text-xs text-slate-400">
                Batal
              </button>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg">
                Gabung Kelas
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
