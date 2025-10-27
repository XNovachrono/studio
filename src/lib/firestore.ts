

import { 
    doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, writeBatch, arrayUnion, Timestamp, deleteDoc, arrayRemove, addDoc, orderBy, collectionGroup
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "./firebase";
import type { User, StudentProfile, Group, StudentPlan, TeacherInteraction, PQRSMessage, Reminder, Lesson, EditorContent, BankCard, BankType, ScheduledClass, StudentNote, UserRole, StudentGroupInfo, HomeworkSubmission } from "./types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const storage = getStorage();

const fromDoc = <T extends { createdAt: any, updatedAt?: any }>(doc: any): T => {
    const data = doc.data();
    const result: any = {
        id: doc.id,
        ...data,
    };

    if (data.createdAt) {
        if (data.createdAt.toDate) {
            result.createdAt = (data.createdAt as Timestamp).toDate().toISOString();
        } else {
            result.createdAt = data.createdAt;
        }
    }
    
    if (data.updatedAt) {
        if (data.updatedAt.toDate) {
            result.updatedAt = (data.updatedAt as Timestamp).toDate().toISOString();
        } else {
            result.updatedAt = data.updatedAt;
        }
    }
    
    return result as T;
};

const lessonFromDoc = (doc: any): Lesson => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        scheduledTime: data.scheduledTime instanceof Timestamp ? data.scheduledTime.toDate().toISOString() : data.scheduledTime,
    } as Lesson;
};

const bankCardFromDoc = (doc: any): BankCard => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as BankCard;
};

const pqrsFromDoc = (doc: any): PQRSMessage => {
    const data = doc.data();
    const teacherName = data.teacherName || "N/A";
    return {
        id: doc.id,
        ...data,
        studentEmail: data.studentEmail || 'No proporcionado',
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        teacherName: teacherName,
    } as PQRSMessage;
}

const submissionFromDoc = (doc: any): HomeworkSubmission => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(),
    } as HomeworkSubmission;
}

export const getUserProfile = async (userId: string): Promise<User | null> => {
    const userDocRef = doc(db, "users", userId);
    try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.teacherInteractions) {
                userData.teacherInteractions = userData.teacherInteractions.map((interaction: any) => ({
                    ...interaction,
                    lastInteraction: interaction.lastInteraction instanceof Timestamp 
                        ? interaction.lastInteraction.toDate().toISOString() 
                        : interaction.lastInteraction,
                }));
            }
            return { id: userDocSnap.id, ...userData } as User;
        }
        return null;
    } catch (serverError) {
         const error = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}

export const updateUserProfile = async (userId: string, data: Partial<StudentProfile | User>): Promise<void> => {
    const userDocRef = doc(db, "users", userId);
    try {
        await updateDoc(userDocRef, data);
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}

export const getStudentData = async (userId: string): Promise<{ user: StudentProfile, group: Group | null }> => {
    const user = await getUserProfile(userId) as StudentProfile;
    if (!user) throw new Error("Student profile not found.");

    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("studentIds", "array-contains", userId));
    
    try {
        const querySnapshot = await getDocs(q);

        let group: Group | null = null;
        if (!querySnapshot.empty) {
            const groupDoc = querySnapshot.docs[0];
            const groupData = groupDoc.data() as Omit<Group, 'id'>;
            
            if (groupData.content.scheduledClasses) {
                groupData.content.scheduledClasses = groupData.content.scheduledClasses.map(c => ({
                    ...c,
                    time: c.time instanceof Timestamp ? c.time.toDate().toISOString() : c.time,
                }));
            }
            if (groupData.content.reminders) {
                 groupData.content.reminders = groupData.content.reminders.map(r => ({
                    ...r,
                    sentAt: r.sentAt instanceof Timestamp ? r.sentAt.toDate().toISOString() : r.sentAt,
                }));
            }
            group = { id: groupDoc.id, ...groupData };
        }
    
        return { user, group };
    } catch (serverError) {
         const error = new FirestorePermissionError({
            path: groupsRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }

}


export const submitPQRS = async (pqrsData: Omit<PQRSMessage, 'createdAt' | 'id' | 'teacherName'>): Promise<void> => {
    const teacherProfile = await getUserProfile(pqrsData.teacherId);
    if (!teacherProfile) {
        throw new Error("Teacher not found");
    }

    const pqrsCollectionRef = collection(db, 'pqrs');
    const data = {
        ...pqrsData,
        teacherName: teacherProfile.name,
        createdAt: Timestamp.now(),
    };
    
    addDoc(pqrsCollectionRef, data).catch(serverError => {
        const error = new FirestorePermissionError({
            path: pqrsCollectionRef.path,
            operation: 'create',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', error);
    });
};

export const createStudentNote = async (data: Omit<StudentNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const notesRef = collection(db, "student_notes");
    const noteData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    
    addDoc(notesRef, noteData).catch(serverError => {
        const error = new FirestorePermissionError({
            path: notesRef.path,
            operation: 'create',
            requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', error);
    });
}

export const getStudentNotes = async (studentId: string): Promise<StudentNote[]> => {
    const notesRef = collection(db, "student_notes");
    const q = query(notesRef, where("studentId", "==", studentId));
    
    try {
        const querySnapshot = await getDocs(q);
        const notes = querySnapshot.docs.map(doc => fromDoc<StudentNote>(doc));
        return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (serverError) {
         const error = new FirestorePermissionError({
            path: notesRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}

export const updateStudentNote = async (noteId: string, data: Partial<StudentNote>) => {
    const noteRef = doc(db, "student_notes", noteId);
    const noteData = {
        ...data,
        updatedAt: Timestamp.now(),
    };
    
    try {
        await updateDoc(noteRef, noteData);
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: noteRef.path,
            operation: 'update',
            requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}

export const deleteStudentNote = async (noteId: string) => {
    const noteRef = doc(db, "student_notes", noteId);
    
    try {
        await deleteDoc(noteRef);
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: noteRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}

export const getAllPqrsMessages = async (): Promise<PQRSMessage[]> => {
    const pqrsRef = collection(db, "pqrs");
    const q = query(pqrsRef, orderBy("createdAt", "desc"));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(pqrsFromDoc);
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: pqrsRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const deletePQRSMessage = async (messageId: string): Promise<void> => {
    const pqrsDocRef = doc(db, "pqrs", messageId);
    try {
        await deleteDoc(pqrsDocRef);
    } catch (serverError) {
         const error = new FirestorePermissionError({ path: pqrsDocRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};


export const getUsersInRole = async (role: UserRole): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("role", "==", role));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: usersRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const getAllGroups = async (): Promise<Group[]> => {
    const groupsRef = collection(db, "groups");
    try {
        const groupsSnap = await getDocs(groupsRef);
        const groups = groupsSnap.docs.map(d => {
            const groupData = d.data() as Omit<Group, 'id'>;
            if (groupData.content?.scheduledClasses) {
                groupData.content.scheduledClasses = groupData.content.scheduledClasses.map(c => ({
                    ...c,
                    time: c.time instanceof Timestamp ? c.time.toDate().toISOString() : c.time,
                }));
            }
            return { id: d.id, ...groupData } as Group
        });
        return groups;
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: groupsRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}

export const getAllBankCards = async (): Promise<BankCard[]> => {
    const bankCardsRef = collection(db, "bank_cards");
    try {
        const bankCardsSnap = await getDocs(bankCardsRef);
        return bankCardsSnap.docs.map(bankCardFromDoc);
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: bankCardsRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}


export const createGroupWithTeacher = async (teacher: User, students: StudentProfile[], plan: StudentPlan) => {
    const studentIds = students.map(s => s.id);
    const studentNames = students.map(s => s.name);
    
    const studentsInfo: StudentGroupInfo[] = students.map(s => ({
        id: s.id,
        name: s.name,
        level: s.level || 'N/A',
        plan: s.plan!,
    }));

    const groupName = studentNames.join(', ');

    const newGroupRef = doc(collection(db, "groups"));
    const batch = writeBatch(db);

    const defaultObjectiveContent: EditorContent = { type: "doc", content: [{ type: "paragraph" }] };

    const groupData = {
        name: groupName,
        type: plan,
        teacherId: teacher.id,
        teacherName: teacher.name,
        studentIds,
        studentsInfo,
        mainObjective: defaultObjectiveContent,
        weeklyObjectives: defaultObjectiveContent,
        content: {
            scheduledClasses: [],
            notes: [],
            reminders: [],
        },
    };

    batch.set(newGroupRef, groupData);

    try {
        await batch.commit();
    } catch (serverError) {
         const error = new FirestorePermissionError({
            path: newGroupRef.path,
            operation: 'create',
            requestResourceData: groupData,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const getTeacherDataForDashboard = async (teacherId: string): Promise<{
    teacher: User,
    groups: Group[],
    groupHistory: Group[],
}> => {
    const teacherProfile = await getUserProfile(teacherId);
    if (!teacherProfile) throw new Error("Teacher profile not found.");
    
    const groupsRef = collection(db, "groups");
    
    const qGroups = query(groupsRef, where("teacherId", "==", teacherId));
    let groups: Group[] = [];
    try {
        const groupsSnap = await getDocs(qGroups);
        groups = groupsSnap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Group, 'id'>)
        }));
    } catch(serverError) {
        const error = new FirestorePermissionError({ path: groupsRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
    
    let groupHistory: Group[] = [];
    const historyIds = teacherProfile?.groupHistory || [];
    if (historyIds.length > 0) {
        try {
            const historyChunks: string[][] = [];
            for (let i = 0; i < historyIds.length; i += 30) {
                historyChunks.push(historyIds.slice(i, i + 30));
            }
            const historyPromises = historyChunks.map(chunk => getDocs(query(collection(db, "groups"), where("__name__", "in", chunk))));
            const historySnapshots = await Promise.all(historyPromises);
    
            historySnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                     groupHistory.push({ id: doc.id, ...doc.data() } as Group);
                });
            });
        } catch (serverError) {
            const error = new FirestorePermissionError({ path: groupsRef.path, operation: 'list' });
            errorEmitter.emit('permission-error', error);
            throw error;
        }
    }

    return { teacher: teacherProfile, groups, groupHistory };
}

export const updateGroupObjectives = async (groupId: string, data: { mainObjective?: EditorContent, weeklyObjectives?: EditorContent }): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    try {
        await updateDoc(groupRef, data);
    } catch (serverError) {
         const error = new FirestorePermissionError({
            path: groupRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const getLessonsForGroup = async (groupId: string): Promise<Lesson[]> => {
    const lessonsRef = collection(db, "groups", groupId, "lessons");
    const q = query(lessonsRef, orderBy("number", "asc"));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(lessonFromDoc);
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: lessonsRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

const defaultContent: EditorContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

export const createLessonForGroup = async (groupId: string, groupName: string, students: StudentProfile[], scheduledTime: string): Promise<void> => {
    const lessonsRef = collection(db, "groups", groupId, "lessons");
    const lessonsSnap = await getDocs(lessonsRef);
    const lessonNumber = lessonsSnap.size + 1;

    const levels = students.map(s => s.level).filter(Boolean) as string[];
    const avgLevel = levels.length > 0 ? levels[0] : 'N/A';
    
    const newLessonName = `L${lessonNumber.toString().padStart(2, '0')}.${groupName}.${avgLevel}`;

    const newLesson: Omit<Lesson, 'id'> = {
        groupId,
        name: newLessonName,
        number: lessonNumber,
        createdAt: Timestamp.now() as any,
        scheduledTime,
        recording: { link: "" },
        content: defaultContent,
        classNote: defaultContent,
        homework: defaultContent,
        comments: defaultContent,
        studentComments: {},
        attendance: {},
    };

    addDoc(lessonsRef, newLesson).catch(serverError => {
        const error = new FirestorePermissionError({
            path: lessonsRef.path,
            operation: 'create',
            requestResourceData: newLesson,
        });
        errorEmitter.emit('permission-error', error);
    });
};

export const updateLesson = async (groupId: string, lessonId: string, data: Partial<Lesson>): Promise<void> => {
    const lessonRef = doc(db, "groups", groupId, "lessons", lessonId);
    try {
        await updateDoc(lessonRef, data);
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: lessonRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const getBankCards = async (type: BankType): Promise<BankCard[]> => {
    const bankRef = collection(db, "bank_cards");
    const q = query(bankRef, where("type", "==", type));
    try {
        const querySnapshot = await getDocs(q);
        const cards = querySnapshot.docs.map(bankCardFromDoc);
        return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: bankRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const getBankFiles = async (type: 'image' | 'video' | 'audio'): Promise<BankCard[]> => {
    const bankRef = collection(db, "bank_cards");
    const q = query(bankRef, where("type", "==", type));
    try {
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(bankCardFromDoc);
        return files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: bankRef.path, operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
}

export const createBankCard = async (data: Omit<BankCard, 'id' | 'createdAt'>): Promise<string> => {
    const bankRef = collection(db, "bank_cards");
    const cardData = {
        ...data,
        createdAt: Timestamp.now(),
    };
    try {
        const newCardRef = await addDoc(bankRef, cardData);
        return newCardRef.id;
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: bankRef.path,
            operation: 'create',
            requestResourceData: cardData,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const updateBankCard = async (cardId: string, data: Partial<BankCard>): Promise<void> => {
    const cardRef = doc(db, "bank_cards", cardId);
    try {
        await updateDoc(cardRef, data);
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: cardRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const deleteBankCard = async (cardId: string): Promise<void> => {
    const cardRef = doc(db, "bank_cards", cardId);
    try {
        await deleteDoc(cardRef);
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: cardRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const uploadBankFile = (ownerId: string, ownerName: string, type: BankType, file: File, onProgress: (progress: number) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filePath = `${ownerId}/${type}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (!snapshot) return;
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await createBankCard({
                ownerId,
                ownerName,
                type,
                name: file.name,
                fileUrl: downloadURL,
                filePath: filePath,
            });
            resolve();
        } catch (error) {
            reject(error);
        }
      }
    );
  });
};

export const deleteBankFile = async (cardId: string, filePath: string): Promise<void> => {
    const storageRef = ref(storage, filePath);
    try {
        await deleteObject(storageRef);
    } catch(e) {
        console.warn(`Could not delete file from storage: ${filePath}`, e);
    }
    
    await deleteBankCard(cardId);
}

export const addContentToGroup = async (
    groupId: string, 
    type: 'scheduledClass',
    data: any,
    teacherName: string,
) => {
    const groupRef = doc(db, "groups", groupId);
    
    if (type === 'scheduledClass') {
        const classDate = new Date(data.time);
        const scheduledClass: ScheduledClass = {
             id: `c${Date.now()}`,
             link: data.link, 
             time: Timestamp.fromDate(classDate) as any,
             name: teacherName,
        };
        try {
            await updateDoc(groupRef, {
                'content.scheduledClasses': arrayUnion(scheduledClass)
            });
            
            const groupSnap = await getDoc(groupRef);
            const groupData = groupSnap.data() as Group;
            const students = (groupData.studentsInfo || []).map(s => ({...s, role: 'student'} as StudentProfile));
            
            await createLessonForGroup(groupId, groupData.name, students, classDate.toISOString());

        } catch (serverError) {
             const error = new FirestorePermissionError({
                path: groupRef.path,
                operation: 'update',
                requestResourceData: { 'content.scheduledClasses': arrayUnion(scheduledClass) },
            });
            errorEmitter.emit('permission-error', error);
            throw error;
        }
    }
};

export const dissolveGroup = async (groupId: string): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    try {
        await deleteDoc(groupRef);
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: groupRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const addStudentsToGroup = async (groupId: string, students: StudentProfile[]): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    const studentIds = students.map(s => s.id);
    const studentsInfo = students.map(s => ({
        id: s.id,
        name: s.name,
        level: s.level || 'N/A',
        plan: s.plan!,
    }));
    try {
        await updateDoc(groupRef, {
            studentIds: arrayUnion(...studentIds),
            studentsInfo: arrayUnion(...studentsInfo)
        });
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: groupRef.path,
            operation: 'update',
            requestResourceData: { studentIds: arrayUnion(...studentIds) },
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const removeStudentsFromGroup = async (groupId: string, studentIds: string[]): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    
    try {
        const groupSnap = await getDoc(groupRef);
        const groupData = groupSnap.data() as Group;
        const remainingStudentsInfo = groupData.studentsInfo.filter(info => !studentIds.includes(info.id));
    
        await updateDoc(groupRef, {
            studentIds: arrayRemove(...studentIds),
            studentsInfo: remainingStudentsInfo
        });
    } catch (serverError) {
         const error = new FirestorePermissionError({
            path: groupRef.path,
            operation: 'update',
            requestResourceData: { studentIds: arrayRemove(...studentIds) },
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const updateGroupTeacherAndHistory = async (groupId: string, newTeacherId: string, newTeacherName: string, oldTeacherId: string) => {
    const batch = writeBatch(db);

    const groupRef = doc(db, "groups", groupId);
    batch.update(groupRef, { teacherId: newTeacherId, teacherName: newTeacherName });

    const oldTeacherRef = doc(db, "users", oldTeacherId);
    batch.update(oldTeacherRef, { groupHistory: arrayUnion(groupId) });

    const newTeacherRef = doc(db, "users", newTeacherId);
    batch.update(newTeacherRef, { groupHistory: arrayRemove(groupId) });

    try {
        await batch.commit();
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: `BATCH WRITE on ${groupRef.path}, ${oldTeacherRef.path}, ${newTeacherRef.path}`,
            operation: 'update',
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const uploadHomeworkFile = async (studentId: string, lessonId: string, file: File): Promise<{ downloadURL: string, filePath: string }> => {
    const filePath = `homework/${lessonId}/${studentId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    
    const uploadTask = await uploadBytesResumable(storageRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    return { downloadURL, filePath };
};

export const getHomeworkSubmissionsForLesson = async (lessonIds: string[], studentId?: string): Promise<HomeworkSubmission[]> => {
    const submissionsRef = collectionGroup(db, 'homework_submissions');
    let q;
    if (studentId) {
        q = query(submissionsRef, where('lessonId', 'in', lessonIds), where('studentId', '==', studentId));
    } else {
        q = query(submissionsRef, where('lessonId', 'in', lessonIds));
    }

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(submissionFromDoc);
    } catch (serverError) {
        const error = new FirestorePermissionError({ path: 'homework_submissions', operation: 'list' });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};

export const createOrUpdateHomeworkSubmission = async (studentId: string, lessonId: string, data: Partial<Omit<HomeworkSubmission, 'id' | 'submittedAt'>>): Promise<void> => {
    const submissionsRef = collection(db, 'lessons', lessonId, 'homework_submissions');
    const q = query(submissionsRef, where('studentId', '==', studentId));

    try {
        const querySnapshot = await getDocs(q);
        const dataToSave = {
            ...data,
            studentId,
            lessonId,
            submittedAt: Timestamp.now(),
        };

        if (querySnapshot.empty) {
            await addDoc(submissionsRef, dataToSave);
        } else {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, dataToSave);
        }
    } catch (serverError) {
        const error = new FirestorePermissionError({
            path: `lessons/${lessonId}/homework_submissions`,
            operation: 'create',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
};
