import React from 'react';
import { useMaterials } from '../../context/MaterialContext';
import { useClasses } from '../../context/ClassContext';
import { MathText } from '../../components/common/MathText';
import { BookOpen, Download, FileText, FileSpreadsheet, FileImage, File, Sparkles } from 'lucide-react';

export const StudentMaterialsPage: React.FC = () => {
  const { getJoinedClasses } = useClasses();
  const { getMaterialsForClasses } = useMaterials();

  const joinedClasses = getJoinedClasses();
  const joinedClassIds = joinedClasses.map((c) => c.id);
  const materials = getMaterialsForClasses(joinedClassIds);

  const getFileBadgeStyle = (fileType?: string, fileName?: string) => {
    const str = `${fileType || ''} ${fileName || ''}`.toLowerCase();
    if (str.includes('pdf')) {
      return {
        icon: <FileText className="h-5 w-5 text-red-400 shrink-0" />,
        bg: 'bg-red-500/10 border-red-500/30 text-red-300',
        label: 'PDF'
      };
    }
    if (str.includes('doc') || str.includes('word')) {
      return {
        icon: <FileText className="h-5 w-5 text-blue-400 shrink-0" />,
        bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        label: 'DOC'
      };
    }
    if (str.includes('xls') || str.includes('excel') || str.includes('csv')) {
      return {
        icon: <FileSpreadsheet className="h-5 w-5 text-emerald-400 shrink-0" />,
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        label: 'EXCEL'
      };
    }
    if (str.includes('image') || str.includes('png') || str.includes('jpg') || str.includes('jpeg')) {
      return {
        icon: <FileImage className="h-5 w-5 text-purple-400 shrink-0" />,
        bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        label: 'GAMBAR'
      };
    }
    return {
      icon: <File className="h-5 w-5 text-amber-400 shrink-0" />,
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      label: 'DOKUMEN'
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Header */}
      <div className="rounded-3xl glass-panel-accent p-6 sm:p-8 border border-blue-500/30">
        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 ring-1 ring-blue-500/30 flex items-center space-x-1.5">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span>MODUL & MATERI PEMBELAJARAN</span>
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-white tracking-tight">Materi Pembelajaran Saya</h1>
        <p className="mt-1 text-xs text-slate-300">
          Akses rangkuman rumus, modul PDF, dokumen Word/Excel, dan materi pendukung dari kelas yang Anda ikuti.
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-3 shadow-xl">
          <div className="h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-white">Belum Ada Materi Tersedia</h3>
          <p className="text-xs text-slate-400">Belum ada materi pembelajaran yang diunggah di kelas Anda.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {materials.map((m) => {
            const badgeStyle = getFileBadgeStyle(m.fileType, m.fileName);
            return (
              <div key={m.id} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl hover:border-blue-500/30 transition">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                      {m.className}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • Diunggah: {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white tracking-tight">{m.title}</h3>
                </div>

                {/* Text / Math Content */}
                <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/10 text-xs text-slate-200 leading-relaxed font-mono">
                  <MathText text={m.content} />
                </div>

                {/* Attachment File Box */}
                {m.fileUrl && (
                  <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${badgeStyle.bg}`}>
                    <div className="flex items-center space-x-3.5 overflow-hidden">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 shadow-md">
                        {badgeStyle.icon}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white truncate">{m.fileName || 'Dokumen Lampiran'}</span>
                          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                            {badgeStyle.label}
                          </span>
                        </div>
                        <div className="text-[10px] opacity-75 mt-0.5">{m.fileSize || 'Ukuran File'} • Klik untuk menyimpan file</div>
                      </div>
                    </div>

                    <a
                      href={m.fileUrl}
                      download={m.fileName || 'materi_pembelajaran'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition active:scale-95 shrink-0 self-end sm:self-auto"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Unduh File</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
