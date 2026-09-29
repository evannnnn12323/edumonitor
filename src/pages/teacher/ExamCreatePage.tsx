import React, { useState } from 'react';
import { ExamSettings } from '../../types';
import { ClipboardList, ShieldAlert, Settings, Save } from 'lucide-react';

interface ExamCreatePageProps {
  onSuccess: () => void;
}

export const ExamCreatePage: React.FC<ExamCreatePageProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Matematika Kelas X A');
  const [duration, setDuration] = useState(45);
  const [kkm, setKkm] = useState(75);
  const [totalQuestions, setTotalQuestions] = useState(20);

  const [settings, setSettings] = useState<ExamSettings>({
    randomizeQuestions: true,
    randomizeChoices: true,
    showScoreImmediately: true,
    showDiscussion: true,
    allowBackNavigation: true,
    proctoringEnabled: true,
    monitorTabSwitch: true,
    monitorPaste: true,
    monitorFullscreen: true,
    allowRealtimeWarnings: true,
    maxTabSwitchesForAlert: 3,
    pasteMode: 'MONITOR_ONLY'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Buat Ujian / Latihan Baru</h1>
          <p className="text-xs text-slate-400">Atur parameter penilaian, penjadwalan, dan proteksi mode pengawasan realtime.</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ClipboardList className="h-4 w-4 text-blue-400" />
          <span>Informasi Dasar Ujian</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Ujian / Latihan:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Latihan Logaritma & Aljabar Smt 1"
              required
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Target Kelas:</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white"
            >
              <option value="Matematika Kelas X A">Matematika Kelas X A</option>
              <option value="Fisika Kelas XI B">Fisika Kelas XI B</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Durasi (Menit):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Batas KKM:</label>
            <input
              type="number"
              value={kkm}
              onChange={(e) => setKkm(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Jumlah Soal Acak:</label>
            <input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Proctoring Settings */}
      <div className="glass-panel-warning rounded-3xl p-6 border border-amber-500/30 space-y-4">
        <h3 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <span>Pengaturan Proteksi & Live Proctoring Monitoring</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-white/10">
            <span>Monitoring Tab Switch (Deteksi Pindah Tab)</span>
            <input
              type="checkbox"
              checked={settings.monitorTabSwitch}
              onChange={(e) => setSettings({ ...settings, monitorTabSwitch: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-white/10">
            <span>Monitoring Copy / Paste</span>
            <input
              type="checkbox"
              checked={settings.monitorPaste}
              onChange={(e) => setSettings({ ...settings, monitorPaste: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-white/10">
            <span>Monitoring Mode Fullscreen</span>
            <input
              type="checkbox"
              checked={settings.monitorFullscreen}
              onChange={(e) => setSettings({ ...settings, monitorFullscreen: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-white/10">
            <span>Izinkan Peringatan Realtime Guru</span>
            <input
              type="checkbox"
              checked={settings.allowRealtimeWarnings}
              onChange={(e) => setSettings({ ...settings, allowRealtimeWarnings: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          className="flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
        >
          <Save className="h-4 w-4" />
          <span>Simpan & Aktifkan Ujian</span>
        </button>
      </div>
    </form>
  );
};
