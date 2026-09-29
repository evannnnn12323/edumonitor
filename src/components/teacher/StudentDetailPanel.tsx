import React from 'react';
import { ExamAttempt, MonitorEvent, TeacherMessage } from '../../types';
import { calculateStudentRisk } from '../../lib/riskCalculator';
import { X, AlertTriangle, ShieldAlert, CheckCheck, Clock, Eye, Copy, Monitor, Send, MessageSquare } from 'lucide-react';

interface StudentDetailPanelProps {
  attempt: ExamAttempt;
  events: MonitorEvent[];
  messages: TeacherMessage[];
  onClose: () => void;
  onOpenWarningModal: (studentId: string, studentName: string) => void;
}

export const StudentDetailPanel: React.FC<StudentDetailPanelProps> = ({
  attempt,
  events,
  messages,
  onClose,
  onOpenWarningModal
}) => {
  const risk = calculateStudentRisk(events);
  const studentEvents = events.filter(e => e.studentId === attempt.studentId);
  const studentMessages = messages.filter(m => m.studentId === attempt.studentId || m.studentId === 'ALL');

  const getRiskBadge = () => {
    switch (risk.level) {
      case 'HIGH':
        return <span className="rounded-md bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300 ring-1 ring-red-500/40">Perlu Diperiksa (High Risk)</span>;
      case 'MEDIUM':
        return <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40">Perlu Diperhatikan (Medium)</span>;
      default:
        return <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">Normal (Low Risk)</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/95 border-l border-white/10 shadow-2xl backdrop-blur-xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">{attempt.studentName}</h2>
            {getRiskBadge()}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Detail Pengawasan Live Ujian & Timeline Aktivitas</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-900/80 border border-white/10 p-3">
          <div className="flex items-center space-x-1 text-[10px] text-slate-400">
            <Eye className="h-3 w-3 text-amber-400" />
            <span>Pindah Tab</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white">{risk.tabSwitchCount} <span className="text-xs text-slate-400 font-normal">kali</span></div>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-white/10 p-3">
          <div className="flex items-center space-x-1 text-[10px] text-slate-400">
            <Copy className="h-3 w-3 text-purple-400" />
            <span>Paste Teks</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white">{risk.pasteCount} <span className="text-xs text-slate-400 font-normal">kali</span></div>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-white/10 p-3">
          <div className="flex items-center space-x-1 text-[10px] text-slate-400">
            <Monitor className="h-3 w-3 text-blue-400" />
            <span>Keluar Fullscreen</span>
          </div>
          <div className="mt-1 text-lg font-bold text-white">{risk.fullscreenExitCount} <span className="text-xs text-slate-400 font-normal">kali</span></div>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-white/10 p-3">
          <div className="flex items-center space-x-1 text-[10px] text-slate-400">
            <ShieldAlert className="h-3 w-3 text-red-400" />
            <span>Risk Score</span>
          </div>
          <div className="mt-1 text-lg font-bold text-red-400">{risk.score} <span className="text-xs text-slate-400 font-normal">pts</span></div>
        </div>
      </div>

      {/* Warning & Action Banner */}
      <div className="mt-6 flex items-center justify-between rounded-xl glass-panel-warning p-4">
        <div>
          <div className="text-xs font-bold text-amber-300">Tindakan Pengawas Guru</div>
          <div className="text-[11px] text-slate-300">Beri peringatan atau komentar khusus langsung ke browser siswa.</div>
        </div>
        <button
          onClick={() => onOpenWarningModal(attempt.studentId, attempt.studentName)}
          className="flex items-center space-x-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition active:scale-95"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Beri Peringatan</span>
        </button>
      </div>

      {/* Message History & Read Receipts */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Riwayat Peringatan Guru ({studentMessages.length})
        </h3>
        {studentMessages.length === 0 ? (
          <div className="rounded-xl bg-slate-900/40 p-4 text-center text-xs text-slate-500 border border-white/5">
            Belum ada peringatan yang dikirim ke siswa ini.
          </div>
        ) : (
          <div className="space-y-2">
            {studentMessages.map((msg) => (
              <div key={msg.id} className="rounded-xl bg-slate-900/80 border border-white/10 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${msg.severity === 'SERIOUS' ? 'text-red-400' : msg.severity === 'PERINGATAN' ? 'text-amber-400' : 'text-blue-400'}`}>
                    [{msg.severity}] {msg.type === 'TEACHER_WARNING' ? 'Peringatan' : 'Komentar'}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px]">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-400">{new Date(msg.sentAt).toLocaleTimeString('id-ID')}</span>
                  </div>
                </div>
                <p className="mt-1 text-slate-200 font-medium font-mono text-[11px]">"{msg.message}"</p>
                <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <CheckCheck className={`h-3.5 w-3.5 ${msg.status === 'READ' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Status:</span>
                    <span className={`font-bold ${msg.status === 'READ' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {msg.status === 'READ' ? `Dibaca (${msg.readAt ? new Date(msg.readAt).toLocaleTimeString('id-ID') : ''})` : msg.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Timeline */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Timeline Aktivitas Siswa ({studentEvents.length})
        </h3>
        {studentEvents.length === 0 ? (
          <div className="rounded-xl bg-slate-900/40 p-4 text-center text-xs text-slate-500 border border-white/5">
            Belum ada log kejadian tercatat.
          </div>
        ) : (
          <div className="relative border-l border-white/10 pl-4 space-y-3 ml-2">
            {studentEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-slate-950"></div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString('id-ID')}
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {evt.eventType === 'TAB_HIDDEN' && '⚠️ Meninggalkan Halaman / Pindah Tab'}
                  {evt.eventType === 'TAB_VISIBLE' && `✅ Kembali ke Ujian (Durasi luar: ${evt.durationAwaySeconds || 0}s)`}
                  {evt.eventType === 'PASTE_DETECTED' && '📋 Copy / Paste Terdeteksi'}
                  {evt.eventType === 'FULLSCREEN_EXIT' && '🖥️ Keluar Fullscreen'}
                  {evt.eventType === 'EXAM_STARTED' && '🚀 Ujian Dimulai'}
                  {evt.eventType === 'EXAM_SUBMITTED' && '🎉 Ujian Dikumpulkan'}
                </div>
                {evt.details && <div className="text-[11px] text-slate-400 mt-0.5">{evt.details}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
