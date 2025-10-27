

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
  groupHistory?: string[]; // Array of group IDs
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
  objective?: string;
  objective_details?: string;
  teacherInteractions?: TeacherInteraction[];
  level?: string;
  courseStartDate?: string; // YYYY-MM-DD
  courseDuration?: number; // in weeks
  classesPerWeek?: number;
  scheduledSlots?: Array<{
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
  }>;
}

export interface StudentGroupInfo {
    id: string;
    name: string;
    level: string;
    plan: StudentPlan;
}


export interface Group {
  id:string;
  name: string;
  type: StudentPlan;
  studentIds: string[];
  studentsInfo: StudentGroupInfo[];
  teacherId: string;
  teacherName: string; 
  mainObjective: EditorContent;
  weeklyObjectives: EditorContent;
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
  time: string | Date; // ISO date string or Date object
  name: string; // Teacher's name
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

export type EditorContent = {
  type: "doc";
  content: {
    type: string;
    content?: any[];
    [key: string]: any;
  }[];
};

export type AttendanceStatus = 'presente' | 'ausente' | { tarde: number };

export interface Lesson {
  id: string;
  groupId: string;
  name: string;
  number: number;
  createdAt: string; // ISO date string
  scheduledTime?: string; // ISO date string, time of the class
  recording: {
    link: string;
  };
  content: EditorContent;
  classNote: EditorContent;
  homework: EditorContent;
  comments: EditorContent;
  studentComments: Record<string, EditorContent>; // Key: studentId
  attendance: Record<string, AttendanceStatus>; // Key: studentId
}

export interface HomeworkSubmission {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  files: { name: string; url: string; path: string; }[];
  submittedAt: string; // ISO date string
  grade?: string;
}

export type BankType = 'objective' | 'homework' | 'image' | 'video' | 'audio';

export interface BankCard {
    id: string;
    type: BankType;
    name: string;
    ownerId: string;
    ownerName: string;
    createdAt: string; // ISO date string
    level?: string;
    content?: EditorContent; 
    fileUrl?: string;
    filePath?: string;
}

export interface StudentNote {
    id: string;
    studentId: string;
    title: string;
    content: EditorContent;
    lessonId?: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}
