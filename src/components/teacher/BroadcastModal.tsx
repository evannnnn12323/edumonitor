import React, { useState } from 'react';
import { Megaphone, X, Send } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (message: string) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, onBroadcast }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    onBroadcast(message);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Broadcast Pesan Ke Seluruh Siswa</h3>
              <p className="text-xs text-slate-400">Pesan pengumuman akan muncul pada layar seluruh peserta ujian.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Isi Pengumuman / Broadcast:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Contoh: Ujian tersisa 15 menit. Pastikan semua jawaban sudah tersimpan..."
            rows={4}
            className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="mt-5 flex justify-end space-x-3">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/10">
            Batal
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex items-center space-x-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Kirim ke Semua Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
