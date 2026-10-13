import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionType, DifficultyLevel } from '../../types';
import { useClasses } from '../../context/ClassContext';
import {
  extractTextFromFile,
  parseQuestionsFromText
} from '../../lib/questionParser';
import {
  FileQuestion, Plus, Upload, Trash2, Edit3, Search, CheckCircle,
  AlertCircle, Sparkles, X, Check, FileText, ArrowRight, CornerDownRight,
  CheckSquare, Square, AlertTriangle
} from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const { classes } = useClasses();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  // Multi-select bulk delete state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Upload & Parser Modal State
  const [uploadMode, setUploadMode] = useState<'FILE' | 'PASTE'>('FILE');
  const [pastedText, setPastedText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Partial<Question>[]>([]);
  const [uploadSubject, setUploadSubject] = useState('Umum');
  const [uploadMaterial, setUploadMaterial] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Single Manual Add/Edit
  const [formSubject, setFormSubject] = useState('Umum');
  const [formGrade, setFormGrade] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formType, setFormType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formScore, setFormScore] = useState(5);
  const [formExplanation, setFormExplanation] = useState('');
  const [formChoices, setFormChoices] = useState([
    { id: 'a', text: '', isCorrect: true },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false }
  ]);

  // Load questions on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('edumonitor_question_bank');
      if (stored) {
        setQuestions(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Save questions helper
  const saveQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    localStorage.setItem('edumonitor_question_bank', JSON.stringify(newQuestions));
  };

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.material && q.material.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
    const matchesDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesDiff;
  });

  const subjects = Array.from(new Set(['Umum', ...classes.map((c) => c.subject), ...questions.map((q) => q.subject)]));

  // Handle Manual Form Submit
  const handleSaveManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionText.trim()) return;

    const newQ: Question = {
      id: editingQuestion ? editingQuestion.id : `q_${Date.now()}`,
      bankId: 'bank_default',
      subject: formSubject,
      grade: formGrade,
      material: formMaterial,
      type: formType,
      difficulty: formDifficulty,
      questionText: formQuestionText.trim(),
      score: formScore,
      explanation: formExplanation.trim() || undefined,
      choices: formType === 'MULTIPLE_CHOICE' ? formChoices : undefined,
      correctAnswer: formType === 'MULTIPLE_CHOICE' ? formChoices.find((c) => c.isCorrect)?.id : undefined
    };

    if (editingQuestion) {
      const updated = questions.map((q) => (q.id === editingQuestion.id ? newQ : q));
      saveQuestions(updated);
    } else {
      saveQuestions([newQ, ...questions]);
    }

    setIsAddModalOpen(false);
    setEditingQuestion(null);
    resetForm();
  };

  const resetForm = () => {
    setFormSubject('Umum');
    setFormGrade('');
    setFormMaterial('');
    setFormType('MULTIPLE_CHOICE');
    setFormDifficulty('MEDIUM');
    setFormQuestionText('');
    setFormScore(5);
    setFormExplanation('');
    setFormChoices([
      { id: 'a', text: '', isCorrect: true },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false }
    ]);
  };

  const handleEditClick = (q: Question) => {
    setEditingQuestion(q);
    setFormSubject(q.subject || 'Umum');
    setFormGrade(q.grade || '');
    setFormMaterial(q.material || '');
    setFormType(q.type || 'MULTIPLE_CHOICE');
    setFormDifficulty(q.difficulty || 'MEDIUM');
    setFormQuestionText(q.questionText || '');
    setFormScore(q.score || 5);
    setFormExplanation(q.explanation || '');
    if (q.choices && q.choices.length > 0) {
      setFormChoices(q.choices.map((c) => ({ ...c, isCorrect: !!c.isCorrect })));
    }
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus soal ini dari Bank Soal?')) {
      const updated = questions.filter((q) => q.id !== id);
      saveQuestions(updated);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Hapus ${selectedIds.length} butir soal yang dipilih sekaligus?`)) {
      const updated = questions.filter((q) => !selectedIds.includes(q.id));
      saveQuestions(updated);
      setSelectedIds([]);
    }
  };

  const handleDeleteAll = () => {
    if (questions.length === 0) return;
    saveQuestions([]);
    setSelectedIds([]);
    setShowClearConfirmModal(false);
  };

  // Handle File Upload & Extract
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadStatus('parsing');
    setUploadError('');

    try {
      const rawText = await extractTextFromFile(file);
      if (!rawText || rawText.trim().length < 10) {
        setUploadError('Berkas kosong atau teks tidak dapat diekstrak.');
        setUploadStatus('error');
        return;
      }

      const result = parseQuestionsFromText(rawText, uploadSubject, uploadMaterial || file.name.replace(/\.[^/.]+$/, ''));
      if (result.questions.length === 0) {
        setUploadError('Tidak ada butir soal yang terdeteksi. Silakan gunakan tab "Ketik / Tempel Teks" untuk memasukkan teks langsung.');
        setUploadStatus('error');
        return;
      }

      setParsedPreview(result.questions);
      setUploadStatus('success');
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses berkas.');
      setUploadStatus('error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Paste Parse
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setUploadStatus('parsing');
    setUploadError('');

    try {
      const result = parseQuestionsFromText(pastedText, uploadSubject, uploadMaterial || 'Teks Tempel');
      if (result.questions.length === 0) {
        setUploadError('Tidak ada butir soal yang terdeteksi dalam teks.');
        setUploadStatus('error');
        return;
      }
      setParsedPreview(result.questions);
      setUploadStatus('success');
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengurai teks.');
      setUploadStatus('error');
    }
  };

  // Interactive adjustments inside preview modal
  const handleSetCorrectChoice = (qIndex: number, choiceId: string) => {
    setParsedPreview((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      if (q.choices) {
        q.choices = q.choices.map((c) => ({
          ...c,
          isCorrect: c.id === choiceId
        }));
        q.correctAnswer = choiceId;
      }
      next[qIndex] = q;
      return next;
    });
  };

  const handleUpdateQuestionText = (qIndex: number, text: string) => {
    setParsedPreview((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], questionText: text };
      return next;
    });
  };

  const handleDeletePreviewItem = (qIndex: number) => {
    setParsedPreview((prev) => prev.filter((_, i) => i !== qIndex));
  };

  // Save Uploaded / Parsed Questions
  const handleSaveImportedQuestions = () => {
    if (parsedPreview.length === 0) return;
    const finalQuestions: Question[] = parsedPreview.map((q, idx) => ({
      id: q.id || `q_import_${Date.now()}_${idx}`,
      bankId: 'bank_default',
      subject: uploadSubject || 'Umum',
      grade: q.grade || '',
      material: uploadMaterial || q.material || 'Import Soal',
      type: q.type || 'MULTIPLE_CHOICE',
      difficulty: q.difficulty || 'MEDIUM',
      questionText: q.questionText || '',
      choices: q.choices,
      correctAnswer: q.correctAnswer || (q.choices && q.choices.find((c) => c.isCorrect)?.id),
      explanation: q.explanation,
      score: q.score || 5
    }));

    saveQuestions([...finalQuestions, ...questions]);
    setIsUploadModalOpen(false);
    setParsedPreview([]);
    setPastedText('');
    setUploadStatus('idle');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileQuestion className="h-6 w-6 text-blue-400" />
            <span>Bank Soal & Materi Ujian</span>
          </h1>
          <p className="text-xs text-slate-400">
            Unggah dokumen Word (.docx), file teks, atau tempel soal langsung. Sistem otomatis memisahkan nomor, pilihan, dan kunci jawaban.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setUploadStatus('idle');
              setUploadError('');
              setParsedPreview([]);
              setIsUploadModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition"
          >
            <Upload className="h-4 w-4" />
            <span>Upload File (.docx / teks)</span>
          </button>
          <button
            onClick={() => {
              setEditingQuestion(null);
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Buat Soal Manual</span>
          </button>
        </div>
      </div>

      {/* Stats and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Total Soal Tersimpan</p>
            <h3 className="text-2xl font-bold text-white mt-1">{questions.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileQuestion className="h-5 w-5" />
          </div>
        </div>

        <div className="md:col-span-3 glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan, mata pelajaran, atau topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Mapel</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="EASY">Mudah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HARD">Sulit</option>
          </select>
        </div>
      </div>

      {/* Bulk Action & Delete Bar */}
      {questions.length > 0 && (
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10"
            >
              {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                <CheckSquare className="h-4 w-4 text-blue-400" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0
                  ? 'Batal Pilih Semua'
                  : `Pilih Semua (${filteredQuestions.length})`}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/30">
                {selectedIds.length} Soal Dipilih
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition animate-pulse"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus {selectedIds.length} Soal Terpilih</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold transition"
              title="Hapus seluruh soal yang tersimpan di Bank Soal"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Hapus Semua Soal ({questions.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <FileQuestion className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Bank Soal Masih Kosong</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Anda belum menambahkan soal. Anda dapat mengunggah file Word (.docx), file teks biasa, atau mengetikkan butir soal secara bebas.
            </p>
          </div>
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition"
            >
              Upload Soal dari File / Teks
            </button>
            <button
              onClick={() => {
                setEditingQuestion(null);
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              + Tambah Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className={`glass-panel p-5 rounded-2xl border transition space-y-3 ${
                selectedIds.includes(q.id)
                  ? 'border-blue-500/60 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  {/* Select Checkbox Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleSelect(q.id)}
                    className={`flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-lg transition border ${
                      selectedIds.includes(q.id)
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/40'
                        : 'bg-slate-900 border-white/20 text-slate-400 hover:border-blue-400'
                    }`}
                    title={selectedIds.includes(q.id) ? 'Batal pilih soal ini' : 'Pilih soal ini'}
                  >
                    {selectedIds.includes(q.id) ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                    )}
                  </button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-300">
                        {q.subject}
                      </span>
                      {q.material && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-300">
                          {q.material}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                        {q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Esai / Isian'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          q.difficulty === 'EASY'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : q.difficulty === 'HARD'
                            ? 'bg-rose-500/10 text-rose-300'
                            : 'bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400">Skor: {q.score}</span>
                    </div>

                    <p className="text-sm font-medium text-white whitespace-pre-line leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => handleEditClick(q)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Edit Soal"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Hapus Soal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Choices Rendering if Multiple Choice */}
              {q.choices && q.choices.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9 pt-1">
                  {q.choices.map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center space-x-2 p-2 rounded-xl text-xs border ${
                        c.isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-900/60 border-white/5 text-slate-300'
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-md flex items-center justify-center font-bold uppercase text-[10px] ${
                          c.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.id}
                      </span>
                      <span className="flex-1">{c.text}</span>
                      {c.isCorrect && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {q.explanation && (
                <div className="ml-9 p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-400">
                  <span className="font-bold text-slate-300">Pembahasan: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Upload File / Text Parser with Live Question Review */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 border border-white/10 bg-slate-950 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 text-purple-300 flex items-center justify-center border border-purple-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Soal Cerdas & Fleksibel</h3>
                  <p className="text-[11px] text-slate-400">
                    Otomatis mengenali soal Word (.docx), teks biasa, pilihan ganda A-E, bintang kunci (*A), atau tabel kunci di akhir.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Subject & Material Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    placeholder="Contoh: Matematika, Fisika, Biologi"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Topik / Materi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={uploadMaterial}
                    onChange={(e) => setUploadMaterial(e.target.value)}
                    placeholder="Contoh: Bab 1 Termodinamika"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Tab switch File vs Paste */}
              <div className="flex border border-white/10 rounded-xl p-1 bg-slate-900/90">
                <button
                  type="button"
                  onClick={() => setUploadMode('FILE')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    uploadMode === 'FILE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload Dokumen (.docx / txt / csv)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('PASTE')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    uploadMode === 'PASTE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tempel / Ketik Teks Soal
                </button>
              </div>

              {uploadMode === 'FILE' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 text-center cursor-pointer transition bg-purple-500/5 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc,.txt,.csv,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-white">
                    {uploadedFileName ? `Berkas terpilih: ${uploadedFileName}` : 'Klik untuk memilih berkas soal'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mendukung Word (.docx), Dokumen Teks (.txt), CSV, dan PDF
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    placeholder={`Tempelkan soal Anda dari Word/Notepad di sini dengan gaya bebas:

1. Berapakah 15 x 10?
A. 100
*B. 150
C. 200
D. 250

2. Kota manakah yang menjadi ibu kota Indonesia?
a. Surabaya
b. Bandung
c. Jakarta
d. Medan
Kunci: C`}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    disabled={!pastedText.trim()}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Ekstrak & Analisis Butir Soal</span>
                  </button>
                </div>
              )}

              {/* Status Messages */}
              {uploadStatus === 'error' && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Parsed Live Review Section */}
              {uploadStatus === 'success' && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>
                        Berhasil membaca <strong>{parsedPreview.length} butir soal</strong>! Anda dapat memeriksa atau mengubah kunci jawaban di bawah sebelum disimpan:
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setParsedPreview([]);
                        setUploadStatus('idle');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] border border-rose-500/30 transition flex items-center space-x-1 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Bersihkan Semua</span>
                    </button>
                  </div>

                  {/* List of Detected Questions with live editing */}
                  <div className="max-h-72 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-900/90 border border-white/10">
                    {parsedPreview.map((item, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-3.5 rounded-xl bg-slate-800/80 border border-white/5 space-y-2.5 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center justify-center h-5 w-5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                              {qIdx + 1}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                              {item.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Isian Singkat'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeletePreviewItem(qIdx)}
                            className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition"
                            title="Hapus soal ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Editable Question Text */}
                        <textarea
                          rows={2}
                          value={item.questionText || ''}
                          onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                          className="w-full p-2 bg-slate-900/90 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                        />

                        {/* Editable Choice Radio List */}
                        {item.choices && item.choices.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] text-slate-400 font-semibold">
                              Pilihan Jawaban (Klik bulatan untuk ubah Kunci Jawaban):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {item.choices.map((c) => (
                                <label
                                  key={c.id}
                                  onClick={() => handleSetCorrectChoice(qIdx, c.id)}
                                  className={`flex items-center space-x-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                                    c.isCorrect
                                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-medium'
                                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`choice_${qIdx}`}
                                    checked={!!c.isCorrect}
                                    onChange={() => handleSetCorrectChoice(qIdx, c.id)}
                                    className="accent-emerald-500"
                                  />
                                  <span className="uppercase font-bold text-[10px] w-4">{c.id}.</span>
                                  <span className="flex-1 truncate">{c.text}</span>
                                  {c.isCorrect && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                      KUNCI
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end items-center space-x-3 pt-3 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:bg-slate-700 transition"
              >
                Batal
              </button>

              {parsedPreview.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveImportedQuestions}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan {parsedPreview.length} Soal ke Bank Soal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Manual Question */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveManualQuestion}
            className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-white/10 bg-slate-950 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingQuestion ? 'Edit Soal' : 'Tambah Soal Manual'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Materi / Topik</label>
                <input
                  type="text"
                  value={formMaterial}
                  onChange={(e) => setFormMaterial(e.target.value)}
                  placeholder="Contoh: Aljabar"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tingkat Kesulitan</label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="EASY">Mudah</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="HARD">Sulit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Teks Pertanyaan</label>
              <textarea
                rows={3}
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                required
                placeholder="Tuliskan butir soal pertanyaan di sini..."
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tipe Soal</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                  <option value="SHORT_ANSWER">Isian Singkat</option>
                  <option value="ESSAY">Esai / Uraian</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Bobot Poin / Skor</label>
                <input
                  type="number"
                  value={formScore}
                  onChange={(e) => setFormScore(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Choices list for Multiple Choice */}
            {formType === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Pilihan Jawaban (Pilih radio untuk jawaban yang benar)
                </label>
                {formChoices.map((choice, idx) => (
                  <div key={choice.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correct_choice"
                      checked={choice.isCorrect}
                      onChange={() => {
                        setFormChoices(
                          formChoices.map((c, i) => ({
                            ...c,
                            isCorrect: i === idx
                          }))
                        );
                      }}
                      className="accent-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase w-4">{choice.id}.</span>
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => {
                        const updated = [...formChoices];
                        updated[idx].text = e.target.value;
                        setFormChoices(updated);
                      }}
                      placeholder={`Teks pilihan ${choice.id.toUpperCase()}`}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pembahasan (Opsional)</label>
              <textarea
                rows={2}
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                placeholder="Penjelasan pembahasan soal..."
                className="w-full p-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-500/30 transition"
              >
                {editingQuestion ? 'Perbarui Soal' : 'Simpan Soal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Konfirmasi Hapus Semua Soal Sekaligus */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-rose-500/30 bg-slate-950 shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Hapus Semua Soal Sekaligus?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tindakan ini akan menghapus seluruh <strong className="text-white">{questions.length} butir soal</strong> yang tersimpan di Bank Soal secara permanen. Anda tidak dapat membatalkan tindakan ini.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
