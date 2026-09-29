import { User, ClassItem, QuestionBank, Question, Exam, ExamAttempt, Material } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'user_teacher_1',
    name: 'Guru',
    email: '',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user_student_1',
    name: 'Siswa 1',
    email: '',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 'user_student_2',
    name: 'Siswa 2',
    email: '',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2026-01-12T09:15:00Z'
  },
  {
    id: 'user_student_3',
    name: 'Siswa 3',
    email: '',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2026-01-12T09:30:00Z'
  }
];

export const DEMO_CLASSES: ClassItem[] = [
  {
    id: 'class_mtk_x_a',
    name: 'Matematika Kelas X A',
    subject: 'Matematika',
    grade: 'X',
    code: 'MTK-XA-4827',
    teacherId: 'user_teacher_1',
    teacherName: 'Guru',
    description: 'Kelas pembelajaran Matematika pematan, aljabar, dan fungsi untuk kelas X A.',
    createdAt: '2026-01-15T07:30:00Z',
    studentCount: 3
  }
];

export const DEMO_MATERIALS: Material[] = [
  {
    id: 'mat_1',
    classId: 'class_mtk_x_a',
    className: 'Matematika Kelas X A',
    title: 'Konsep Dasar Logaritma & Sifat-Sifatnya',
    content: `Logaritma adalah kebalikan (invers) dari pemangkatan. Jika $a^c = b$, maka $^a\\log b = c$ dengan syarat $a > 0, a \\neq 1$, dan $b > 0$.

### Sifat-Sifat Utama Logaritma:
1. $^a\\log (b \\cdot c) = ^a\\log b + ^a\\log c$
2. $^a\\log \\left(\\frac{b}{c}\\right) = ^a\\log b - ^a\\log c$
3. $^a\\log b^n = n \\cdot ^a\\log b$
4. $^a\\log b = \\frac{^c\\log b}{^c\\log a}$
5. $^a\\log b \\cdot ^b\\log c = ^a\\log c$`,
    createdAt: '2026-01-20T10:00:00Z',
    teacherId: 'user_teacher_1'
  }
];

export const DEMO_QUESTIONS: Question[] = [
  {
    id: 'q_1',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Berapakah nilai dari $^2\\log 32$ ?',
    choices: [
      { id: 'c1', text: '3' },
      { id: 'c2', text: '4' },
      { id: 'c3', text: '5', isCorrect: true },
      { id: 'c4', text: '6' },
      { id: 'c5', text: '8' }
    ],
    correctAnswer: 'c3',
    explanation: 'Karena $2^5 = 32$, maka berdasarkan definisi logaritma $^2\\log 32 = 5$.',
    score: 5
  },
  {
    id: 'q_2',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Nilai dari $^3\\log 81 + ^3\\log 9$ adalah...',
    choices: [
      { id: 'c1', text: '4' },
      { id: 'c2', text: '5' },
      { id: 'c3', text: '6', isCorrect: true },
      { id: 'c4', text: '7' },
      { id: 'c5', text: '8' }
    ],
    correctAnswer: 'c3',
    explanation: '$^3\\log 81 = 4$ dan $^3\\log 9 = 2$. Maka $4 + 2 = 6$.',
    score: 5
  },
  {
    id: 'q_3',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    questionText: 'Jika $^2\\log 3 = a$ dan $^2\\log 5 = b$, maka nilai dari $^2\\log 45$ adalah...',
    choices: [
      { id: 'c1', text: '$a + b$' },
      { id: 'c2', text: '$2a + b$', isCorrect: true },
      { id: 'c3', text: '$a + 2b$' },
      { id: 'c4', text: '$2a + 2b$' },
      { id: 'c5', text: '$a^2 + b$' }
    ],
    correctAnswer: 'c2',
    explanation: '$^2\\log 45 = ^2\\log(9 \\times 5) = ^2\\log 3^2 + ^2\\log 5 = 2(^2\\log 3) + ^2\\log 5 = 2a + b$.',
    score: 5
  },
  {
    id: 'q_4',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    questionText: 'Hasil dari $\\frac{^5\\log 100 - ^5\\log 4}{^5\\log 5}$ adalah...',
    choices: [
      { id: 'c1', text: '1' },
      { id: 'c2', text: '2', isCorrect: true },
      { id: 'c3', text: '5' },
      { id: 'c4', text: '10' },
      { id: 'c5', text: '25' }
    ],
    correctAnswer: 'c2',
    explanation: 'Pembilang $= ^5\\log(\\frac{100}{4}) = ^5\\log 25 = 2$. Penyebut $= ^5\\log 5 = 1$. Hasil $= 2/1 = 2$.',
    score: 5
  },
  {
    id: 'q_5',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Akar & Pangkat',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Bentuk sederhana dari $\\sqrt{72} + \\sqrt{50} - \\sqrt{18}$ adalah...',
    choices: [
      { id: 'c1', text: '$6\\sqrt{2}$' },
      { id: 'c2', text: '$7\\sqrt{2}$' },
      { id: 'c3', text: '$8\\sqrt{2}$', isCorrect: true },
      { id: 'c4', text: '$9\\sqrt{2}$' },
      { id: 'c5', text: '$10\\sqrt{2}$' }
    ],
    correctAnswer: 'c3',
    explanation: '$\\sqrt{72} = 6\\sqrt{2}$, $\\sqrt{50} = 5\\sqrt{2}$, $\\sqrt{18} = 3\\sqrt{2}$. Maka $6\\sqrt{2} + 5\\sqrt{2} - 3\\sqrt{2} = 8\\sqrt{2}$.',
    score: 5
  },
  {
    id: 'q_6',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Pecahan & Bentuk Akar',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    questionText: 'Rasionalkan penyebut pecahan berikut: $\\frac{6}{\\sqrt{5} - \\sqrt{2}}$',
    choices: [
      { id: 'c1', text: '$2(\\sqrt{5} + \\sqrt{2})$', isCorrect: true },
      { id: 'c2', text: '$3(\\sqrt{5} + \\sqrt{2})$' },
      { id: 'c3', text: '$2(\\sqrt{5} - \\sqrt{2})$' },
      { id: 'c4', text: '$\\sqrt{5} + \\sqrt{2}$' },
      { id: 'c5', text: '$6(\\sqrt{5} + \\sqrt{2})$' }
    ],
    correctAnswer: 'c1',
    explanation: '$\\frac{6}{\\sqrt{5}-\\sqrt{2}} \\times \\frac{\\sqrt{5}+\\sqrt{2}}{\\sqrt{5}+\\sqrt{2}} = \\frac{6(\\sqrt{5}+\\sqrt{2})}{5-2} = \\frac{6(\\sqrt{5}+\\sqrt{2})}{3} = 2(\\sqrt{5}+\\sqrt{2})$.',
    score: 5
  },
  {
    id: 'q_7',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Matriks',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    questionText: 'Jika matriks $A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$, berapakah determinan matriks $A$ ?',
    choices: [
      { id: 'c1', text: '3' },
      { id: 'c2', text: '5', isCorrect: true },
      { id: 'c3', text: '7' },
      { id: 'c4', text: '8' },
      { id: 'c5', text: '11' }
    ],
    correctAnswer: 'c2',
    explanation: '$\\det(A) = (2 \\cdot 4) - (3 \\cdot 1) = 8 - 3 = 5$.',
    score: 5
  },
  {
    id: 'q_8',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Limit Fungsi',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    questionText: 'Berapakah nilai dari $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$ ?',
    choices: [
      { id: 'c1', text: '0' },
      { id: 'c2', text: '3' },
      { id: 'c3', text: '6', isCorrect: true },
      { id: 'c4', text: '9' },
      { id: 'c5', text: 'Tidak terdefinisi' }
    ],
    correctAnswer: 'c3',
    explanation: '$\\frac{x^2-9}{x-3} = \\frac{(x-3)(x+3)}{x-3} = x+3$. Maka untuk $x \\to 3$, nilainya $3 + 3 = 6$.',
    score: 5
  },
  {
    id: 'q_9',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Trigonometri',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    questionText: 'Identitas trigonometri dasar menyatakan bahwa $\\sin^2 \\theta + \\cos^2 \\theta = 1$ untuk setiap sudut $\\theta$.',
    choices: [
      { id: 'c1', text: 'Benar', isCorrect: true },
      { id: 'c2', text: 'Salah' }
    ],
    correctAnswer: 'c1',
    explanation: 'Benar, ini adalah Teorema Pythagoras pada lingkaran satuan.',
    score: 5
  },
  {
    id: 'q_10',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Integral',
    type: 'SHORT_ANSWER',
    difficulty: 'MEDIUM',
    questionText: 'Hitunglah hasil dari integral tak tentu berikut: $\\int 4x^3 \\, dx$',
    choices: [],
    correctAnswer: 'x^4 + c',
    explanation: '$\\int 4x^3 dx = 4 \\cdot \\frac{x^4}{4} + c = x^4 + c$.',
    score: 5
  },
  {
    id: 'q_11',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    questionText: 'Tentukan himpunan penyelesaian dari persamaan logaritma $^2\\log (x + 3) = 4$.',
    choices: [
      { id: 'c1', text: '$x = 11$' },
      { id: 'c2', text: '$x = 13$', isCorrect: true },
      { id: 'c3', text: '$x = 15$' },
      { id: 'c4', text: '$x = 16$' },
      { id: 'c5', text: '$x = 19$' }
    ],
    correctAnswer: 'c2',
    explanation: '$x + 3 = 2^4 \\Rightarrow x + 3 = 16 \\Rightarrow x = 13$.',
    score: 5
  },
  {
    id: 'q_12',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Fungsi Eksponen',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Jika $f(x) = 3^{x + 1}$, maka nilai dari $f(2)$ adalah...',
    choices: [
      { id: 'c1', text: '9' },
      { id: 'c2', text: '18' },
      { id: 'c3', text: '27', isCorrect: true },
      { id: 'c4', text: '81' },
      { id: 'c5', text: '243' }
    ],
    correctAnswer: 'c3',
    explanation: '$f(2) = 3^{2+1} = 3^3 = 27$.',
    score: 5
  },
  {
    id: 'q_13',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'COMPLEX_MULTIPLE_CHOICE',
    difficulty: 'HARD',
    questionText: 'Manakah dari pernyataan berikut yang BENAR mengenai sifat logaritma? (Pilih semua yang sesuai)',
    choices: [
      { id: 'c1', text: '$^a\\log 1 = 0$', isCorrect: true },
      { id: 'c2', text: '$^a\\log a = 1$', isCorrect: true },
      { id: 'c3', text: '$^a\\log (b + c) = ^a\\log b \\cdot ^a\\log c$' },
      { id: 'c4', text: '$^a\\log (b^k) = k \\cdot ^a\\log b$', isCorrect: true }
    ],
    correctAnswer: ['c1', 'c2', 'c4'],
    explanation: '$^a\\log 1 = 0$, $^a\\log a = 1$, dan $^a\\log (b^k) = k \\cdot ^a\\log b$ adalah sifat valid logaritma.',
    score: 5
  },
  {
    id: 'q_14',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Persamaan Kuadrat',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Akar-akar dari persamaan kuadrat $x^2 - 5x + 6 = 0$ adalah...',
    choices: [
      { id: 'c1', text: '$x = -2$ atau $x = -3$' },
      { id: 'c2', text: '$x = 2$ atau $x = 3$', isCorrect: true },
      { id: 'c3', text: '$x = 1$ atau $x = 6$' },
      { id: 'c4', text: '$x = -1$ atau $x = 6$' },
      { id: 'c5', text: '$x = 2$ atau $x = -3$' }
    ],
    correctAnswer: 'c2',
    explanation: '$(x-2)(x-3) = 0 \\Rightarrow x=2$ atau $x=3$.',
    score: 5
  },
  {
    id: 'q_15',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    questionText: 'Jika $\\log 2 = 0{,}3010$ dan $\\log 3 = 0{,}4771$, maka nilai dari $\\log 12$ adalah...',
    choices: [
      { id: 'c1', text: '$0{,}7781$' },
      { id: 'c2', text: '$1{,}0791$', isCorrect: true },
      { id: 'c3', text: '$1{,}1761$' },
      { id: 'c4', text: '$1{,}2552$' },
      { id: 'c5', text: '$0{,}9030$' }
    ],
    correctAnswer: 'c2',
    explanation: '$\\log 12 = \\log(2^2 \\times 3) = 2 \\log 2 + \\log 3 = 2(0{,}3010) + 0{,}4771 = 0{,}6020 + 0{,}4771 = 1{,}0791$.',
    score: 5
  },
  {
    id: 'q_16',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Geometri',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Luas segitiga dengan alas $8\\text{ cm}$ dan tinggi $6\\text{ cm}$ adalah...',
    choices: [
      { id: 'c1', text: '$14\\text{ cm}^2$' },
      { id: 'c2', text: '$24\\text{ cm}^2$', isCorrect: true },
      { id: 'c3', text: '$32\\text{ cm}^2$' },
      { id: 'c4', text: '$48\\text{ cm}^2$' },
      { id: 'c5', text: '$56\\text{ cm}^2$' }
    ],
    correctAnswer: 'c2',
    explanation: '$L = \\frac{1}{2} \\times a \\times t = \\frac{1}{2} \\times 8 \\times 6 = 24\\text{ cm}^2$.',
    score: 5
  },
  {
    id: 'q_17',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Statistika',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Nilai rata-rata (mean) dari data $4, 6, 8, 10, 12$ adalah...',
    choices: [
      { id: 'c1', text: '6' },
      { id: 'c2', text: '7' },
      { id: 'c3', text: '8', isCorrect: true },
      { id: 'c4', text: '9' },
      { id: 'c5', text: '10' }
    ],
    correctAnswer: 'c3',
    explanation: '$\\bar{x} = \\frac{4+6+8+10+12}{5} = \\frac{40}{5} = 8$.',
    score: 5
  },
  {
    id: 'q_18',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Logaritma',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    questionText: 'Nilai dari $^2\\log 3 \\cdot ^3\\log 5 \\cdot ^5\\log 8$ adalah...',
    choices: [
      { id: 'c1', text: '2' },
      { id: 'c2', text: '3', isCorrect: true },
      { id: 'c3', text: '5' },
      { id: 'c4', text: '8' },
      { id: 'c5', text: '15' }
    ],
    correctAnswer: 'c2',
    explanation: 'Menggunakan sifat perkalian logaritma: $^2\\log 3 \\cdot ^3\\log 5 \\cdot ^5\\log 8 = ^2\\log 8 = 3$.',
    score: 5
  },
  {
    id: 'q_19',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Deret Aritmatika',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    questionText: 'Suku ke-10 dari barisan aritmatika $3, 7, 11, 15, \\dots$ adalah...',
    choices: [
      { id: 'c1', text: '35' },
      { id: 'c2', text: '37' },
      { id: 'c3', text: '39', isCorrect: true },
      { id: 'c4', text: '41' },
      { id: 'c5', text: '43' }
    ],
    correctAnswer: 'c3',
    explanation: '$a = 3$, $b = 4$. $U_{10} = a + 9b = 3 + 9(4) = 3 + 36 = 39$.',
    score: 5
  },
  {
    id: 'q_20',
    bankId: 'bank_log_1',
    subject: 'Matematika',
    grade: 'X',
    material: 'Peluang',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    questionText: 'Peluang munculnya mata dadu genap pada pelemparan sebuah dadu bermata 6 adalah...',
    choices: [
      { id: 'c1', text: '$\\frac{1}{6}$' },
      { id: 'c2', text: '$\\frac{1}{3}$' },
      { id: 'c3', text: '$\\frac{1}{2}$', isCorrect: true },
      { id: 'c4', text: '$\\frac{2}{3}$' },
      { id: 'c5', text: '$\\frac{5}{6}$' }
    ],
    correctAnswer: 'c3',
    explanation: 'Mata dadu genap: $\{2, 4, 6\}$ (3 kejadian). Total $= 6$. Peluang $= \\frac{3}{6} = \\frac{1}{2}$.',
    score: 5
  }
];

export const DEMO_QUESTION_BANK: QuestionBank = {
  id: 'bank_log_1',
  title: 'Bank Soal Logaritma & Aljabar Dasar Kelas X',
  subject: 'Matematika',
  grade: 'X',
  teacherId: 'user_teacher_1',
  questionCount: 20,
  createdAt: '2026-01-18T09:00:00Z'
};

export const DEMO_EXAM: Exam = {
  id: 'exam_logaritma_x',
  title: 'Latihan Logaritma & Aljabar',
  classId: 'class_mtk_x_a',
  className: 'Matematika Kelas X A',
  teacherId: 'user_teacher_1',
  bankId: 'bank_log_1',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  startTime: '07:00',
  endTime: '23:59',
  durationMinutes: 45,
  totalQuestions: 20,
  randomQuestionCount: 20,
  kkm: 75,
  settings: {
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
  },
  status: 'ACTIVE',
  createdAt: '2026-01-20T08:00:00Z'
};
