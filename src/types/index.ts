export type UserRole = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade: string;
  code: string; // e.g. MTK-XA-4827
  teacherId: string;
  teacherName: string;
  description?: string;
  createdAt: string;
  studentCount?: number;
}

export interface ClassMember {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface Material {
  id: string;
  classId: string;
  className: string;
  title: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  teacherId: string;
}

export type QuestionType = 
  | 'MULTIPLE_CHOICE'
  | 'COMPLEX_MULTIPLE_CHOICE' // Multiple answers
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'ESSAY';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionChoice {
  id: string;
  text: string;
  isCorrect?: boolean; // Hidden from student exam payload
}

export interface Question {
  id: string;
  bankId: string;
  subject: string;
  grade: string;
  material: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  imageUrl?: string;
  choices?: QuestionChoice[];
  correctAnswer?: string | string[] | boolean; // Omitted in student exam context
  explanation?: string;
  score: number;
}

export interface QuestionBank {
  id: string;
  title: string;
  subject: string;
  grade: string;
  teacherId: string;
  questionCount: number;
  createdAt: string;
}

export interface ExamSettings {
  randomizeQuestions: boolean;
  randomizeChoices: boolean;
  showScoreImmediately: boolean;
  showDiscussion: boolean;
  allowBackNavigation: boolean;
  proctoringEnabled: boolean;
  monitorTabSwitch: boolean;
  monitorPaste: boolean;
  monitorFullscreen: boolean;
  allowRealtimeWarnings: boolean;
  maxTabSwitchesForAlert?: number;
  pasteMode: 'ALLOW' | 'BLOCK' | 'MONITOR_ONLY';
}

export interface Exam {
  id: string;
  title: string;
  classId: string;
  className: string;
  teacherId: string;
  bankId?: string;
  startDate: string; // ISO
  endDate: string; // ISO
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  totalQuestions: number;
  randomQuestionCount?: number;
  kkm: number;
  settings: ExamSettings;
  status: 'DRAFT' | 'ACTIVE' | 'ENDED';
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  currentQuestionIndex: number;
  flaggedQuestionIds: string[]; // Ragu-ragu
  answers: Record<string, any>; // questionId -> answer
  score?: number;
  maxScore?: number;
  passed?: boolean;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isOnline: boolean;
  lastPingAt: string;
}

export type EventType = 
  | 'EXAM_STARTED'
  | 'TAB_HIDDEN'
  | 'TAB_VISIBLE'
  | 'FOCUS_LOST'
  | 'FOCUS_GAINED'
  | 'FULLSCREEN_EXIT'
  | 'FULLSCREEN_ENTER'
  | 'PASTE_DETECTED'
  | 'COPY_DETECTED'
  | 'OFFLINE_DETECTED'
  | 'RECONNECTED'
  | 'EXAM_SUBMITTED';

export interface MonitorEvent {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  attemptId: string;
  eventType: EventType;
  timestamp: string; // ISO
  questionNumber?: number;
  durationAwaySeconds?: number;
  details?: string;
}

export type MessageType = 
  | 'SYSTEM'
  | 'TEACHER_COMMENT'
  | 'TEACHER_WARNING'
  | 'STUDENT_RESPONSE';

export type SeverityLevel = 'INFO' | 'PERINGATAN' | 'SERIOUS';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface TeacherMessage {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string; // 'ALL' if broadcast
  studentName?: string;
  examId: string;
  attemptId?: string;
  type: MessageType;
  severity: SeverityLevel;
  message: string;
  relatedEventId?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  status: MessageStatus;
}

export interface StudentResponse {
  id: string;
  messageId: string;
  examId: string;
  studentId: string;
  studentName: string;
  responseType: 'UNDERSTOOD' | 'EXPLANATION';
  explanationText?: string;
  timestamp: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  kkm: number;
  passed: boolean;
  durationSpentMinutes: number;
  submittedAt: string;
  tabSwitchCount: number;
  pasteCount: number;
  focusLossCount: number;
  fullscreenExitCount: number;
  warningCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
