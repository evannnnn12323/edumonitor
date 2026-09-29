import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CLASSES, DEMO_EXAM, DEMO_USERS } from '../../lib/demoData';
import { LayoutDashboard, Users, ClipboardList, Eye, ShieldAlert, TrendingUp, Award, Clock } from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

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
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition active:scale-95 live-pulse"
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
          <div className="mt-3 text-2xl font-extrabold text-white">1 <span className="text-xs text-slate-500 font-normal">kelas</span></div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ujian Aktif</span>
            <ClipboardList className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-400">1 <span className="text-xs text-slate-500 font-normal">aktif</span></div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Rata-Rata Nilai</span>
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-purple-400">80.0</div>
        </div>
        <div className="glass-panel-warning rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Indikator Perlu Diperiksa</span>
            <ShieldAlert className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-amber-300">1 <span className="text-xs text-amber-200/70 font-normal">siswa</span></div>
        </div>
      </div>

      {/* Recent Class & Exam Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4">Kelas Saya</h3>
          <div className="space-y-3">
            {DEMO_CLASSES.map(c => (
              <div key={c.id} className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400">Kode: <code className="text-blue-400 font-bold">{c.code}</code></div>
                </div>
                <button onClick={() => onNavigate('classes')} className="rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300">
                  Lihat Siswa ({c.studentCount})
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4">Ujian Sedang Berlangsung</h3>
          <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{DEMO_EXAM.title}</span>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">BERLANGSUNG</span>
            </div>
            <p className="text-[11px] text-slate-400">{DEMO_EXAM.className} • {DEMO_EXAM.durationMinutes} Menit</p>
            <button
              onClick={() => onNavigate('monitoring')}
              className="mt-2 w-full rounded-xl bg-red-600 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
            >
              Pantau Live Realtime ({DEMO_USERS.length - 1} Siswa)
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
