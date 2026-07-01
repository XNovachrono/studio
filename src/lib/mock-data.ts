
import type { User, StudentProfile, Group, Lesson, BankCard, PQRSMessage, StudentNote, HomeworkSubmission } from "./types";

export const MOCK_USERS: (User | StudentProfile)[] = [
  {
    id: "admin-1",
    username: "admin",
    name: "Administrador Uncoverly",
    email: "Admin@gmail.com",
    role: "admin",
    hasOnboarded: true,
  },
  {
    id: "teacher-1",
    username: "docente",
    name: "Prof. Roberto García",
    email: "docente@gmail.com",
    role: "teacher",
    hasOnboarded: true,
    groupHistory: [],
  },
  {
    id: "student-1",
    username: "estudiante",
    name: "Juan Pérez",
    email: "estudiante@gmail.com",
    role: "student",
    plan: "privado",
    hasOnboarded: true,
    groupId: "group-1",
    level: "B1",
    age: 25,
    phone: "+57 300 123 4567",
    interests: ["Tecnología", "Cine"],
    objective: "Carrera",
    courseStartDate: "2024-01-15",
    courseDuration: 12,
    classesPerWeek: 2,
    scheduledSlots: [
      { date: "2024-05-20", time: "18:00" },
      { date: "2024-05-22", time: "18:00" }
    ]
  },
  {
    id: "student-2",
    username: "maria",
    name: "Maria López",
    email: "maria@test.com",
    role: "student",
    plan: "grupo pequeño",
    hasOnboarded: true,
    groupId: "group-2",
    level: "A2"
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: "group-1",
    name: "Juan Pérez - Business English",
    type: "privado",
    teacherId: "teacher-1",
    teacherName: "Prof. Roberto García",
    studentIds: ["student-1"],
    studentsInfo: [
      { id: "student-1", name: "Juan Pérez", level: "B1", plan: "privado" }
    ],
    mainObjective: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Mejorar la fluidez en entornos corporativos." }] }] },
    weeklyObjectives: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Presentaciones efectivas y vocabulario de finanzas." }] }] },
    content: {
      scheduledClasses: [
        { id: "c1", link: "https://zoom.us/test", time: new Date().toISOString(), name: "Prof. Roberto García" }
      ],
      notes: [],
      reminders: []
    }
  },
  {
    id: "group-2",
    name: "Grupo Básico A2",
    type: "grupo pequeño",
    teacherId: "teacher-1",
    teacherName: "Prof. Roberto García",
    studentIds: ["student-2"],
    studentsInfo: [
      { id: "student-2", name: "Maria López", level: "A2", plan: "grupo pequeño" }
    ],
    mainObjective: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Dominio de tiempos pasados." }] }] },
    weeklyObjectives: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Uso de verbos irregulares." }] }] },
    content: {
      scheduledClasses: [],
      notes: [],
      reminders: []
    }
  }
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    groupId: "group-1",
    name: "L01. Juan Pérez. B1",
    number: 1,
    createdAt: new Date().toISOString(),
    scheduledTime: new Date().toISOString(),
    recording: { link: "https://vimeo.com/76979871" },
    content: { type: "doc", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Introducción a Finanzas" }] }] },
    classNote: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Conceptos clave: ROI, Revenue, EBITDA." }] }] },
    homework: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Leer el artículo adjunto y resumir." }] }] },
    comments: { type: "doc", content: [] },
    studentComments: {},
    attendance: { "student-1": "presente" }
  }
];

export const MOCK_BANK_CARDS: BankCard[] = [
  {
    id: "bank-1",
    type: "objective",
    name: "Objetivo: Entrevistas",
    ownerId: "teacher-1",
    ownerName: "Prof. Roberto García",
    createdAt: new Date().toISOString(),
    level: "B2",
    content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Preparar al estudiante para responder preguntas situacionales." }] }] }
  }
];
