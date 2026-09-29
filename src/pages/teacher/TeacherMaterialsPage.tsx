import React, { useState } from 'react';
import { useMaterials } from '../../context/MaterialContext';
import { useClasses } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { MathText } from '../../components/common/MathText';
import { BookOpen, Plus, Trash2, Paperclip, Download, FileText, FileSpreadsheet, FileImage, File, X, CheckCircle2, AlertCircle } from 'lucide-react';

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

    // 5MB Limit check for localStorage safety
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

    // Reset Form
    setTitle('');
    setContent('');
    setAttachedFile(null);
    setShowModal(false);
  };

  const getFileIcon = (fileType?: string, fileName?: string) => {
    const str = `${fileType || ''} ${fileName || ''}`.toLowerCase();
    if (str.includes('pdf')) return <FileText className="h-4 w-4 text-red-400 shrink-0" />;
    if (str.includes('doc') || str.includes('word')) return <FileText className="h-4 w-4 text-blue-400 shrink-0" />;
    if (str.includes('xls') || str.includes('excel') || str.includes('csv')) return <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />;
    if (str.includes('image') || str.includes('png') || str.includes('jpg') || str.includes('jpeg')) return <FileImage className="h-4 w-4 text-purple-400 shrink-0" />;
    return <File className="h-4 w-4 text-amber-400 shrink-0" />;
  };

  const filteredMaterials = filterClassId === 'ALL'
    ? materials
    : materials.filter((m) => m.classId === filterClassId);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Kelola Materi Pembelajaran & Dokumen</h1>
          <p className="text-xs text-slate-400">Unggah materi rangkuman, modul PDF, Word, Excel, maupun dokumen pendukung lainnya.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Materi Baru</span>
        </button>
      </div>

      {/* Filter by Class */}
      {classes.length > 0 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter Kelas:</span>
          <button
            onClick={() => setFilterClassId('ALL')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
              filterClassId === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  filterClassId === c.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-3">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">Belum ada materi pembelajaran yang diunggah.</p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-500"
          >
            + Unggah Materi Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMaterials.map((m) => (
            <div key={m.id} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-300 ring-1 ring-blue-500/30">
                    {m.className}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-white">{m.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Diunggah pada: {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm(`Apakah Anda yakin ingin menghapus materi "${m.title}"?`)) {
                      deleteMaterial(m.id);
                    }
                  }}
                  title="Hapus Materi"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Text / Math Content */}
              <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                <MathText text={m.content} />
              </div>

              {/* Attachment File Box if present */}
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

      {/* Add Material Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreateMaterial} className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>Tambah Materi & Upload File Dokumen</span>
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Kelas:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white"
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
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Isi Penjelasan Materi (Mendukung Simbol Matematika / Markdown):
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Tuliskan rangkuman materi di sini... Anda bisa menyisipkan rumus seperti $a^2 + b^2 = c^2$"
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500 font-mono"
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="block text-xs font-semibold text-slate-400">
                Upload File Lampiran (PDF, DOC/DOCX, PPT, XLS, Gambar, DLL):
              </label>

              {uploadError && (
                <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-2.5 text-xs text-red-300 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {!attachedFile ? (
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 p-4 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition">
                  <Paperclip className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-blue-400">Pilih / Drag File Dokumen</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">PDF, DOC, DOCX, PPT, XLS, PNG, JPG, ZIP (Maks 5MB)</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="*/*"
                  />
                </label>
              ) : (
                <div className="rounded-2xl bg-slate-900 p-3 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{attachedFile.fileName}</div>
                      <div className="text-[10px] text-emerald-400">{attachedFile.fileSize} • Siap diunggah</div>
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
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-500">
                Simpan & Unggah Materi
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
