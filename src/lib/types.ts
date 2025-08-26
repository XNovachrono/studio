export type UserRole = 'student' | 'teacher';
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
  interests?: string[];
  availability?: string;
  objective?: string;
  objective_details?: string;
  teacherInteractions?: TeacherInteraction[];
}

export interface Group {
  id: string; // 7-digit unique ID
  name: string;
  type: StudentPlan;
  studentIds: string[];
  teacherId: string;
  teacherName?: string; // It's useful to have it here
  content: GroupContent;
}

export interface GroupContent {
  scheduledClasses: ScheduledClass[];
  notes: Note[];
  books: Book[];
}

export interface ScheduledClass {
  id: string;
  link: string;
  time: string;
}

export interface Note {
  id: string;
  link: string;
  title: string;
}

export interface Book {
  id: string;
  title: string;
  chapters: BookChapter[];
}

export interface BookChapter {
  id: string;
  name: string;
  pdfUrl: string;
}

export interface PQRSMessage {
    studentId: string;
    studentEmail: string;
    teacherId: string;
    message: string;
    isAnonymous: boolean;
    createdAt: string; // ISO date string
}
