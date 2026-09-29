import React, { useState, useEffect } from 'react';
import { ExamAttempt, MonitorEvent, TeacherMessage, SeverityLevel, MessageType } from '../../types';
import { DEMO_EXAM, DEMO_USERS } from '../../lib/demoData';
import { calculateStudentRisk } from '../../lib/riskCalculator';
import { SendWarningModal } from '../../components/teacher/SendWarningModal';
import { BroadcastModal } from '../../components/teacher/BroadcastModal';
import { StudentDetailPanel } from '../../components/teacher/StudentDetailPanel';
import { realtimeBus } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  AlertTriangle,
  ShieldAlert,
  Users,
  Megaphone,
  CheckCheck,
  Clock,
  Search,
  Filter,
  Activity,
  Copy,
  Monitor
} from 'lucide-react';

interface ToastAlert {
  id: string;
  studentId: string;
  studentName: string;
  eventType: string;
  message: string;
  timestamp: string;
}

export const LiveMonitoringPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Active attempts
  const [attempts, setAttempts] = useState<ExamAttempt[]>([
    {
      id: 'att_1',
      examId: DEMO_EXAM.id,
      examTitle: DEMO_EXAM.title,
      studentId: DEMO_USERS[1].id,
      studentName: DEMO_USERS[1].name,
      startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'IN_PROGRESS',
      currentQuestionIndex: 12,
      flaggedQuestionIds: ['q_3'],
      answers: { q_1: 'c3', q_2: 'c3', q_3: 'c2', q_4: 'c2', q_5: 'c3' },
      riskScore: 2,
      riskLevel: 'LOW',
      isOnline: true,
      lastPingAt: new Date().toISOString()
    },
    {
      id: 'att_2',
      examId: DEMO_EXAM.id,
      examTitle: DEMO_EXAM.title,
      studentId: DEMO_USERS[2].id,
      studentName: DEMO_USERS[2].name,
      startedAt: new Date(Date.now() - 20 * 60000).toISOString(),
      status: 'IN_PROGRESS',
      currentQuestionIndex: 16,
      flaggedQuestionIds: [],
      answers: { q_1: 'c3', q_2: 'c3', q_3: 'c2', q_4: 'c2' },
      riskScore: 6,
      riskLevel: 'MEDIUM',
      isOnline: true,
      lastPingAt: new Date().toISOString()
    },
    {
      id: 'att_3',
      examId: DEMO_EXAM.id,
      examTitle: DEMO_EXAM.title,
      studentId: DEMO_USERS[3].id,
      studentName: DEMO_USERS[3].name,
      startedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'IN_PROGRESS',
      currentQuestionIndex: 8,
      flaggedQuestionIds: ['q_7'],
      answers: { q_1: 'c3' },
      riskScore: 12,
      riskLevel: 'HIGH',
      isOnline: true,
      lastPingAt: new Date().toISOString()
    }
  ]);

  const [events, setEvents] = useState<MonitorEvent[]>([
    {
      id: 'e1',
      studentId: DEMO_USERS[3].id,
      studentName: DEMO_USERS[3].name,
      examId: DEMO_EXAM.id,
      attemptId: 'att_3',
      eventType: 'TAB_HIDDEN',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      durationAwaySeconds: 32,
      details: 'Siswa meninggalkan tab selama 32 detik'
    },
    {
      id: 'e2',
      studentId: DEMO_USERS[3].id,
      studentName: DEMO_USERS[3].name,
      examId: DEMO_EXAM.id,
      attemptId: 'att_3',
      eventType: 'PASTE_DETECTED',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      details: 'Tempel teks terdeteksi (48 karakter)'
    }
  ]);

  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Modals & Panel States
  const [warningModalState, setWarningModalState] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
  }>({ isOpen: false, studentId: '', studentName: '' });

  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [selectedStudentAttempt, setSelectedStudentAttempt] = useState<ExamAttempt | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  // Real-time Event Subscriptions (FASE 7 & 10)
  useEffect(() => {
    // Listen for events emitted by students taking exam
    const unsubEvents = realtimeBus.subscribe('student_monitor_event', (evt: MonitorEvent) => {
      setEvents(prev => [evt, ...prev]);

      // Trigger live toast alert if suspicious activity
      if (['TAB_HIDDEN', 'PASTE_DETECTED', 'FULLSCREEN_EXIT'].includes(evt.eventType)) {
        const toastText = 
          evt.eventType === 'TAB_HIDDEN' ? `${evt.studentName} terdeteksi meninggalkan halaman tab!` :
          evt.eventType === 'PASTE_DETECTED' ? `${evt.studentName} melakukan paste pada soal!` :
          `${evt.studentName} keluar dari mode fullscreen!`;

        const newToast: ToastAlert = {
          id: `toast_${Date.now()}`,
          studentId: evt.studentId,
          studentName: evt.studentName,
          eventType: evt.eventType,
          message: toastText,
          timestamp: new Date().toLocaleTimeString('id-ID')
        };
        setToasts(prev => [newToast, ...prev.slice(0, 4)]);
      }
    });

    // Listen for student read receipts (FASE 10)
    const unsubReads = realtimeBus.subscribe('student_read_warning', (data: { messageId: string; studentId: string; readAt: string; explanation?: string }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          return {
            ...m,
            status: 'READ',
            readAt: data.readAt
          };
        }
        return m;
      }));
    });

    return () => {
      unsubEvents();
      unsubReads();
    };
  }, []);

  // Handle Send Warning / Comment
  const handleSendWarning = (messageText: string, severity: SeverityLevel, type: MessageType) => {
    const newMsg: TeacherMessage = {
      id: `msg_${Date.now()}`,
      teacherId: currentUser?.id || 'teacher_1',
      teacherName: currentUser?.name || 'Pak Guru',
      studentId: warningModalState.studentId,
      studentName: warningModalState.studentName,
      examId: DEMO_EXAM.id,
      type,
      severity,
      message: messageText,
      sentAt: new Date().toISOString(),
      status: 'SENT'
    };

    setMessages(prev => [newMsg, ...prev]);

    // Broadcast instantly to Student Browser Overlay
    realtimeBus.publish('teacher_warning_to_student', newMsg);
  };

  // Handle Broadcast Message
  const handleBroadcast = (broadcastText: string) => {
    const broadMsg: TeacherMessage = {
      id: `broad_${Date.now()}`,
      teacherId: currentUser?.id || 'teacher_1',
      teacherName: currentUser?.name || 'Pak Guru',
      studentId: 'ALL',
      studentName: 'Seluruh Siswa',
      examId: DEMO_EXAM.id,
      type: 'TEACHER_COMMENT',
      severity: 'INFO',
      message: broadcastText,
      sentAt: new Date().toISOString(),
      status: 'SENT'
    };

    setMessages(prev => [broadMsg, ...prev]);
    realtimeBus.publish('teacher_warning_to_student', broadMsg);
  };

  const filteredAttempts = attempts.filter(a => {
    const risk = calculateStudentRisk(events.filter(e => e.studentId === a.studentId));
    const matchesSearch = a.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || risk.level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Notifications */}
      <div className="fixed top-20 right-6 z-40 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <div key={toast.id} className="glass-panel-warning rounded-2xl p-4 shadow-2xl border border-amber-500/40 animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Aktivitas Mencurigakan</span>
              </div>
              <span className="text-[10px] text-slate-400">{toast.timestamp}</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-100 font-medium">{toast.message}</p>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setWarningModalState({ isOpen: true, studentId: toast.studentId, studentName: toast.studentName })}
                className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-400"
              >
                Beri Peringatan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header Title & Broadcast CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">Monitoring Ujian Realtime</h1>
            <span className="flex items-center space-x-1 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-bold text-red-400 live-pulse">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>LIVE PROCTORING</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {DEMO_EXAM.title} • {DEMO_EXAM.className}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-blue-600/30 border border-blue-500/40 px-4 py-2.5 text-xs font-bold text-blue-300 shadow-lg hover:bg-blue-600/40 transition"
          >
            <Megaphone className="h-4 w-4 text-blue-400" />
            <span>Broadcast Info Ke Semua</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-2xl glass-panel p-4 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Peserta Online</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-400">3 <span className="text-xs text-slate-500 font-normal">siswa</span></div>
        </div>
        <div className="rounded-2xl glass-panel p-4 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Sedang Mengerjakan</div>
          <div className="mt-1 text-2xl font-extrabold text-blue-400">3 <span className="text-xs text-slate-500 font-normal">siswa</span></div>
        </div>
        <div className="rounded-2xl glass-panel p-4 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Selesai</div>
          <div className="mt-1 text-2xl font-extrabold text-purple-400">0 <span className="text-xs text-slate-500 font-normal">siswa</span></div>
        </div>
        <div className="rounded-2xl glass-panel-danger p-4">
          <div className="text-[11px] font-semibold text-red-300">Perlu Diperiksa (High Risk)</div>
          <div className="mt-1 text-2xl font-extrabold text-red-400">1 <span className="text-xs text-red-300 font-normal">siswa</span></div>
        </div>
        <div className="rounded-2xl glass-panel-accent p-4">
          <div className="text-[11px] font-semibold text-blue-300">Peringatan Terkirim</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{messages.length} <span className="text-xs text-slate-400 font-normal">pesan</span></div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel rounded-2xl p-3 border border-white/10">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-white/10 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Filter Risk:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(level => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold border transition ${
                riskFilter === level
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Student Monitoring Table (Requirement #20) */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Nama Siswa</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Progress Soal</th>
                <th className="px-4 py-3.5">Waktu Tersisa</th>
                <th className="px-4 py-3.5 text-center">Pindah Tab</th>
                <th className="px-4 py-3.5 text-center">Paste</th>
                <th className="px-4 py-3.5 text-center">Fullscreen Exit</th>
                <th className="px-4 py-3.5">Risk Indicator</th>
                <th className="px-4 py-3.5 text-right">Aksi Pengawas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAttempts.map((attempt) => {
                const studentEvts = events.filter(e => e.studentId === attempt.studentId);
                const risk = calculateStudentRisk(studentEvts);
                const progressPct = Math.round((attempt.currentQuestionIndex / DEMO_EXAM.totalQuestions) * 100);

                return (
                  <tr key={attempt.id} className="hover:bg-white/5 transition">
                    
                    {/* Student Name */}
                    <td className="px-4 py-4 font-semibold text-white">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-white/10">
                          {attempt.studentName.charAt(0)}
                        </div>
                        <div>
                          <div>{attempt.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {attempt.studentId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className="flex items-center space-x-1.5 font-bold text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 live-pulse"></span>
                        <span>ONLINE</span>
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-4">
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between text-[10px]">
                          <span>{attempt.currentQuestionIndex}/{DEMO_EXAM.totalQuestions} Soal</span>
                          <span className="font-bold text-blue-400">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Remaining Time */}
                    <td className="px-4 py-4 font-mono font-medium text-slate-200">
                      31:20
                    </td>

                    {/* Tab Switch Count */}
                    <td className="px-4 py-4 text-center font-bold text-amber-400">
                      {risk.tabSwitchCount}
                    </td>

                    {/* Paste Count */}
                    <td className="px-4 py-4 text-center font-bold text-purple-400">
                      {risk.pasteCount}
                    </td>

                    {/* Fullscreen Exit */}
                    <td className="px-4 py-4 text-center font-bold text-blue-400">
                      {risk.fullscreenExitCount}
                    </td>

                    {/* Risk Badge */}
                    <td className="px-4 py-4">
                      {risk.level === 'HIGH' && (
                        <span className="rounded-md bg-red-500/20 px-2 py-1 text-[11px] font-bold text-red-300 ring-1 ring-red-500/40 flex items-center space-x-1 w-fit">
                          <ShieldAlert className="h-3 w-3" />
                          <span>HIGH RISK ({risk.score})</span>
                        </span>
                      )}
                      {risk.level === 'MEDIUM' && (
                        <span className="rounded-md bg-amber-500/20 px-2 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-500/40 flex items-center space-x-1 w-fit">
                          <AlertTriangle className="h-3 w-3" />
                          <span>MEDIUM ({risk.score})</span>
                        </span>
                      )}
                      {risk.level === 'LOW' && (
                        <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-500/40 w-fit block">
                          LOW RISK ({risk.score})
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedStudentAttempt(attempt)}
                          className="flex items-center space-x-1 rounded-xl bg-slate-800 border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-400" />
                          <span>Pantau</span>
                        </button>
                        <button
                          onClick={() => setWarningModalState({ isOpen: true, studentId: attempt.studentId, studentName: attempt.studentName })}
                          className="flex items-center space-x-1 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                          <span>Beri Peringatan</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Panels */}
      <SendWarningModal
        isOpen={warningModalState.isOpen}
        onClose={() => setWarningModalState({ isOpen: false, studentId: '', studentName: '' })}
        studentId={warningModalState.studentId}
        studentName={warningModalState.studentName}
        onSend={handleSendWarning}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onBroadcast={handleBroadcast}
      />

      {selectedStudentAttempt && (
        <StudentDetailPanel
          attempt={selectedStudentAttempt}
          events={events}
          messages={messages}
          onClose={() => setSelectedStudentAttempt(null)}
          onOpenWarningModal={(sid, sname) => {
            setSelectedStudentAttempt(null);
            setWarningModalState({ isOpen: true, studentId: sid, studentName: sname });
          }}
        />
      )}

    </div>
  );
};
