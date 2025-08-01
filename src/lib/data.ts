import type { User, StudentProfile, Group, StudentPlan } from '@/lib/types';

export const users: User[] = [
  { id: '1', username: 'student1', name: 'Ana García', role: 'student', plan: 'privado', hasOnboarded: false, email: 'ana.garcia@email.com' },
  { id: '2', username: 'student2', name: 'Carlos Rodriguez', role: 'student', plan: 'grupo pequeño', hasOnboarded: true, email: 'carlos.r@email.com' },
  { id: '3', username: 'student3', name: 'Beatriz López', role: 'student', plan: 'grupo pequeño', hasOnboarded: true, email: 'beatriz.l@email.com' },
  { id: '4', username: 'student4', name: 'David Martinez', role: 'student', plan: 'grupo grande', hasOnboarded: true, email: 'david.m@email.com' },
  { id: '5', username: 'student5', name: 'Elena Fernandez', role: 'student', plan: 'privado', hasOnboarded: true, email: 'elena.f@email.com' },
  { id: '6', username: 'teacher1', name: 'Profesor Davis', role: 'teacher', email: 'prof.davis@uncoverly.com' },
];

export const students: StudentProfile[] = [
  { id: '2', username: 'student2', name: 'Carlos Rodriguez', role: 'student', plan: 'grupo pequeño', hasOnboarded: true, email: 'carlos.r@email.com', age: 25, interests: ['Tecnología', 'Cine'], availability: 'L-V, 18:00-21:00', objective: 'Viajes' },
  { id: '3', username: 'student3', name: 'Beatriz López', role: 'student', plan: 'grupo pequeño', hasOnboarded: true, email: 'beatriz.l@email.com', age: 22, interests: ['Arte', 'Literatura'], availability: 'S-D, 10:00-13:00', objective: 'Carrera' },
  { id: '4', username: 'student4', name: 'David Martinez', role: 'student', plan: 'grupo grande', hasOnboarded: true, email: 'david.m@email.com', age: 30, interests: ['Finanzas', 'Emprendimiento', 'Política'], availability: 'L-M-X, 20:00-23:00', objective: 'Examen' },
  { id: '5', username: 'student5', name: 'Elena Fernandez', role: 'student', plan: 'privado', hasOnboarded: true, email: 'elena.f@email.com', age: 28, interests: ['Medicina'], availability: 'J-V, 09:00-12:00', objective: 'Otro', objective_details: 'Comunicación con pacientes' },
];

export const initialGroups: Group[] = [
    {
        id: '1827364',
        name: 'Grupo Mañanas',
        type: 'grupo pequeño',
        studentIds: ['2', '3'],
        teacherId: '6',
        content: {
            scheduledClasses: [{ id: 'c1', link: 'https://meet.google.com/xyz-abc-def', time: '2024-08-15T09:00:00' }],
            notes: [{ id: 'n1', link: 'https://www.notion.so/sample-note-1', title: 'Resumen Clase 1' }],
            books: [
                { id: 'b1', title: 'English Grammar in Use', chapters: [{ id: 'ch1', name: 'Chapter 1: Present Continuous', pdfUrl: '/books/chapter1.pdf' }] }
            ]
        }
    }
];

export const INTEREST_CATEGORIES = [
  'Tecnología', 'Psicología', 'Derecho', 'Medicina', 'Diseño', 'Arte', 'Música', 'Cine', 'Literatura', 'Finanzas', 'Educación', 'Ciencias Sociales', 'Ciencias Naturales', 'Filosofía', 'Ingeniería', 'Marketing', 'Emprendimiento', 'Historia', 'Deporte', 'Política'
];

export const LEARNING_OBJECTIVES = [
    'Viajes', 'Carrera', 'Examen', 'Hobby', 'Otro'
];
