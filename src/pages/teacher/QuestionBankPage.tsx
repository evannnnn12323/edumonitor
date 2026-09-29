import React, { useState } from 'react';
import { Question, QuestionType, DifficultyLevel } from '../../types';
import { DEMO_QUESTIONS } from '../../lib/demoData';
import { MathText } from '../../components/common/MathText';
import { Plus, FileQuestion, Sparkles, Check, Trash2, Edit3, Calculator } from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(DEMO_QUESTIONS);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [type, setType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [material, setMaterial] = useState('Logaritma');
  const [questionText, setQuestionText] = useState('');
  const [score, setScore] = useState(5);
  const [choices, setChoices] = useState([
    { id: 'c1', text: '', isCorrect: true },
    { id: 'c2', text: '', isCorrect: false },
    { id: 'c3', text: '', isCorrect: false },
    { id: 'c4', text: '', isCorrect: false }
  ]);
  const [explanation, setExplanation] = useState('');

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQ: Question = {
      id: `q_${Date.now()}`,
      bankId: 'bank_log_1',
      subject: 'Matematika',
      grade: 'X',
      material,
      type,
      difficulty,
      questionText,
      choices: type === 'MULTIPLE_CHOICE' || type === 'COMPLEX_MULTIPLE_CHOICE' ? choices : [],
      correctAnswer: choices.find(c => c.isCorrect)?.id || 'c1',
      explanation,
      score: Number(score)
    };

    setQuestions([newQ, ...questions]);
    setIsCreating(false);
    setQuestionText('');
    setExplanation('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Bank Soal & Modul Matematika</h1>
          <p className="text-xs text-slate-400">Kelola bank soal pilihan ganda, essay, dan formula matematika KaTeX.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{isCreating ? 'Tutup Form' : 'Tambah Soal Baru'}</span>
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreateQuestion} className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Calculator className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Buat Soal Baru (Dukungan Formulasi KaTeX)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Jenis Soal:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
              >
                <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                <option value="COMPLEX_MULTIPLE_CHOICE">Pilihan Ganda Kompleks</option>
                <option value="TRUE_FALSE">Benar / Salah</option>
                <option value="SHORT_ANSWER">Jawaban Singkat</option>
                <option value="ESSAY">Essay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tingkat Kesulitan:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
              >
                <option value="EASY">Mudah (Easy)</option>
                <option value="MEDIUM">Sedang (Medium)</option>
                <option value="HARD">Sulit (Hard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Bobot Skor:</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Pertanyaan (Gunakan $...$ untuk LaTeX inline, $$...$$ untuk block):</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Contoh: Berapakah nilai dari $^2\log 32$ ?"
              rows={3}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            {questionText && (
              <div className="mt-2 rounded-xl bg-slate-900/60 border border-blue-500/30 p-3 text-xs">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Live Preview KaTeX:</span>
                <MathText text={questionText} />
              </div>
            )}
          </div>

          {/* Choices Editor */}
          {type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400">Pilihan Jawaban:</label>
              {choices.map((c, idx) => (
                <div key={c.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    checked={c.isCorrect}
                    onChange={() => setChoices(choices.map((ch, i) => ({ ...ch, isCorrect: i === idx })))}
                    className="h-4 w-4 text-blue-600"
                  />
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) => {
                      const updated = [...choices];
                      updated[idx].text = e.target.value;
                      setChoices(updated);
                    }}
                    placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 rounded-xl bg-slate-900 border border-white/10 p-2 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Discussion */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Pembahasan Soal:</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Jelaskan langkah penyelesaian soal..."
              rows={2}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsCreating(false)} className="rounded-xl px-4 py-2 text-xs text-slate-400">
              Batal
            </button>
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500">
              Simpan Soal Ke Bank
            </button>
          </div>
        </form>
      )}

      {/* Question List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Soal Tersimpan ({questions.length})</h3>
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold text-blue-300">
                  Soal #{idx + 1}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{q.material}</span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Skor: {q.score}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">{q.type}</span>
            </div>

            <div className="text-xs font-medium text-slate-100">
              <MathText text={q.questionText} />
            </div>

            {q.choices && q.choices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.choices.map((c, i) => (
                  <div
                    key={c.id}
                    className={`rounded-xl p-2.5 border ${
                      c.isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/40 border-white/5 text-slate-300'
                    }`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                    <MathText text={c.text} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
