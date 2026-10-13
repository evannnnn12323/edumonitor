import React, { useState, useEffect, useRef } from 'react';
import { ExamSettings, Question } from '../../types';
import { useClasses } from '../../context/ClassContext';
import { extractTextFromFile, parseQuestionsFromText } from '../../lib/questionParser';
import {
  ClipboardList, ShieldAlert, Save, Info, Upload, FileText, CheckCircle,
  AlertCircle, Sparkles, X, ChevronDown, ChevronUp, FileQuestion, Trash2
} from 'lucide-react';
import { MathText } from '../../components/common/MathText';

interface ExamCreatePageProps {
  onSuccess: () => void;
}

const CHOICE_LABELS = 'ABCDE';

export const ExamCreatePage: React.FC<ExamCreatePageProps> = ({ onSuccess }) => {
  const { classes } = useClasses();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');

  // Auto-select first class whenever the classes list changes
  useEffect(() => {
    if (classes.length > 0 && !classId) {
      setClassId(classes[0].id);
    }
  }, [classes]);

  const [duration, setDuration] = useState(45);
  const [kkm, setKkm] = useState(75);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // File Upload Question Source State
  const [questionSource, setQuestionSource] = useState<'FILE' | 'BANK'>('FILE');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedQuestions, setUploadedQuestions] = useState<Partial<Question>[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const selectedClass = classes.find((c) => c.id === classId);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadStatus('parsing');
    setUploadError('');

    try {
      const rawText = await extractTextFromFile(file);

      if (!rawText || rawText.trim().length < 10) {
        setUploadError('File tidak dapat dibaca sebagai teks. Pastikan file berisi teks (bukan scan gambar).');
        setUploadStatus('error');
        return;
      }

      const result = parseQuestionsFromText(
        rawText,
        selectedClass?.subject || 'Umum',
        title.trim() || file.name.replace(/\.[^/.]+$/, '')
      );

      if (result.questions.length === 0) {
        setUploadError('Tidak ada soal yang terdeteksi. Coba gunakan format bernomor: "1. Pertanyaan..." lalu "A. Pilihan".');
        setUploadStatus('error');
        return;
      }

      setUploadedQuestions(result.questions as any);
      setTotalQuestions(result.questions.length);
      setUploadStatus('success');

      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(`Ujian ${cleanName}`);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses file soal.');
      setUploadStatus('error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !title.trim()) return;

    // If questions uploaded from file, save them to the question bank
    if (uploadedQuestions.length > 0) {
      const savedBankStr = localStorage.getItem('edumonitor_question_bank');
      let existingQuestions: Question[] = [];
      try {
        if (savedBankStr) existingQuestions = JSON.parse(savedBankStr);
      } catch {}

      const newQuestions: Question[] = uploadedQuestions.map((q, i) => ({
        id: `q_exam_${Date.now()}_${i}`,
        bankId: `bank_${Date.now()}`,
        subject: selectedClass?.subject || 'Umum',
        grade: selectedClass?.grade || '',
        material: title.trim(),
        type: (q.type as any) || 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        questionText: q.questionText || '',
        choices: q.choices as any,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        score: q.score || 5
      }));

      const updatedBank = [...newQuestions, ...existingQuestions];
      localStorage.setItem('edumonitor_question_bank', JSON.stringify(updatedBank));
    }

    // Persist exam to localStorage
    const exam = {
      id: `exam_${Date.now()}`,
      title: title.trim(),
      classId,
      className: selectedClass?.name || '',
      teacherId: selectedClass?.teacherId || 'user_teacher_1',
      startDate,
      endDate,
      startTime: '',
      endTime: '',
      durationMinutes: duration,
      totalQuestions: uploadedQuestions.length > 0 ? uploadedQuestions.length : totalQuestions,
      kkm,
      settings,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const saved = localStorage.getItem('edumonitor_exams');
    let exams: any[] = [];
    try {
      exams = saved ? JSON.parse(saved) : [];
    } catch {}
    exams.unshift(exam);
    localStorage.setItem('edumonitor_exams', JSON.stringify(exams));

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Buat Ujian / Latihan Baru</h1>
          <p className="text-xs text-slate-400">Upload file soal langsung atau gunakan Bank Soal yang ada.</p>
        </div>
      </div>

      {/* Sumber Soal & File Upload Section */}
      <div className="glass-panel-accent rounded-3xl p-6 border border-emerald-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Upload className="h-4 w-4 text-emerald-400" />
            <span>Sumber Soal Ujian (Upload File atau Bank Soal)</span>
          </h3>
          <div className="flex bg-slate-900 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setQuestionSource('FILE')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                questionSource === 'FILE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setQuestionSource('BANK')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                questionSource === 'BANK'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bank Soal
            </button>
          </div>
        </div>

        {questionSource === 'FILE' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Unggah file dokumen soal (<strong className="text-emerald-400">.txt, .pdf, .doc, .docx</strong>). Sistem akan menguraikan soal dan opsi jawaban secara otomatis.
            </p>

            <div className="flex items-center space-x-3">
              <label
                htmlFor="exam-file-input"
                className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer active:scale-95"
              >
                <Upload className="h-4 w-4" />
                <span>Pilih & Upload File Soal Ujian</span>
              </label>
              <input
                ref={fileInputRef}
                id="exam-file-input"
                type="file"
                accept=".txt,.csv,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFileName && (
                <span className="text-xs text-emerald-300 font-semibold truncate max-w-xs">
                  📄 {uploadedFileName}
                </span>
              )}
            </div>

            {uploadStatus === 'parsing' && (
              <div className="rounded-xl p-3 bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                <span>Membaca file <strong>{uploadedFileName}</strong> dan menguraikan soal...</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadStatus === 'success' && uploadedQuestions.length > 0 && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Berhasil! <strong className="text-emerald-400">{uploadedQuestions.length} soal</strong> berhasil diurai dari file.
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setPreviewExpanded(!previewExpanded)}
                      className="text-xs text-emerald-300 hover:underline flex items-center space-x-1"
                    >
                      <span>{previewExpanded ? 'Sembunyikan' : 'Lihat Pratinjau'}</span>
                      {previewExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Hapus seluruh soal yang diunggah dari formulir ini?')) {
                          setUploadedQuestions([]);
                          setUploadedFileName('');
                          setUploadStatus('idle');
                          setTotalQuestions(20);
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Hapus Soal Ini</span>
                    </button>
                  </div>
                </div>

                {previewExpanded && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {uploadedQuestions.map((q, idx) => (
                      <div key={idx} className="rounded-xl bg-slate-900/80 p-3 border border-white/10 text-xs space-y-1">
                        <div className="font-bold text-emerald-300 flex items-start space-x-1">
                          <span>Soal #{idx + 1}:</span>
                          <span className="flex-1"><MathText text={q.questionText || ''} /></span>
                        </div>
                        {q.choices && (q.choices as any[]).map((c: any, ci: number) => (
                          <div key={ci} className={`text-[11px] flex items-center space-x-1.5 ${c.isCorrect ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                            <span>{CHOICE_LABELS[ci]}.</span>
                            <span className="flex-1"><MathText text={c.text} /></span>
                            {c.isCorrect && <span>✓ (Kunci)</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {questionSource === 'BANK' && (
          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white flex items-center space-x-2">
              <FileQuestion className="h-4 w-4 text-blue-400" />
              <span>Menggunakan Soal dari Bank Soal</span>
            </p>
            <p className="text-slate-400">
              Soal akan diambil secara otomatis dari Bank Soal yang telah Anda simpan sebelumnya.
            </p>
          </div>
        )}
      </div>

      {/* Informasi Dasar */}
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
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Target Kelas:</label>
            {classes.length === 0 ? (
              <div className="flex items-center space-x-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
                <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-300">Belum ada kelas. Tambahkan kelas terlebih dahulu di menu "Kelas Saya".</span>
              </div>
            ) : (
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500 focus:outline-none transition"
              >
                <option value="" disabled>— Pilih Kelas —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.subject} · Kelas {c.grade})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedClass && (
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-300 flex items-center space-x-2">
            <Info className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Kode kelas: <strong>{selectedClass.code}</strong> · Pengajar: {selectedClass.teacherName} · {selectedClass.studentCount || 0} siswa</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tanggal Mulai:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tanggal Berakhir:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Durasi (Menit):</label>
            <input
              type="number"
              value={duration}
              min={1}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Batas KKM:</label>
            <input
              type="number"
              value={kkm}
              min={0}
              max={100}
              onChange={(e) => setKkm(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Jumlah Soal:</label>
            <input
              type="number"
              value={totalQuestions}
              min={1}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
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
          {[
            { label: 'Acak Urutan Soal', key: 'randomizeQuestions' as keyof ExamSettings },
            { label: 'Acak Pilihan Jawaban', key: 'randomizeChoices' as keyof ExamSettings },
            { label: 'Tampilkan Nilai Langsung', key: 'showScoreImmediately' as keyof ExamSettings },
            { label: 'Tampilkan Pembahasan', key: 'showDiscussion' as keyof ExamSettings },
            { label: 'Monitoring Tab Switch', key: 'monitorTabSwitch' as keyof ExamSettings },
            { label: 'Monitoring Copy / Paste', key: 'monitorPaste' as keyof ExamSettings },
            { label: 'Monitoring Mode Fullscreen', key: 'monitorFullscreen' as keyof ExamSettings },
            { label: 'Izinkan Peringatan Realtime', key: 'allowRealtimeWarnings' as keyof ExamSettings },
          ].map(({ label, key }) => (
            <label key={key} className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-white/10 cursor-pointer hover:border-amber-500/30 transition">
              <span className="text-slate-300">{label}</span>
              <input
                type="checkbox"
                checked={!!settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded accent-blue-500"
              />
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Mode Paste:</label>
          <select
            value={settings.pasteMode}
            onChange={(e) => setSettings({ ...settings, pasteMode: e.target.value as any })}
            className="w-full sm:w-auto rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
          >
            <option value="ALLOW">Izinkan (Allow)</option>
            <option value="MONITOR_ONLY">Monitor Saja</option>
            <option value="BLOCK">Blokir (Block)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={classes.length === 0}
          className="flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Save className="h-4 w-4" />
          <span>Simpan & Aktifkan Ujian</span>
        </button>
      </div>
    </form>
  );
};
