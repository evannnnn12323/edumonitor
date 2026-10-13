import React, { useState } from 'react';
import { useMaterials } from '../../context/MaterialContext';
import { useClasses } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { MathText } from '../../components/common/MathText';
import { BookOpen, Plus, Trash2, Paperclip, Download, FileText, FileSpreadsheet, FileImage, File, X, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';

export const TeacherMaterialsPage: React.FC = () => {
  const { materials, addMaterial, deleteMaterial } = useMaterials();
  const { classes } = useClasses();
  const { currentUser } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'class_mtk_x_a');
  const [filterClassId, setFilterClassId] = useState<string>('ALL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // File Upload State
  const [attachedFile, setAttachedFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: string;
    fileType: string;
  } | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB untuk lampiran!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const sizeInKb = (file.size / 1024).toFixed(1);
      const formattedSize = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeInKb} KB`;

      setAttachedFile({
        fileUrl: resultStr,
        fileName: file.name,
        fileSize: formattedSize,
        fileType: file.type || file.name.split('.').pop() || 'File'
      });
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];
    const targetClassName = targetClass ? targetClass.name : 'Semua Kelas';

    addMaterial({
      classId: targetClass ? targetClass.id : 'class_general',
      className: targetClassName,
      title,
      content,
      fileUrl: attachedFile?.fileUrl,
      fileName: attachedFile?.fileName,
      fileSize: attachedFile?.fileSize,
      fileType: attachedFile?.fileType,
      teacherId: currentUser?.id || 'user_teacher_1'
    });

    setTitle('');
    setContent('');
    setAttachedFile(null);
    setShowModal(false);
  };

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

  const filteredMaterials = filterClassId === 'ALL'
    ? materials
    : materials.filter((m) => m.classId === filterClassId);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="rounded-3xl glass-panel-accent p-6 sm:p-8 border border-blue-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 ring-1 ring-blue-500/30 flex items-center space-x-1.5">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span>BANK MATERI & MODUL DIGITAL</span>
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-white tracking-tight">Materi Pembelajaran</h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl leading-relaxed">
              Unggah modul PDF, Word, Excel, rangkuman rumus, maupun media pembelajaran untuk dapat langsung diakses oleh siswa terdaftar.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Materi Baru</span>
          </button>
        </div>
      </div>

      {/* Filter by Class Pills */}
      {classes.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Kelas:</span>
          </div>
          <button
            onClick={() => setFilterClassId('ALL')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
              filterClassId === 'ALL'
                ? 'bg-blue-600 text-white shadow-blue-500/20 ring-1 ring-blue-400/50'
                : 'bg-slate-900/80 text-slate-400 border border-white/10 hover:text-white hover:bg-slate-800'
            }`}
          >
            Semua Kelas ({materials.length})
          </button>
          {classes.map((c) => {
            const count = materials.filter((m) => m.classId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterClassId(c.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  filterClassId === c.id
                    ? 'bg-blue-600 text-white shadow-blue-500/20 ring-1 ring-blue-400/50'
                    : 'bg-slate-900/80 text-slate-400 border border-white/10 hover:text-white hover:bg-slate-800'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Materials Grid / List */}
      {filteredMaterials.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4 shadow-xl">
          <div className="h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Belum Ada Materi Terunggah</h3>
            <p className="text-xs text-slate-400 mt-1">Unggah rangkuman materi atau dokumen pendukung untuk kelas ini.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
          >
            + Unggah Materi Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredMaterials.map((m) => {
            const badgeStyle = getFileBadgeStyle(m.fileType, m.fileName);
            return (
              <div key={m.id} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl transition-all duration-300 hover:border-blue-500/30">
                
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                        {m.className}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        • {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{m.title}</h3>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus materi "${m.title}"?`)) {
                        deleteMaterial(m.id);
                      }
                    }}
                    title="Hapus Materi"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Content Display */}
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
                        <div className="text-[10px] opacity-75 mt-0.5">{m.fileSize || 'Ukuran File'} • Klik unduh untuk menyimpan</div>
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

      {/* Add Material Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <form onSubmit={handleCreateMaterial} className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-7 border border-white/15 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>Tambah Materi & Upload Dokumen</span>
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Kelas Pembelajaran:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.subject} - Kelas {c.grade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Judul Materi:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Modul & Rangkuman Bab 1 Logaritma"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Isi Penjelasan Materi (Mendukung Simbol Math / Markdown):
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Tuliskan rangkuman materi di sini... Anda bisa menyisipkan rumus seperti $a^2 + b^2 = c^2$"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/15 p-3 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="block text-xs font-semibold text-slate-400">
                Upload File Lampiran (PDF, DOC/DOCX, PPT, XLS, Gambar, DLL):
              </label>

              {uploadError && (
                <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-2.5 text-xs text-red-300 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {!attachedFile ? (
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 p-5 text-center cursor-pointer hover:border-blue-500/60 hover:bg-blue-500/5 transition">
                  <Paperclip className="h-7 w-7 text-blue-400 mb-2" />
                  <span className="text-xs font-bold text-white">Pilih atau Drag File Dokumen</span>
                  <span className="text-[10px] text-slate-400 mt-1">Mendukung PDF, DOC, XLS, PPT, Gambar (Maksimal 5MB)</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="*/*"
                  />
                </label>
              ) : (
                <div className="rounded-2xl bg-slate-900 p-3.5 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{attachedFile.fileName}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">{attachedFile.fileSize} • File Siap Diunggah</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-slate-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-xs text-slate-400">
                Batal
              </button>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition">
                Simpan & Unggah Materi
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
