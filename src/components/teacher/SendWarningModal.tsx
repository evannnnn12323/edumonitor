import React, { useState } from 'react';
import { SeverityLevel, MessageType } from '../../types';
import { AlertTriangle, Send, X, Sparkles, MessageSquare, ShieldAlert, Info } from 'lucide-react';

interface SendWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  onSend: (message: string, severity: SeverityLevel, type: MessageType) => void;
  initialMessage?: string;
}

export const QUICK_TEMPLATES = [
  "Mohon tetap berada di halaman ujian.",
  "Anda terdeteksi meninggalkan halaman ujian.",
  "Harap tidak membuka aplikasi atau halaman lain selama ujian.",
  "Aktivitas Anda sedang dipantau.",
  "Harap kembali fokus mengerjakan ujian.",
  "Aktivitas copy/paste terdeteksi. Harap mengerjakan secara mandiri."
];

export const SendWarningModal: React.FC<SendWarningModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onSend,
  initialMessage = ''
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [severity, setSeverity] = useState<SeverityLevel>('PERINGATAN');
  const [messageType, setMessageType] = useState<MessageType>('TEACHER_WARNING');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message, severity, messageType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Beri Peringatan / Komentar</h3>
              <p className="text-xs text-slate-400">Penerima: <span className="font-semibold text-blue-400">{studentName}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Type Selector */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMessageType('TEACHER_WARNING')}
            className={`flex items-center justify-center space-x-2 rounded-xl p-2.5 text-xs font-semibold border transition ${
              messageType === 'TEACHER_WARNING'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/50 border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Peringatan (Pelanggaran)</span>
          </button>
          <button
            type="button"
            onClick={() => setMessageType('TEACHER_COMMENT')}
            className={`flex items-center justify-center space-x-2 rounded-xl p-2.5 text-xs font-semibold border transition ${
              messageType === 'TEACHER_COMMENT'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-slate-900/50 border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Komentar Bimbingan</span>
          </button>
        </div>

        {/* Severity Selector */}
        {messageType === 'TEACHER_WARNING' && (
          <div className="mt-3">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Tingkat Kepekaan / Severity:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('INFO')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-1.5 text-xs font-medium border transition ${
                  severity === 'INFO' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                <Info className="h-3 w-3" />
                <span>INFO</span>
              </button>
              <button
                type="button"
                onClick={() => setSeverity('PERINGATAN')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-1.5 text-xs font-medium border transition ${
                  severity === 'PERINGATAN' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                <span>PERINGATAN</span>
              </button>
              <button
                type="button"
                onClick={() => setSeverity('SERIOUS')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-1.5 text-xs font-medium border transition ${
                  severity === 'SERIOUS' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                <ShieldAlert className="h-3 w-3" />
                <span>SERIUS</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Template Picker */}
        <div className="mt-4">
          <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Pesan Cepat (Template):</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(tmpl)}
                className="w-full text-left rounded-lg bg-slate-900/60 border border-white/5 p-2 text-xs text-slate-300 hover:bg-blue-600/20 hover:border-blue-500/30 hover:text-blue-200 transition truncate"
              >
                "{tmpl}"
              </button>
            ))}
          </div>
        </div>

        {/* Custom Message Input */}
        <div className="mt-4">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Isi Pesan / Komentar Khusus:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan khusus untuk siswa di sini..."
            rows={3}
            className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-orange-500 transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Kirim Peringatan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
