import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ExamResult } from '../types';

export function exportResultsToPDF(results: ExamResult[], examTitle: string) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Laporan Hasil Ujian - ${examTitle}`, 14, 20);

  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
  doc.text(`Total Peserta: ${results.length}`, 14, 34);

  const tableData = results.map((r, idx) => [
    idx + 1,
    r.studentName,
    `${r.score} / ${r.maxScore}`,
    r.passed ? 'LULUS' : 'TIDAK LULUS',
    `${r.durationSpentMinutes} menit`,
    r.tabSwitchCount,
    r.pasteCount,
    r.riskLevel
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['No', 'Nama Siswa', 'Nilai', 'Status KKM', 'Durasi', 'Pindah Tab', 'Paste', 'Risk Indicator']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });

  doc.save(`Laporan_Hasil_Ujian_${examTitle.replace(/\s+/g, '_')}.pdf`);
}

export function exportResultsToExcel(results: ExamResult[], examTitle: string) {
  const excelData = results.map((r, idx) => ({
    No: idx + 1,
    'Nama Siswa': r.studentName,
    Nilai: r.score,
    'Nilai Maksimal': r.maxScore,
    'Status KKM': r.passed ? 'LULUS' : 'TIDAK LULUS',
    'Durasi (Menit)': r.durationSpentMinutes,
    'Jumlah Pindah Tab': r.tabSwitchCount,
    'Jumlah Paste': r.pasteCount,
    'Jumlah Keluar Fullscreen': r.fullscreenExitCount,
    'Risk Indicator': r.riskLevel,
    'Waktu Dikumpulkan': new Date(r.submittedAt).toLocaleString('id-ID')
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Ujian');

  XLSX.writeFile(workbook, `Hasil_Ujian_${examTitle.replace(/\s+/g, '_')}.xlsx`);
}
