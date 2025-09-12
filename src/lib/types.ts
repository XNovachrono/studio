
export type UserRole = 'student' | 'teacher' | 'admin';
export type StudentPlan = 'privado' | 'grupo pequeño' | 'grupo grande';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  plan?: StudentPlan;
  hasOnboarded?: boolean;
  email?: string;
}

export interface TeacherInteraction {
  teacherId: string;
  teacherName: string;
  lastInteraction: string; // ISO date string
}

export interface StudentProfile extends User {
  age?: number;
  phone?: string;
  interests?: string[];
  availability?: string;
  objective?: string;
  objective_details?: string;
  teacherInteractions?: TeacherInteraction[];
  level?: string;
  courseStartDate?: string; // YYYY-MM-DD
  courseDuration?: number; // in weeks
}

export interface Group {
  id: string;
  name: string;
  type: StudentPlan;
  studentIds: string[];
  teacherId: string;
  teacherName: string; 
  content: GroupContent;
}

export interface GroupContent {
  scheduledClasses: ScheduledClass[];
  notes: Note[];
  reminders: Reminder[];
}

export interface ScheduledClass {
  id: string;
  link: string;
  time: string; // ISO date string
}

export interface Note {
  id: string;
  link: string;
  title: string;
}

export interface Reminder {
  id: string;
  message: string;
  teacherName: string;
  sentAt: string; // ISO date string
}

export interface PQRSMessage {
    id: string;
    studentId: string;
    studentEmail: string;
    teacherId: string;
    teacherName: string;
    message: string;
    isAnonymous: boolean;
    createdAt: string; // ISO date string
}


// --- New Lesson System Types ---

// The content for the editor is a JSON object
export type EditorContent = {
  type: "doc";
  content: any[];
};


export interface Lesson {
  id: string;
  groupId: string;
  name: string;
  number: number;
  createdAt: string; // ISO date string
  recording: {
    link: string;
  };
  content: EditorContent;
  classNote: EditorContent;
  homework: EditorContent;
  attendance: Record<string, 'present' | 'absent' | 'late'>; // Key: studentId
}

export interface HomeworkSubmission {
  id: string;
  lessonId: string;
  studentId: string;
  files: { name: string; url: string }[];
  submittedAt: string; // ISO date string
}

// --- Bank System Types ---
export type BankType = 'objective' | 'class' | 'homework' | 'image' | 'video' | 'audio';

export interface BankCard {
    id: string;
    type: BankType;
    name: string;
    ownerId: string; // Teacher or Admin ID
    createdAt: string; // ISO date string
    // For cards with rich text content
    content?: EditorContent; 
    // For file-based cards
    fileUrl?: string;
    filePath?: string;
}
