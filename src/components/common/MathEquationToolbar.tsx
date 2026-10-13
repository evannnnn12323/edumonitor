import React, { useState } from 'react';
import katex from 'katex';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Copy,
  Check,
  Type,
  BookOpen
} from 'lucide-react';

interface MathEquationToolbarProps {
  onInsert: (latex: string) => void;
  activeTargetLabel?: string;
  className?: string;
}

interface EquationItem {
  label: string;
  latex: string;
  description?: string;
  category: string;
}

// Visual rendered formula button
const FormulaBtn: React.FC<{
  latex: string;
  label?: string;
  description?: string;
  onClick: () => void;
}> = ({ latex, label, description, onClick }) => {
  let renderedHtml = '';
  try {
    renderedHtml = katex.renderToString(latex, { displayMode: false, throwOnError: false });
  } catch {
    renderedHtml = latex;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={description || label || latex}
      className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400/50 text-slate-200 hover:text-white transition shadow-sm hover:scale-[1.03] active:scale-95"
    >
      <span
        className="text-sm font-semibold pointer-events-none select-none"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
      {label && (
        <span className="text-[10px] text-slate-400 group-hover:text-blue-300 mt-1 truncate max-w-[80px]">
          {label}
        </span>
      )}
    </button>
  );
};

export const MathEquationToolbar: React.FC<MathEquationToolbarProps> = ({
  onInsert,
  activeTargetLabel = 'Bidang Aktif',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'structures' | 'logarithm' | 'symbols' | 'greek' | 'templates'>('structures');
  const [customLatex, setCustomLatex] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // 1. STRUCTURES (Pecahan, Akar, Pangkat, Kurung, Integral, Sigma, Matriks, Logaritma)
  const structures: EquationItem[] = [
    // Pecahan
    { label: 'Pecahan', latex: '\\frac{a}{b}', category: 'Pecahan', description: 'Pecahan a/b' },
    { label: 'Turunan', latex: '\\frac{dy}{dx}', category: 'Pecahan', description: 'Turunan dy/dx' },
    { label: 'Parsial', latex: '\\frac{\\partial y}{\\partial x}', category: 'Pecahan', description: 'Turunan parsial' },

    // Akar
    { label: 'Akar Kuadrat', latex: '\\sqrt{x}', category: 'Akar', description: 'Akar kuadrat dari x' },
    { label: 'Akar Pangkat n', latex: '\\sqrt[n]{x}', category: 'Akar', description: 'Akar pangkat n dari x' },
    { label: 'Akar Kuadrat Jumlah', latex: '\\sqrt{a^2 + b^2}', category: 'Akar', description: 'Akar a kuadrat + b kuadrat' },

    // Logaritma
    { label: 'Logaritma Indo', latex: '^{a}\\log b', category: 'Logaritma', description: 'Logaritma basis a di atas (standar kurikulum Indonesia)' },
    { label: 'Logaritma Basis 2', latex: '^{2}\\log x', category: 'Logaritma', description: 'Logaritma basis 2' },
    { label: 'Logaritma Basis 10', latex: '\\log x', category: 'Logaritma', description: 'Logaritma basis 10' },
    { label: 'Log Subscript', latex: '\\log_{a} b', category: 'Logaritma', description: 'Logaritma basis a di bawah' },
    { label: 'Log Natural (ln)', latex: '\\ln(x)', category: 'Logaritma', description: 'Logaritma natural' },
    { label: 'Pangkat Logaritma', latex: '^{a^m}\\log(b^n)', category: 'Logaritma', description: 'Basis dan numerus berpangkat' },

    // Pangkat & Indeks
    { label: 'Pangkat (Superscript)', latex: 'x^{2}', category: 'Pangkat & Indeks', description: 'x pangkat 2' },
    { label: 'Indeks (Subscript)', latex: 'x_{i}', category: 'Pangkat & Indeks', description: 'x indeks i' },
    { label: 'Pangkat & Indeks', latex: 'x_{i}^{2}', category: 'Pangkat & Indeks', description: 'x indeks i pangkat 2' },
    { label: 'Eksponensial', latex: 'e^{x}', category: 'Pangkat & Indeks', description: 'e pangkat x' },
    { label: 'Notasi 10^n', latex: '10^{n}', category: 'Pangkat & Indeks', description: '10 pangkat n' },

    // Kurung & Mutlak
    { label: 'Kurung Biasa', latex: '(x)', category: 'Kurung', description: 'Kurung (x)' },
    { label: 'Kurung Siku', latex: '[x]', category: 'Kurung', description: 'Kurung [x]' },
    { label: 'Kurung Kurawal', latex: '\\{x\\}', category: 'Kurung', description: 'Kurung {x}' },
    { label: 'Nilai Mutlak', latex: '|x|', category: 'Kurung', description: 'Nilai mutlak |x|' },
    { label: 'Sistem Persamaan', latex: '\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}', category: 'Kurung', description: 'Sistem Persamaan Kurung Kurawal' },

    // Kalkulus & Limit
    { label: 'Integral Tak Tentu', latex: '\\int f(x) \\, dx', category: 'Kalkulus', description: 'Integral f(x) dx' },
    { label: 'Integral Tentu', latex: '\\int_{a}^{b} f(x) \\, dx', category: 'Kalkulus', description: 'Integral dari a ke b' },
    { label: 'Integral Lipat', latex: '\\iint f(x,y) \\, dxdy', category: 'Kalkulus', description: 'Integral lipat dua' },
    { label: 'Limit Tak Hingga', latex: '\\lim_{x \\to \\infty} f(x)', category: 'Kalkulus', description: 'Limit x menuju tak hingga' },
    { label: 'Limit Nol', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x}', category: 'Kalkulus', description: 'Limit x menuju 0' },

    // Operator Besar
    { label: 'Sigma (Jumlah)', latex: '\\sum_{i=1}^{n} x_i', category: 'Sigma & Pi', description: 'Notasi sigma penjumlahan' },
    { label: 'Sigma Sederhana', latex: '\\sum x', category: 'Sigma & Pi', description: 'Notasi sigma' },
    { label: 'Produk (Perkalian)', latex: '\\prod_{i=1}^{n} x_i', category: 'Sigma & Pi', description: 'Notasi perkalian Pi' },

    // Matriks
    { label: 'Matriks 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', category: 'Matriks', description: 'Matriks 2x2' },
    { label: 'Matriks 3x3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', category: 'Matriks', description: 'Matriks 3x3' },
    { label: 'Determinan 2x2', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', category: 'Matriks', description: 'Determinan matriks 2x2' }
  ];

  // 1B. LOGARITMA SPESIFIK (Kurikulum Indonesia, Internasional & Sifat-sifat Lengkap)
  const logarithmIndonesia: EquationItem[] = [
    { label: 'Basis a', latex: '^{a}\\log b', description: 'Notasi logaritma kurikulum Indonesia', category: 'Format Indo' },
    { label: 'Basis 2', latex: '^{2}\\log x', description: 'Logaritma basis 2', category: 'Format Indo' },
    { label: 'Basis 3', latex: '^{3}\\log x', description: 'Logaritma basis 3', category: 'Format Indo' },
    { label: 'Basis 5', latex: '^{5}\\log x', description: 'Logaritma basis 5', category: 'Format Indo' },
    { label: 'Basis 10', latex: '^{10}\\log x', description: 'Logaritma basis 10', category: 'Format Indo' },
    { label: 'Contoh Angka', latex: '^{2}\\log 8 = 3', description: '2 log 8 = 3', category: 'Format Indo' },
    { label: 'Pangkat Numerus', latex: '^{a}\\log(b^n)', description: 'Numerus b berpangkat n', category: 'Format Indo' },
    { label: 'Pangkat Basis & Numerus', latex: '^{a^m}\\log(b^n)', description: 'Basis m dan numerus n berpangkat', category: 'Format Indo' },
    { label: 'Logaritma dari 1', latex: '^{a}\\log 1 = 0', description: 'Logaritma dari 1 selalu sama dengan 0', category: 'Format Indo' },
    { label: 'Basis = Numerus', latex: '^{a}\\log a = 1', description: 'Jika basis sama dengan numerus hasilnya 1', category: 'Format Indo' }
  ];

  const logarithmInternational: EquationItem[] = [
    { label: 'Log Subscript a', latex: '\\log_{a} b', description: 'Logaritma basis a di bawah', category: 'Internasional' },
    { label: 'Log Subscript 2', latex: '\\log_{2} x', description: 'Logaritma basis 2', category: 'Internasional' },
    { label: 'Log Subscript 10', latex: '\\log_{10} x', description: 'Logaritma basis 10', category: 'Internasional' },
    { label: 'Log Desimal (10)', latex: '\\log(x)', description: 'Logaritma umum basis 10', category: 'Internasional' },
    { label: 'Log Natural (ln)', latex: '\\ln(x)', description: 'Logaritma natural basis e', category: 'Internasional' },
    { label: 'ln dari e', latex: '\\ln(e) = 1', description: 'Logaritma natural dari bilangan e', category: 'Internasional' },
    { label: 'Invers Eksponen', latex: 'e^{\\ln(x)} = x', description: 'Sifat invers eksponen dan ln', category: 'Internasional' }
  ];

  const logarithmIdentities: EquationItem[] = [
    {
      label: 'Definisi Logaritma',
      latex: '^{a}\\log b = c \\iff a^c = b',
      description: 'Hubungan bentuk logaritma dan pangkat/eksponen',
      category: 'Definisi'
    },
    {
      label: 'Penjumlahan (Perkalian)',
      latex: '^{a}\\log(x \\cdot y) = {}^{a}\\log x + {}^{a}\\log y',
      description: 'Logaritma perkalian menjadi penjumlahan logaritma',
      category: 'Sifat'
    },
    {
      label: 'Pengurangan (Pembagian)',
      latex: '^{a}\\log\\left(\\frac{x}{y}\\right) = {}^{a}\\log x - {}^{a}\\log y',
      description: 'Logaritma pembagian menjadi pengurangan logaritma',
      category: 'Sifat'
    },
    {
      label: 'Pangkat Numerus',
      latex: '^{a}\\log(x^n) = n \\cdot {}^{a}\\log x',
      description: 'Pangkat numerus maju ke depan sebagai pengali',
      category: 'Sifat'
    },
    {
      label: 'Pangkat Basis & Numerus',
      latex: '^{a^m}\\log(b^n) = \\frac{n}{m} \\cdot {}^{a}\\log b',
      description: 'Pangkat basis m dan numerus n menjadi n/m',
      category: 'Sifat'
    },
    {
      label: 'Pengubahan Basis Baru',
      latex: '^{a}\\log b = \\frac{^{c}\\log b}{^{c}\\log a} = \\frac{\\log b}{\\log a}',
      description: 'Mengubah basis logaritma ke basis c atau basis 10',
      category: 'Sifat'
    },
    {
      label: 'Perkalian Berantai',
      latex: '^{a}\\log b \\cdot {}^{b}\\log c = {}^{a}\\log c',
      description: 'Perkalian berantai logaritma dengan numerus dan basis sama',
      category: 'Sifat'
    },
    {
      label: 'Kebalikan Basis',
      latex: '^{a}\\log b = \\frac{1}{^{b}\\log a}',
      description: 'Membalik basis dan numerus menjadi 1 per logaritma',
      category: 'Sifat'
    },
    {
      label: 'Pangkat Basis Logaritma',
      latex: 'a^{^{a}\\log b} = b',
      description: 'Bilangan a dipangkatkan a log b menghasilkan b',
      category: 'Sifat'
    },
    {
      label: 'Persamaan Logaritma',
      latex: '^{a}\\log f(x) = {}^{a}\\log g(x) \\implies f(x) = g(x)',
      description: 'Penyelesaian persamaan logaritma basis sama',
      category: 'Persamaan'
    }
  ];

  // 2. SIMBOL LENGKAP (Operator Dasar, Relasi, Geometri, Himpunan, Panah)
  const symbols: { char: string; latex: string; name: string }[] = [
    // Operator
    { char: '±', latex: '\\pm', name: 'Plus-minus' },
    { char: '∓', latex: '\\mp', name: 'Minus-plus' },
    { char: '×', latex: '\\times', name: 'Kali' },
    { char: '÷', latex: '\\div', name: 'Bagi' },
    { char: '·', latex: '\\cdot', name: 'Titik kali' },
    { char: '≠', latex: '\\neq', name: 'Tidak sama dengan' },
    { char: '≈', latex: '\\approx', name: 'Hampir sama dengan' },
    { char: '≡', latex: '\\equiv', name: 'Kongruen / ekuivalen' },
    { char: '≤', latex: '\\le', name: 'Kurang dari sama dengan' },
    { char: '≥', latex: '\\ge', name: 'Lebih dari sama dengan' },
    { char: '≪', latex: '\\ll', name: 'Jauh lebih kecil' },
    { char: '≫', latex: '\\gg', name: 'Jauh lebih besar' },
    { char: '∞', latex: '\\infty', name: 'Tak hingga' },
    { char: '∝', latex: '\\propto', name: 'Sebanding dengan' },

    // Geometri & Fisika
    { char: '°', latex: '^{\\circ}', name: 'Derajat' },
    { char: '∠', latex: '\\angle', name: 'Sudut' },
    { char: '△', latex: '\\triangle', name: 'Segitiga' },
    { char: '⊥', latex: '\\perp', name: 'Tegak lurus' },
    { char: '∥', latex: '\\parallel', name: 'Sejajar' },
    { char: 'v⃗', latex: '\\vec{v}', name: 'Vektor v' },
    { char: 'AB⃗', latex: '\\vec{AB}', name: 'Vektor AB' },
    { char: 'x̄', latex: '\\bar{x}', name: 'Rata-rata x' },

    // Himpunan & Logika
    { char: '∈', latex: '\\in', name: 'Anggota himpunan' },
    { char: '∉', latex: '\\notin', name: 'Bukan anggota' },
    { char: '⊂', latex: '\\subset', name: 'Himpunan bagian' },
    { char: '⊆', latex: '\\subseteq', name: 'Bagian atau sama' },
    { char: '∪', latex: '\\cup', name: 'Gabungan' },
    { char: '∩', latex: '\\cap', name: 'Irisan' },
    { char: '∅', latex: '\\emptyset', name: 'Himpunan kosong' },
    { char: 'ℝ', latex: '\\mathbb{R}', name: 'Bilangan real' },
    { char: 'ℕ', latex: '\\mathbb{N}', name: 'Bilangan asli' },
    { char: 'ℤ', latex: '\\mathbb{Z}', name: 'Bilangan bulat' },
    { char: '∀', latex: '\\forall', name: 'Untuk semua' },
    { char: '∃', latex: '\\exists', name: 'Ada / terdapat' },
    { char: '¬', latex: '\\neg', name: 'Negasi' },
    { char: '⇒', latex: '\\implies', name: 'Maka / implikasi' },
    { char: '⇔', latex: '\\iff', name: 'Jika dan hanya jika' },
    { char: '∴', latex: '\\therefore', name: 'Oleh karena itu' },

    // Panah
    { char: '→', latex: '\\to', name: 'Panah kanan' },
    { char: '←', latex: '\\leftarrow', name: 'Panah kiri' },
    { char: '↔', latex: '\\leftrightarrow', name: 'Panah bolak-balik' },
    { char: '↑', latex: '\\uparrow', name: 'Panah atas' },
    { char: '↓', latex: '\\downarrow', name: 'Panah bawah' }
  ];

  // 3. HURUF YUNANI (Greek Letters)
  const greekLetters = [
    { name: 'alpha', latex: '\\alpha', char: 'α' },
    { name: 'beta', latex: '\\beta', char: 'β' },
    { name: 'gamma', latex: '\\gamma', char: 'γ' },
    { name: 'delta', latex: '\\delta', char: 'δ' },
    { name: 'epsilon', latex: '\\epsilon', char: 'ε' },
    { name: 'zeta', latex: '\\zeta', char: 'ζ' },
    { name: 'eta', latex: '\\eta', char: 'η' },
    { name: 'theta', latex: '\\theta', char: 'θ' },
    { name: 'iota', latex: '\\iota', char: 'ι' },
    { name: 'kappa', latex: '\\kappa', char: 'κ' },
    { name: 'lambda', latex: '\\lambda', char: 'λ' },
    { name: 'mu', latex: '\\mu', char: 'μ' },
    { name: 'nu', latex: '\\nu', char: 'ν' },
    { name: 'xi', latex: '\\xi', char: 'ξ' },
    { name: 'pi', latex: '\\pi', char: 'π' },
    { name: 'rho', latex: '\\rho', char: 'ρ' },
    { name: 'sigma', latex: '\\sigma', char: 'σ' },
    { name: 'tau', latex: '\\tau', char: 'τ' },
    { name: 'phi', latex: '\\phi', char: 'φ' },
    { name: 'chi', latex: '\\chi', char: 'χ' },
    { name: 'psi', latex: '\\psi', char: 'ψ' },
    { name: 'omega', latex: '\\omega', char: 'ω' },
    // Huruf Besar
    { name: 'Gamma', latex: '\\Gamma', char: 'Γ' },
    { name: 'Delta', latex: '\\Delta', char: 'Δ' },
    { name: 'Theta', latex: '\\Theta', char: 'Θ' },
    { name: 'Lambda', latex: '\\Lambda', char: 'Λ' },
    { name: 'Pi', latex: '\\Pi', char: 'Π' },
    { name: 'Sigma', latex: '\\Sigma', char: 'Σ' },
    { name: 'Phi', latex: '\\Phi', char: 'Φ' },
    { name: 'Psi', latex: '\\Psi', char: 'Ψ' },
    { name: 'Omega', latex: '\\Omega', char: 'Ω' }
  ];

  // 4. TEMPLATE RUMUS SIAP PAKAI (Microsoft Word Formula Templates)
  const formulaTemplates: EquationItem[] = [
    {
      label: 'Rumus ABC (Kuadrat)',
      latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      description: 'Penyelesaian persamaan kuadrat ax^2 + bx + c = 0',
      category: 'Aljabar'
    },
    {
      label: 'Teorema Pythagoras',
      latex: 'a^2 + b^2 = c^2',
      description: 'Hubungan sisi segitiga siku-siku',
      category: 'Geometri'
    },
    {
      label: 'Luas Lingkaran',
      latex: 'L = \\pi r^2',
      description: 'Rumus luas lingkaran',
      category: 'Geometri'
    },
    {
      label: 'Keliling Lingkaran',
      latex: 'K = 2\\pi r',
      description: 'Rumus keliling lingkaran',
      category: 'Geometri'
    },
    {
      label: 'Identitas Trigonometri',
      latex: '\\sin^2(x) + \\cos^2(x) = 1',
      description: 'Identitas dasar sin kuadrat + cos kuadrat',
      category: 'Trigonometri'
    },
    {
      label: 'Aturan Sinus',
      latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
      description: 'Aturan sinus pada segitiga',
      category: 'Trigonometri'
    },
    {
      label: 'Definisi Turunan',
      latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
      description: 'Turunan pertama dengan limit',
      category: 'Kalkulus'
    },
    {
      label: 'Rata-rata Hitung (Mean)',
      latex: '\\bar{x} = \\frac{\\sum_{i=1}^{n} x_i}{n}',
      description: 'Rumus rata-rata data tunggal',
      category: 'Statistika'
    },
    {
      label: 'Barisan Aritmatika',
      latex: 'U_n = a + (n - 1)b',
      description: 'Suku ke-n barisan aritmatika',
      category: 'Aljabar'
    },
    {
      label: 'Barisan Geometri',
      latex: 'U_n = a \\cdot r^{n-1}',
      description: 'Suku ke-n barisan geometri',
      category: 'Aljabar'
    },
    {
      label: 'Distribusi Normal',
      latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
      description: 'Fungsi kerapatan probabilitas normal',
      category: 'Statistika'
    }
  ];

  const handleInsertFormula = (latex: string) => {
    // Automatically wrap with $...$ for inline LaTeX math
    onInsert(`$${latex}$`);
  };

  const handleInsertRaw = (latex: string) => {
    onInsert(latex);
  };

  const renderCustomPreview = () => {
    if (!customLatex.trim()) return null;
    try {
      const html = katex.renderToString(customLatex, { displayMode: true, throwOnError: false });
      return (
        <div
          className="p-3 rounded-xl bg-slate-900 border border-blue-500/40 text-blue-300 text-center overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return (
        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-300 text-xs">
          Sintaks LaTeX tidak valid
        </div>
      );
    }
  };

  return (
    <div className={`rounded-2xl border border-blue-500/30 bg-slate-950/90 shadow-xl overflow-hidden ${className}`}>
      {/* Ribbon Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            ∑
          </div>
          <span className="text-xs font-bold text-white">Equation Editor (Formula Matematika)</span>
          <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
            Target: <strong>{activeTargetLabel}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition"
        >
          <span>{isOpen ? 'Tutup Ribbon' : 'Buka Ribbon'}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3">
          {/* Ribbon Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('structures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'structures'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>📐 Struktur (Pecahan, Akar, Matriks)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logarithm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'logarithm'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>🔢 Logaritma & Eksponen</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('symbols')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'symbols'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>🔣 Simbol & Operator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('greek')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'greek'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>🏛️ Huruf Yunani (α, β, θ, π)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>💡 Rumus Siap Pakai (ABC, Pythagoras)</span>
            </button>
          </div>

          {/* TAB 1: STRUCTURES */}
          {activeTab === 'structures' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
                {structures.map((item, idx) => (
                  <FormulaBtn
                    key={idx}
                    latex={item.latex}
                    label={item.label}
                    description={item.description}
                    onClick={() => handleInsertFormula(item.latex)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 1B: LOGARITMA & EKSPONEN */}
          {activeTab === 'logarithm' && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Group 1: Format Standar Indonesia */}
              <div className="space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-blue-300">
                  <span>🇮🇩 Format Kurikulum Indonesia (Basis Kiri Atas: ᵃlog b)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {logarithmIndonesia.map((item, idx) => (
                    <FormulaBtn
                      key={idx}
                      latex={item.latex}
                      label={item.label}
                      description={item.description}
                      onClick={() => handleInsertFormula(item.latex)}
                    />
                  ))}
                </div>
              </div>

              {/* Group 2: Format Internasional */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-purple-300">
                  <span>🌐 Format Internasional / Scientific (log_a b & ln x)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {logarithmInternational.map((item, idx) => (
                    <FormulaBtn
                      key={idx}
                      latex={item.latex}
                      label={item.label}
                      description={item.description}
                      onClick={() => handleInsertFormula(item.latex)}
                    />
                  ))}
                </div>
              </div>

              {/* Group 3: Sifat-sifat Logaritma Lengkap */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-300">
                  <span>📖 Sifat-Sifat & Identitas Logaritma Lengkap (SMA / SMK)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {logarithmIdentities.map((item, idx) => {
                    let rendered = '';
                    try {
                      rendered = katex.renderToString(item.latex, { displayMode: false, throwOnError: false });
                    } catch {
                      rendered = item.latex;
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => handleInsertFormula(item.latex)}
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white group-hover:text-blue-300">
                            {item.label}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <div
                          className="text-xs text-blue-300 font-semibold overflow-x-auto py-0.5"
                          dangerouslySetInnerHTML={{ __html: rendered }}
                        />
                        <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYMBOLS */}
          {activeTab === 'symbols' && (
            <div className="space-y-2">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {symbols.map((sym, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertFormula(sym.latex)}
                    title={`${sym.name} (${sym.latex})`}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400 text-sm font-bold text-slate-200 hover:text-white transition hover:scale-105 active:scale-95"
                  >
                    <span>{sym.char}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GREEK LETTERS */}
          {activeTab === 'greek' && (
            <div className="space-y-2">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {greekLetters.map((g, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertFormula(g.latex)}
                    title={`${g.name} (${g.latex})`}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400 text-sm font-bold text-slate-200 hover:text-white transition hover:scale-105 active:scale-95"
                  >
                    <span>{g.char}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {formulaTemplates.map((item, idx) => {
                let rendered = '';
                try {
                  rendered = katex.renderToString(item.latex, { displayMode: false, throwOnError: false });
                } catch {
                  rendered = item.latex;
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleInsertFormula(item.latex)}
                    className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-blue-300">
                        {item.label}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <div
                      className="text-sm text-blue-300 font-semibold overflow-x-auto py-1"
                      dangerouslySetInnerHTML={{ __html: rendered }}
                    />
                    <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Custom LaTeX Input with live preview */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Atau ketik kode LaTeX langsung (misal: \frac{x+1}{x-1} atau \sqrt{25})..."
                value={customLatex}
                onChange={(e) => setCustomLatex(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (customLatex.trim()) {
                    handleInsertFormula(customLatex.trim());
                    setCustomLatex('');
                  }
                }}
                disabled={!customLatex.trim()}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition"
              >
                + Sisipkan
              </button>
            </div>
            {renderCustomPreview()}
          </div>
        </div>
      )}
    </div>
  );
};
