import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassProvider, useClasses } from './context/ClassContext';
import { MaterialProvider } from './context/MaterialContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './pages/auth/LoginPage';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { LiveMonitoringPage } from './pages/teacher/LiveMonitoringPage';
import { QuestionBankPage } from './pages/teacher/QuestionBankPage';
import { ExamCreatePage } from './pages/teacher/ExamCreatePage';
import { ExamResultPage } from './pages/teacher/ExamResultPage';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherSettingsPage } from './pages/teacher/TeacherSettingsPage';
import { TeacherMaterialsPage } from './pages/teacher/TeacherMaterialsPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentMaterialsPage } from './pages/student/StudentMaterialsPage';
import { TakeExamPage } from './pages/student/TakeExamPage';
import { DEMO_EXAM, DEMO_USERS } from './lib/demoData';
import { MathText } from './components/common/MathText';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { getJoinedClasses } = useClasses();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isTakingExam, setIsTakingExam] = useState(false);
  const [isCreatingExam, setIsCreatingExam] = useState(false);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={() => setCurrentTab('dashboard')} />;
  }

  const studentJoinedClasses = getJoinedClasses();

  // Fullscreen view for student taking exam
  if (isTakingExam && currentUser.role === 'STUDENT') {
    return (
      <TakeExamPage
        onFinishExam={() => setIsTakingExam(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => {
          setIsCreatingExam(false);
          setCurrentTab(tab);
        }} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* TEACHER VIEWS */}
          {currentUser.role === 'TEACHER' && (
            <>
              {currentTab === 'dashboard' && <TeacherDashboard onNavigate={(t) => setCurrentTab(t)} />}
              {currentTab === 'classes' && <TeacherClassesPage />}
              {currentTab === 'monitoring' && <LiveMonitoringPage />}
              {currentTab === 'question-bank' && <QuestionBankPage />}
              {currentTab === 'results' && <ExamResultPage />}
              {currentTab === 'settings' && <TeacherSettingsPage />}
              {currentTab === 'materials' && <TeacherMaterialsPage />}

              {currentTab === 'exams' && (
                <div className="space-y-4">
                  {isCreatingExam ? (
                    <div>
                      <button
                        onClick={() => setIsCreatingExam(false)}
                        className="mb-4 flex items-center space-x-1.5 text-xs text-blue-400 hover:underline"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Daftar Ujian</span>
                      </button>
                      <ExamCreatePage onSuccess={() => setIsCreatingExam(false)} />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <div>
                          <h1 className="text-xl font-bold text-white">Kelola Ujian & Latihan</h1>
                          <p className="text-xs text-slate-400">Buat jadwal dan atur parameter proteksi pengawasan realtime.</p>
                        </div>
                        <button
                          onClick={() => setIsCreatingExam(true)}
                          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
                        >
                          + Buat Ujian Baru
                        </button>
                      </div>

                      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex justify-between items-center">
                        <div>
                          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">AKTIF</span>
                          <h3 className="text-base font-bold text-white mt-1">{DEMO_EXAM.title}</h3>
                          <p className="text-xs text-slate-400">{DEMO_EXAM.className} • {DEMO_EXAM.durationMinutes} Menit • {DEMO_EXAM.totalQuestions} Soal</p>
                        </div>
                        <button
                          onClick={() => setCurrentTab('monitoring')}
                          className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
                        >
                          Buka Monitoring Realtime
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'students' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-white border-b border-white/10 pb-4">Daftar Siswa Terdaftar</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {DEMO_USERS.filter(u => u.role === 'STUDENT').map(s => (
                      <div key={s.id} className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center space-x-3">
                        <img src={s.avatarUrl} alt={s.name} className="h-10 w-10 rounded-full object-cover border border-blue-500/40" />
                        <div>
                          <div className="text-xs font-bold text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-400">{s.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STUDENT VIEWS */}
          {currentUser.role === 'STUDENT' && (
            <>
              {currentTab === 'dashboard' && (
                <StudentDashboard
                  onStartExam={() => setIsTakingExam(true)}
                  onNavigate={(t) => setCurrentTab(t)}
                />
              )}

              {currentTab === 'exams' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-white border-b border-white/10 pb-4">Ujian & Latihan Saya</h1>
                  <div className="glass-panel-warning rounded-3xl p-6 border border-amber-500/30 flex justify-between items-center">
                    <div>
                      <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">AKTIF</span>
                      <h3 className="text-base font-bold text-white mt-1">{DEMO_EXAM.title}</h3>
                      <p className="text-xs text-slate-400">{DEMO_EXAM.className} • {DEMO_EXAM.durationMinutes} Menit</p>
                    </div>
                    <button
                      onClick={() => setIsTakingExam(true)}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
                    >
                      Kerjakan Ujian
                    </button>
                  </div>
                </div>
              )}

              {currentTab === 'classes' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-white border-b border-white/10 pb-4">Kelas Saya ({studentJoinedClasses.length})</h1>
                  {studentJoinedClasses.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-8 text-center border border-white/10">
                      <p className="text-sm text-slate-400">Anda belum terdaftar di kelas manapun.</p>
                      <button
                        onClick={() => setCurrentTab('dashboard')}
                        className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-500"
                      >
                        Kembali ke Dashboard untuk Gabung Kelas
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentJoinedClasses.map(c => (
                        <div key={c.id} className="glass-panel rounded-3xl p-6 border border-white/10 space-y-2">
                          <h3 className="text-base font-bold text-white">{c.name}</h3>
                          <p className="text-xs text-slate-400">{c.subject} • Kelas {c.grade}</p>
                          <p className="text-xs text-slate-400">Pengajar: <strong className="text-slate-200">{c.teacherName}</strong> • Kode: <code className="text-blue-400 font-bold font-mono">{c.code}</code></p>
                          <div className="pt-2 flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Status: Terdaftar & Aktif</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'materials' && <StudentMaterialsPage />}

              {currentTab === 'results' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-white border-b border-white/10 pb-4">Nilai & Riwayat Ujian Saya</h1>
                  <div className="glass-panel rounded-3xl p-6 border border-white/10 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-white">Latihan Logaritma & Aljabar</h3>
                      <p className="text-xs text-slate-400">Tanggal: 20 Januari 2026</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-blue-400">85 / 100</div>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">LULUS KKM</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ClassProvider>
        <MaterialProvider>
          <MainAppContent />
        </MaterialProvider>
      </ClassProvider>
    </AuthProvider>
  );
};

export default App;

