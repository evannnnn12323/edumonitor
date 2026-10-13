import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClasses } from '../../context/ClassContext';
import { Users, ClipboardList, Eye, ShieldAlert, Award } from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { classes } = useClasses();

  // Load saved exams from localStorage
  const savedExamsStr = localStorage.getItem('edumonitor_exams');
  let exams: any[] = [];
  try {
    if (savedExamsStr) exams = JSON.parse(savedExamsStr);
  } catch {}

  const activeExamsCount = exams.filter(e => e.status === 'ACTIVE' || !e.status).length;
  const totalStudentsCount = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="rounded-3xl glass-panel-accent p-6 sm:p-8 border border-blue-500/30 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 ring-1 ring-blue-500/30">
            SMP / SMA EDU-MONITOR PLATFORM
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-white">Selamat Datang, {currentUser?.name || 'Guru'}!</h1>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Pantau aktivitas ujian siswa secara akurat dan transparan. Kirim teguran atau bimbingan realtime langsung ke layar ujian siswa tanpa memotong pengerjaan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('monitoring')}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span>Buka Monitoring Live Ujian</span>
            </button>
            <button
              onClick={() => onNavigate('question-bank')}
              className="flex items-center space-x-2 rounded-xl bg-slate-800 border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              <span>Kelola Bank Soal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Kelas</span>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-white">{classes.length} <span className="text-xs text-slate-500 font-normal">kelas</span></div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ujian Dibuat</span>
            <ClipboardList className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-400">{exams.length} <span className="text-xs text-slate-500 font-normal">ujian</span></div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Siswa</span>
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-purple-400">{totalStudentsCount} <span className="text-xs text-slate-500 font-normal">siswa</span></div>
        </div>
        <div className="glass-panel-warning rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Ujian Aktif</span>
            <ShieldAlert className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-amber-300">{activeExamsCount} <span className="text-xs text-amber-200/70 font-normal">aktif</span></div>
        </div>
      </div>

      {/* Recent Class & Exam Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Kelas Saya</h3>
            <button onClick={() => onNavigate('classes')} className="text-xs text-blue-400 hover:underline">Kelola Kelas</button>
          </div>
          <div className="space-y-3">
            {classes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">Belum ada kelas yang dibuat.</p>
                <button
                  onClick={() => onNavigate('classes')}
                  className="mt-2 text-xs font-bold text-blue-400 hover:underline"
                >
                  + Buat Kelas Baru
                </button>
              </div>
            ) : (
              classes.map(c => (
                <div key={c.id} className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">Kode: <code className="text-blue-400 font-bold font-mono">{c.code}</code></div>
                  </div>
                  <button onClick={() => onNavigate('classes')} className="rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-600/30">
                    Lihat ({c.studentCount || 0} Siswa)
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Daftar Ujian Terbaru</h3>
            <button onClick={() => onNavigate('exams')} className="text-xs text-blue-400 hover:underline">Kelola Ujian</button>
          </div>
          {exams.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400">Belum ada ujian yang dibuat.</p>
              <button
                onClick={() => onNavigate('exams')}
                className="mt-2 text-xs font-bold text-blue-400 hover:underline"
              >
                + Buat Ujian Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.slice(0, 3).map((ex: any) => (
                <div key={ex.id} className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ex.title}</span>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {ex.status || 'AKTIF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ex.className} • {ex.durationMinutes} Menit</p>
                  <button
                    onClick={() => onNavigate('monitoring')}
                    className="w-full rounded-xl bg-red-600/80 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                  >
                    Pantau Monitoring Live
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
