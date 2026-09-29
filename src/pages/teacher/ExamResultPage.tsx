import React from 'react';
import { ExamResult } from '../../types';
import { exportResultsToPDF, exportResultsToExcel } from '../../lib/exportUtils';
import { DEMO_EXAM } from '../../lib/demoData';
import { BarChart3, FileText, Download, Award, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const ExamResultPage: React.FC = () => {
  const results: ExamResult[] = [
    {
      id: 'res_1',
      examId: DEMO_EXAM.id,
      studentId: 'user_student_1',
      studentName: 'Budi Santoso',
      score: 85,
      maxScore: 100,
      kkm: 75,
      passed: true,
      durationSpentMinutes: 32,
      submittedAt: new Date(Date.now() - 600000).toISOString(),
      tabSwitchCount: 1,
      pasteCount: 0,
      focusLossCount: 2,
      fullscreenExitCount: 0,
      warningCount: 1,
      riskLevel: 'LOW'
    },
    {
      id: 'res_2',
      examId: DEMO_EXAM.id,
      studentId: 'user_student_2',
      studentName: 'Siti Rahma',
      score: 95,
      maxScore: 100,
      kkm: 75,
      passed: true,
      durationSpentMinutes: 28,
      submittedAt: new Date(Date.now() - 1200000).toISOString(),
      tabSwitchCount: 0,
      pasteCount: 0,
      focusLossCount: 1,
      fullscreenExitCount: 0,
      warningCount: 0,
      riskLevel: 'LOW'
    },
    {
      id: 'res_3',
      examId: DEMO_EXAM.id,
      studentId: 'user_student_3',
      studentName: 'Andi Pratama',
      score: 60,
      maxScore: 100,
      kkm: 75,
      passed: false,
      durationSpentMinutes: 42,
      submittedAt: new Date(Date.now() - 300000).toISOString(),
      tabSwitchCount: 4,
      pasteCount: 2,
      focusLossCount: 5,
      fullscreenExitCount: 2,
      warningCount: 2,
      riskLevel: 'HIGH'
    }
  ];

  const avgScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Laporan & Analisis Hasil Ujian</h1>
          <p className="text-xs text-slate-400">{DEMO_EXAM.title} • {DEMO_EXAM.className}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportResultsToPDF(results, DEMO_EXAM.title)}
            className="flex items-center space-x-2 rounded-xl bg-red-600/20 border border-red-500/40 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-600/30 transition"
          >
            <FileText className="h-4 w-4 text-red-400" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => exportResultsToExcel(results, DEMO_EXAM.title)}
            className="flex items-center space-x-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Rata-Rata Nilai</div>
          <div className="mt-1 text-2xl font-extrabold text-blue-400">{avgScore}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Nilai Tertinggi</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-400">95</div>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Nilai Terendah</div>
          <div className="mt-1 text-2xl font-extrabold text-red-400">60</div>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Kelulusan KKM (75)</div>
          <div className="mt-1 text-2xl font-extrabold text-purple-400">66.7%</div>
        </div>
      </div>

      {/* Student Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-white/10 font-bold text-sm text-white flex items-center space-x-2">
          <Award className="h-4 w-4 text-blue-400" />
          <span>Daftar Nilai & Integristas Siswa</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">Siswa</th>
                <th className="px-4 py-3.5">Nilai akhir</th>
                <th className="px-4 py-3.5">Status KKM</th>
                <th className="px-4 py-3.5">Durasi</th>
                <th className="px-4 py-3.5 text-center">Pindah Tab</th>
                <th className="px-4 py-3.5 text-center">Paste</th>
                <th className="px-4 py-3.5">Risk Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 font-bold text-white">{r.studentName}</td>
                  <td className="px-4 py-3.5 font-extrabold text-blue-400 text-sm">{r.score} <span className="text-xs text-slate-500 font-normal">/ {r.maxScore}</span></td>
                  <td className="px-4 py-3.5">
                    {r.passed ? (
                      <span className="flex items-center space-x-1 font-bold text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>LULUS</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 font-bold text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>REMIDIAL</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{r.durationSpentMinutes} menit</td>
                  <td className="px-4 py-3.5 text-center font-bold text-amber-400">{r.tabSwitchCount}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-purple-400">{r.pasteCount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      r.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {r.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
