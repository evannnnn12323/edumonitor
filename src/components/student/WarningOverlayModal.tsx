import React, { useState } from 'react';
import { TeacherMessage } from '../../types';
import { AlertTriangle, Info, ShieldAlert, CheckCircle, MessageSquare } from 'lucide-react';

interface WarningOverlayModalProps {
  message: TeacherMessage;
  onAcknowledge: (messageId: string, explanation?: string) => void;
}

export const WarningOverlayModal: React.FC<WarningOverlayModalProps> = ({
  message,
  onAcknowledge
}) => {
  const [showExplanationInput, setShowExplanationInput] = useState(false);
  const [explanationText, setExplanationText] = useState('');

  const handleConfirm = () => {
    onAcknowledge(message.id, showExplanationInput ? explanationText : undefined);
  };

  const getSeverityStyle = () => {
    switch (message.severity) {
      case 'SERIOUS':
        return {
          bg: 'bg-red-950/90 border-red-500/60 shadow-red-900/50',
          iconBg: 'bg-red-500/20 text-red-400 ring-red-500/30',
          icon: ShieldAlert,
          title: 'PERINGATAN SERIUS DARI GURU',
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
      case 'PERINGATAN':
        return {
          bg: 'bg-amber-950/90 border-amber-500/60 shadow-amber-900/50',
          iconBg: 'bg-amber-500/20 text-amber-400 ring-amber-500/30',
          icon: AlertTriangle,
          title: 'PERINGATAN DARI GURU',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      default:
        return {
          bg: 'bg-blue-950/90 border-blue-500/60 shadow-blue-900/50',
          iconBg: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
          icon: Info,
          title: 'PESAN / KOMENTAR GURU',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
    }
  };

  const style = getSeverityStyle();
  const IconComponent = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-2xl border ${style.bg} p-6 shadow-2xl transition-all`}>
        
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${style.iconBg}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                EduMonitor Live Notification
              </span>
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${style.badgeBg}`}>
                {message.severity}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{style.title}</h3>
          </div>
        </div>

        {/* Message Body */}
        <div className="mt-4 rounded-xl bg-slate-900/70 p-4 border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium text-slate-200">{message.teacherName}</span>
            <span>{new Date(message.sentAt).toLocaleTimeString('id-ID')}</span>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            "{message.message}"
          </p>
        </div>

        {/* Optional Student Response Toggle */}
        {!showExplanationInput ? (
          <button
            onClick={() => setShowExplanationInput(true)}
            className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400 hover:text-blue-400 transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Berikan Penjelasan Singkat (Opsional)</span>
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Penjelasan Singkat kepada Guru:
            </label>
            <textarea
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              placeholder="Contoh: Internet saya sempat terputus sehingga browser berpindah..."
              rows={2}
              className="w-full rounded-lg bg-slate-900 border border-white/15 p-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={handleConfirm}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-95"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Saya Mengerti</span>
          </button>
        </div>
      </div>
    </div>
  );
};
