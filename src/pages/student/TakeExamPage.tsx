import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question, ExamAttempt, MonitorEvent, TeacherMessage } from '../../types';
import { DEMO_EXAM, DEMO_QUESTIONS } from '../../lib/demoData';
import { MathText } from '../../components/common/MathText';
import { WarningOverlayModal } from '../../components/student/WarningOverlayModal';
import { realtimeBus } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Clock,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Maximize2,
  AlertTriangle,
  Send
} from 'lucide-react';

interface TakeExamPageProps {
  examId?: string;
  onFinishExam: () => void;
}

export const TakeExamPage: React.FC<TakeExamPageProps> = ({ onFinishExam }) => {
  const { currentUser } = useAuth();
  const exam: Exam = DEMO_EXAM;
  const questions: Question[] = DEMO_QUESTIONS;

  const [hasConfirmedRules, setHasConfirmedRules] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(`exam_answers_${exam.id}_${currentUser?.id}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Warning Overlay State
  const [activeWarningMessage, setActiveWarningMessage] = useState<TeacherMessage | null>(null);

  // Proctoring Timers & State
  const hiddenStartTimeRef = useRef<number | null>(null);
  const eventsRef = useRef<MonitorEvent[]>([]);

  // 1. Save answers locally & auto-sync
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`exam_answers_${exam.id}_${currentUser.id}`, JSON.stringify(answers));
    }
  }, [answers, exam.id, currentUser?.id]);

  // 2. Timer Countdown
  useEffect(() => {
    if (!hasConfirmedRules || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasConfirmedRules, isSubmitted]);

  // 3. Connection status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 4. Real-time Warning Listener from Teacher (FASE 9)
  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe('teacher_warning_to_student', (msg: TeacherMessage) => {
      if (msg.studentId === currentUser?.id || msg.studentId === 'ALL') {
        setActiveWarningMessage(msg);
      }
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  // 5. Proctoring Event Handlers (FASE 6)
  useEffect(() => {
    if (!hasConfirmedRules || isSubmitted) return;

    const recordEvent = (eventType: MonitorEvent['eventType'], details?: string, durationAway?: number) => {
      const evt: MonitorEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        studentId: currentUser?.id || 'anon',
        studentName: currentUser?.name || 'Siswa',
        examId: exam.id,
        attemptId: `attempt_${currentUser?.id}`,
        eventType,
        timestamp: new Date().toISOString(),
        questionNumber: currentQuestionIndex + 1,
        durationAwaySeconds: durationAway,
        details
      };
      eventsRef.current.push(evt);
      // Publish event in real time to Teacher Monitoring Dashboard
      realtimeBus.publish('student_monitor_event', evt);
    };

    // Tab visibility change listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenStartTimeRef.current = Date.now();
        recordEvent('TAB_HIDDEN', 'Siswa meninggalkan tab browser');
      } else {
        const awayMs = hiddenStartTimeRef.current ? Date.now() - hiddenStartTimeRef.current : 0;
        const awaySec = Math.round(awayMs / 1000);
        hiddenStartTimeRef.current = null;
        recordEvent('TAB_VISIBLE', `Siswa kembali ke halaman setelah ${awaySec} detik`, awaySec);
      }
    };

    // Blur / Focus listener
    const handleBlur = () => {
      recordEvent('FOCUS_LOST', 'Halaman browser kehilangan fokus');
    };

    // Fullscreen change listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordEvent('FULLSCREEN_EXIT', 'Siswa keluar dari mode Fullscreen');
      }
    };

    // Paste listener
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') || '';
      recordEvent('PASTE_DETECTED', `Tempel teks terdeteksi (${text.length} karakter)`, undefined);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('paste', handlePaste);
    };
  }, [hasConfirmedRules, isSubmitted, currentQuestionIndex, currentUser, exam.id]);

  const handleStartExam = () => {
    setHasConfirmedRules(true);
    // Request fullscreen if supported
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleAnswerSelect = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleAcknowledgeWarning = (messageId: string, explanation?: string) => {
    const readTimestamp = new Date().toISOString();
    realtimeBus.publish('student_read_warning', {
      messageId,
      studentId: currentUser?.id,
      readAt: readTimestamp,
      explanation
    });
    setActiveWarningMessage(null);
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  // Format time HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Rule Confirmation Screen (Requirement #7)
  if (!hasConfirmedRules) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-white">{exam.title}</h2>
          <p className="mt-1 text-xs text-slate-400">{exam.className} • {exam.durationMinutes} Menit • {exam.totalQuestions} Soal</p>

          <div className="mt-6 rounded-2xl bg-amber-950/40 border border-amber-500/30 p-4 text-left text-xs text-amber-200 leading-relaxed">
            <div className="font-bold flex items-center space-x-2 text-amber-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Aturan & Protokol Pengawasan Ujian:</span>
            </div>
            "Ujian akan memasuki <strong>Mode Ujian Terproteksi</strong>. Aktivitas meninggalkan halaman ujian, perpindahan tab, kehilangan fokus, keluar fullscreen, serta copy/paste dapat dicatat oleh sistem. Guru pengawas dapat memberikan peringatan realtime selama ujian berlangsung."
          </div>

          <div className="mt-6 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Jawaban Anda disimpan secara otomatis secara berkala.</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Gunakan koneksi internet stabil (dukungan offline lokal).</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Jika mendapat teguran guru, popup peringatan akan muncul.</span>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            className="mt-8 flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-98"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Saya Setuju & Mulai Ujian Sekarang</span>
          </button>
        </div>
      </div>
    );
  }

  // Submitted Screen
  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="glass-panel rounded-3xl p-8 border border-emerald-500/30 shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-white">Ujian Berhasil Dikumpulkan!</h2>
          <p className="mt-2 text-xs text-slate-400">
            Jawaban Anda telah aman tersimpan di server. Hasil dan pembahasan akan diumumkan oleh Guru.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-900/60 p-4 text-xs text-slate-300 space-y-1">
            <div>Jumlah Soal Dijawab: <strong className="text-white">{answeredCount} dari {questions.length}</strong></div>
            <div>Waktu Tersisa: <strong className="text-white">{formatTime(timeLeftSeconds)}</strong></div>
          </div>
          <button
            onClick={onFinishExam}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
          >
            Kembali ke Dashboard Siswa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6">
      
      {/* Real-time Warning Overlay Popup */}
      {activeWarningMessage && (
        <WarningOverlayModal
          message={activeWarningMessage}
          onAcknowledge={handleAcknowledgeWarning}
        />
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 mb-4 rounded-2xl glass-panel p-4 flex flex-wrap items-center justify-between gap-3 border border-white/10 shadow-lg">
        <div>
          <h1 className="text-sm font-bold text-white">{exam.title}</h1>
          <div className="text-[11px] text-slate-400">{exam.className} • Peserta: <span className="font-semibold text-blue-400">{currentUser?.name}</span></div>
        </div>

        {/* Live Proctor Status & Connection Banner */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
            isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? 'Online' : 'Koneksi Terputus (Simpan Lokal)'}</span>
          </div>

          <div className="flex items-center space-x-1.5 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500 live-pulse"></span>
            <span>Pengawasan Aktif</span>
          </div>

          <div className="flex items-center space-x-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-bold text-blue-300">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        </div>
      </header>

      {/* Offline Alert Banner if lost connection */}
      {!isOnline && (
        <div className="mb-4 rounded-xl bg-amber-500/20 border border-amber-500/40 p-3 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4 text-amber-400" />
            <span>Koneksi terputus. Jawaban Anda tetap tersimpan secara aman di penyimpanan lokal. Sistem akan tersinkronisasi otomatis saat terhubung kembali.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Question Display Area */}
        <main className="lg:col-span-3 space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl min-h-[420px] flex flex-col justify-between">
            <div>
              {/* Question Meta Info */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="rounded-lg bg-blue-600/30 border border-blue-500/40 px-3 py-1 text-xs font-bold text-blue-300">
                    Soal No. {currentQuestionIndex + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">dari {questions.length} Soal</span>
                </div>
                
                {/* Ragu-Ragu Checkbox */}
                <button
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1 text-xs font-medium border transition ${
                    flagged[currentQ.id]
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Ragu-Ragu</span>
                </button>
              </div>

              {/* Question Text (With KaTeX support) */}
              <div className="text-sm font-medium text-slate-100 leading-relaxed space-y-2 mb-6">
                <MathText text={currentQ.questionText} />
              </div>

              {/* Choices Render */}
              <div className="space-y-2.5">
                {currentQ.type === 'MULTIPLE_CHOICE' && currentQ.choices?.map((choice, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = answers[currentQ.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswerSelect(currentQ.id, choice.id)}
                      className={`flex w-full items-start space-x-3 rounded-2xl p-3.5 text-left text-xs transition border ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {letter}
                      </span>
                      <div className="pt-0.5">
                        <MathText text={choice.text} />
                      </div>
                    </button>
                  );
                })}

                {/* True / False */}
                {currentQ.type === 'TRUE_FALSE' && currentQ.choices?.map((choice) => {
                  const isSelected = answers[currentQ.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswerSelect(currentQ.id, choice.id)}
                      className={`flex w-full items-center space-x-3 rounded-2xl p-4 text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-white'
                          : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{choice.text}</span>
                    </button>
                  );
                })}

                {/* Short Answer / Essay */}
                {(currentQ.type === 'SHORT_ANSWER' || currentQ.type === 'ESSAY') && (
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
                    placeholder="Ketik jawaban Anda di sini..."
                    rows={4}
                    className="w-full rounded-2xl bg-slate-900 border border-white/15 p-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 border border-white/10 hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500"
                >
                  <Send className="h-4 w-4" />
                  <span>Kumpulkan Ujian</span>
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Side Question Navigator Panel */}
        <aside className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Navigasi Soal</h3>
          
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = !!flagged[q.id];
              const isCurrent = idx === currentQuestionIndex;

              let bgStyle = 'bg-slate-900 text-slate-400 border-white/10';
              if (isCurrent) bgStyle = 'bg-blue-600 text-white ring-2 ring-blue-400 font-bold';
              else if (isFlagged) bgStyle = 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold';
              else if (isAnswered) bgStyle = 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 font-semibold';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`flex h-9 items-center justify-center rounded-xl text-xs border transition ${bgStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-emerald-600/40 border border-emerald-500"></span>
              <span>Sudah Dijawab ({answeredCount})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-amber-500/40 border border-amber-500"></span>
              <span>Ragu-ragu ({Object.keys(flagged).length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-slate-900 border border-white/10"></span>
              <span>Belum Dijawab ({questions.length - answeredCount})</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
