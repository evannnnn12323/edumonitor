import React from 'react';
import { useMaterials } from '../../context/MaterialContext';
import { useClasses } from '../../context/ClassContext';
import { MathText } from '../../components/common/MathText';
import { BookOpen, Download, FileText, FileSpreadsheet, FileImage, File, CheckCircle2 } from 'lucide-react';

export const StudentMaterialsPage: React.FC = () => {
  const { getJoinedClasses } = useClasses();
  const { getMaterialsForClasses } = useMaterials();

  const joinedClasses = getJoinedClasses();
  const joinedClassIds = joinedClasses.map((c) => c.id);
  const materials = getMaterialsForClasses(joinedClassIds);

  const getFileIcon = (fileType?: string, fileName?: string) => {
    const str = `${fileType || ''} ${fileName || ''}`.toLowerCase();
    if (str.includes('pdf')) return <FileText className="h-4 w-4 text-red-400 shrink-0" />;
    if (str.includes('doc') || str.includes('word')) return <FileText className="h-4 w-4 text-blue-400 shrink-0" />;
    if (str.includes('xls') || str.includes('excel') || str.includes('csv')) return <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />;
    if (str.includes('image') || str.includes('png') || str.includes('jpg') || str.includes('jpeg')) return <FileImage className="h-4 w-4 text-purple-400 shrink-0" />;
    return <File className="h-4 w-4 text-amber-400 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold text-white">Materi & Modul Pembelajaran Saya ({materials.length})</h1>
        <p className="text-xs text-slate-400">Akses modul, rangkuman, dan dokumen lampiran dari kelas yang Anda ikuti.</p>
      </div>

      {materials.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-3">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">Belum ada materi pembelajaran yang tersedia di kelas Anda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map((m) => (
            <div key={m.id} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
              <div>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-300 ring-1 ring-blue-500/30">
                  {m.className}
                </span>
                <h3 className="mt-2 text-base font-bold text-white">{m.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Diunggah: {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Text / Math Content */}
              <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                <MathText text={m.content} />
              </div>

              {/* Attachment File Download Box */}
              {m.fileUrl && (
                <div className="rounded-2xl bg-slate-900/80 p-3.5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      {getFileIcon(m.fileType, m.fileName)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{m.fileName || 'Lampiran Dokumen'}</div>
                      <div className="text-[10px] text-slate-400">{m.fileSize || 'Dokumen'} • {m.fileType?.toUpperCase()}</div>
                    </div>
                  </div>

                  <a
                    href={m.fileUrl}
                    download={m.fileName || 'materi_pembelajaran'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh File</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
