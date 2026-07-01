
import { MOCK_USERS, MOCK_GROUPS, MOCK_LESSONS, MOCK_BANK_CARDS } from "./mock-data";
import type { User, StudentProfile, Group, Lesson, BankCard, PQRSMessage, StudentNote, HomeworkSubmission, UserRole, BankType, AttendanceStatus } from "./types";

// In-memory "Database" that attempts to persist to localStorage for the presentation
const getStore = (key: string, initial: any) => {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(`uncoverly_mock_${key}`);
    return stored ? JSON.parse(stored) : initial;
};

const saveStore = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(`uncoverly_mock_${key}`, JSON.stringify(data));
    }
};

let users = getStore('users', MOCK_USERS);
let groups = getStore('groups', MOCK_GROUPS);
let lessons = getStore('lessons', MOCK_LESSONS);
let bankCards = getStore('bank_cards', MOCK_BANK_CARDS);
let pqrs: PQRSMessage[] = getStore('pqrs', []);
let studentNotes: StudentNote[] = getStore('student_notes', []);
let homeworkSubmissions: HomeworkSubmission[] = getStore('submissions', []);

export const getUserProfile = async (userId: string): Promise<User | null> => {
    return users.find((u: any) => u.id === userId) || null;
};

export const updateUserProfile = async (userId: string, data: Partial<StudentProfile | User>): Promise<void> => {
    users = users.map((u: any) => u.id === userId ? { ...u, ...data } : u);
    saveStore('users', users);
};

export const getStudentData = async (userId: string): Promise<{ user: StudentProfile, group: Group | null }> => {
    const user = users.find((u: any) => u.id === userId) as StudentProfile;
    const group = groups.find((g: any) => g.id === user?.groupId) || null;
    return { user, group };
};

export const getTeacherDataForDashboard = async (teacherId: string) => {
    const teacher = users.find((u: any) => u.id === teacherId) as User;
    const activeGroups = groups.filter((g: any) => g.teacherId === teacherId);
    const history = groups.filter((g: any) => teacher.groupHistory?.includes(g.id));
    return { teacher, groups: activeGroups, groupHistory: history };
};

export const getLessonsForGroup = async (groupId: string): Promise<Lesson[]> => {
    return lessons.filter((l: any) => l.groupId === groupId);
};

export const createLessonForGroup = async (groupId: string, groupName: string, students: StudentProfile[], scheduledTime: string): Promise<void> => {
    const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        groupId,
        name: `L${lessons.length + 1}.${groupName}`,
        number: lessons.length + 1,
        createdAt: new Date().toISOString(),
        scheduledTime,
        recording: { link: "" },
        content: { type: "doc", content: [] },
        classNote: { type: "doc", content: [] },
        homework: { type: "doc", content: [] },
        comments: { type: "doc", content: [] },
        studentComments: {},
        attendance: {},
    };
    lessons.push(newLesson);
    saveStore('lessons', lessons);
};

export const updateLesson = async (groupId: string, lessonId: string, data: Partial<Lesson>): Promise<void> => {
    lessons = lessons.map((l: any) => l.id === lessonId ? { ...l, ...data } : l);
    saveStore('lessons', lessons);
};

export const getBankCards = async (type: BankType): Promise<BankCard[]> => {
    return bankCards.filter((c: any) => c.type === type);
};

export const createBankCard = async (data: Omit<BankCard, 'id' | 'createdAt'>): Promise<string> => {
    const newCard: BankCard = {
        id: `card-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
    };
    bankCards.push(newCard);
    saveStore('bank_cards', bankCards);
    return newCard.id;
};

export const updateBankCard = async (cardId: string, data: Partial<BankCard>): Promise<void> => {
    bankCards = bankCards.map((c: any) => c.id === cardId ? { ...c, ...data } : c);
    saveStore('bank_cards', bankCards);
};

export const deleteBankCard = async (cardId: string): Promise<void> => {
    bankCards = bankCards.filter((c: any) => c.id !== cardId);
    saveStore('bank_cards', bankCards);
};

export const submitPQRS = async (pqrsData: any): Promise<void> => {
    const newPqrs = { id: `pqrs-${Date.now()}`, ...pqrsData, createdAt: new Date().toISOString() };
    pqrs.push(newPqrs);
    saveStore('pqrs', pqrs);
};

export const getAllPqrsMessages = async () => pqrs;

export const deletePQRSMessage = async (id: string) => {
    pqrs = pqrs.filter(p => p.id !== id);
    saveStore('pqrs', pqrs);
};

export const createStudentNote = async (data: any) => {
    const newNote = { id: `note-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    studentNotes.push(newNote);
    saveStore('student_notes', studentNotes);
};

export const getStudentNotes = async (studentId: string) => studentNotes.filter(n => n.studentId === studentId);

export const updateStudentNote = async (id: string, data: any) => {
    studentNotes = studentNotes.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n);
    saveStore('student_notes', studentNotes);
};

export const deleteStudentNote = async (id: string) => {
    studentNotes = studentNotes.filter(n => n.id !== id);
    saveStore('student_notes', studentNotes);
};

export const getUsersInRole = async (role: UserRole) => users.filter((u: any) => u.role === role);

export const getAllGroups = async () => groups;

export const createGroupWithTeacher = async (teacher: User, students: StudentProfile[], plan: any) => {
    const newGroupId = `group-${Date.now()}`;
    const newGroup: Group = {
        id: newGroupId,
        name: students.map(s => s.name).join(', '),
        type: plan,
        teacherId: teacher.id,
        teacherName: teacher.name,
        studentIds: students.map(s => s.id),
        studentsInfo: students.map(s => ({ id: s.id, name: s.name, level: s.level || 'N/A', plan })),
        mainObjective: { type: "doc", content: [] },
        weeklyObjectives: { type: "doc", content: [] },
        content: { scheduledClasses: [], notes: [], reminders: [] },
    };
    groups.push(newGroup);
    saveStore('groups', groups);
    
    users = users.map((u: any) => students.some(s => s.id === u.id) ? { ...u, groupId: newGroupId } : u);
    saveStore('users', users);
};

export const updateGroupTeacherAndHistory = async (groupId: string, newTeacherId: string, newTeacherName: string, oldTeacherId: string) => {
    groups = groups.map((g: any) => g.id === groupId ? { ...g, teacherId: newTeacherId, teacherName: newTeacherName } : g);
    saveStore('groups', groups);
};

export const removeStudentsFromGroup = async (groupId: string, studentIds: string[]) => {
    groups = groups.map((g: any) => g.id === groupId ? { 
        ...g, 
        studentIds: g.studentIds.filter((id: string) => !studentIds.includes(id)),
        studentsInfo: g.studentsInfo.filter((s: any) => !studentIds.includes(s.id))
    } : g);
    saveStore('groups', groups);
    users = users.map((u: any) => studentIds.includes(u.id) ? { ...u, groupId: null } : u);
    saveStore('users', users);
};

export const updateGroupObjectives = async (groupId: string, data: any) => {
    groups = groups.map((g: any) => g.id === groupId ? { ...g, ...data } : g);
    saveStore('groups', groups);
};

export const getHomeworkSubmissionsForLesson = async (lessonIds: string[]) => homeworkSubmissions.filter(s => lessonIds.includes(s.lessonId));

export const createOrUpdateHomeworkSubmission = async (studentId: string, lessonId: string, data: any) => {
    const existing = homeworkSubmissions.find(s => s.studentId === studentId && s.lessonId === lessonId);
    if (existing) {
        homeworkSubmissions = homeworkSubmissions.map(s => s.id === existing.id ? { ...s, ...data, submittedAt: new Date().toISOString() } : s);
    } else {
        homeworkSubmissions.push({ id: `sub-${Date.now()}`, studentId, lessonId, ...data, submittedAt: new Date().toISOString() });
    }
    saveStore('submissions', homeworkSubmissions);
};

export const addContentToGroup = async (groupId: string, type: string, data: any, teacherName: string) => {
    if (type === 'scheduledClass') {
        const newClass = { id: `c-${Date.now()}`, ...data, name: teacherName };
        groups = groups.map((g: any) => g.id === groupId ? { ...g, content: { ...g.content, scheduledClasses: [...g.content.scheduledClasses, newClass] } } : g);
        saveStore('groups', groups);
        await createLessonForGroup(groupId, groups.find((g:any) => g.id === groupId)!.name, [], data.time);
    }
};

export const uploadHomeworkFile = async (sId: string, lId: string, file: File) => ({ downloadURL: "https://picsum.photos/200", filePath: "mock/path" });
export const uploadBankFile = async (oId: string, oName: string, type: any, file: File, onProgress: any) => {
    onProgress(100);
    await createBankCard({ ownerId: oId, ownerName: oName, type, name: file.name, fileUrl: "https://picsum.photos/300", filePath: "mock/path" });
};
export const getBankFiles = async (type: any) => bankCards.filter((c: any) => c.type === type && c.fileUrl);
export const deleteBankFile = async (id: string) => deleteBankCard(id);
