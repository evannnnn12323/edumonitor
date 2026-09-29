import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Eye,
  BarChart3,
  Settings,
  ClipboardList,
  Award,
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'TEACHER';

  const teacherMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Kelas', icon: Users },
    { id: 'materials', label: 'Materi', icon: BookOpen },
    { id: 'exams', label: 'Ujian & Latihan', icon: ClipboardList },
    { id: 'question-bank', label: 'Bank Soal', icon: FileQuestion },
    { id: 'students', label: 'Daftar Siswa', icon: GraduationCap },
    { id: 'monitoring', label: 'Monitoring Realtime', icon: Eye, badge: 'LIVE' },
    { id: 'results', label: 'Nilai & Laporan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  const studentMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Kelas Saya', icon: Users },
    { id: 'materials', label: 'Materi Pembelajaran', icon: BookOpen },
    { id: 'exams', label: 'Ujian & Latihan', icon: ClipboardList },
    { id: 'results', label: 'Nilai & Riwayat', icon: Award }
  ];

  const menuItems = isTeacher ? teacherMenuItems : studentMenuItems;

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-slate-900/60 backdrop-blur-md p-4 hidden md:block min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        Menu {isTeacher ? 'Guru' : 'Siswa'}
      </div>
      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="flex items-center space-x-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400 ring-1 ring-red-500/30 live-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                  <span>{item.badge}</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl glass-panel-accent p-4 text-xs">
        <div className="flex items-center space-x-2 font-semibold text-blue-300">
          <span>{isTeacher ? '🏫 Panel Pengawas Guru' : '🎓 Panel Pembelajaran Siswa'}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-300">
          {isTeacher
            ? 'Pantau aktivitas siswa secara realtime dan kirim peringatan langsung.'
            : 'Kerjakan ujian dengan jujur. Peringatan guru akan muncul secara realtime.'}
        </p>
      </div>
    </aside>
  );
};
