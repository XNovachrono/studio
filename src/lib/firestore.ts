

import { 
    doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, writeBatch, arrayUnion, Timestamp, deleteDoc, arrayRemove, addDoc, orderBy
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "./firebase";
import type { User, StudentProfile, Group, StudentPlan, TeacherInteraction, PQRSMessage, Reminder, Lesson, EditorContent, BankCard, BankType } from "./types";

const storage = getStorage();

// Helper to convert Firestore Timestamps in lesson objects
const lessonFromDoc = (doc: any): Lesson => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as Lesson;
};

// Helper to convert Firestore Timestamps in bank card objects
const bankCardFromDoc = (doc: any): BankCard => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as BankCard;
};

// Function to get a user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
    const userDocRef = doc(db, "users", userId);
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
}

// Function to update a user profile (used in onboarding)
export const updateUserProfile = async (userId: string, data: Partial<StudentProfile>): Promise<void> => {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, data);
}

// === Student Functions ===

export const getStudentData = async (userId: string): Promise<{ user: StudentProfile, group: Group | null }> => {
    // Get user profile, which now includes teacher interactions
    const user = await getUserProfile(userId) as StudentProfile;
    if (!user) throw new Error("Student profile not found.");

    // Find the group the student belongs to
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("studentIds", "array-contains", userId));
    const querySnapshot = await getDocs(q);

    let group: Group | null = null;
    if (!querySnapshot.empty) {
        const groupDoc = querySnapshot.docs[0];
        const groupData = groupDoc.data() as Omit<Group, 'id'>;
        
        // Convert Timestamps to string dates for serialization
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
}


// Function to submit a PQRS message
export const submitPQRS = async (pqrsData: Omit<PQRSMessage, 'createdAt'>): Promise<void> => {
    const pqrsCollectionRef = collection(db, 'pqrs');
    await addDoc(pqrsCollectionRef, {
        ...pqrsData,
        createdAt: Timestamp.now(),
    });
};


// === Admin Functions ===

export const getAdminData = async (): Promise<{
    admin: User | null,
    groups: Group[],
    allStudents: StudentProfile[],
    allTeachers: User[],
}> => {
    // Since Firestore rules can be complex, fetch users first to identify the admin.
    const allUsersRef = collection(db, "users");
    const allUsersSnap = await getDocs(allUsersRef);
    const allUsers = allUsersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as User[];

    const admin = allUsers.find(u => u.role === 'admin') || null;
    const allStudents = allUsers.filter(u => u.role === 'student' && u.hasOnboarded) as StudentProfile[];
    const allTeachers = allUsers.filter(u => u.role === 'teacher');
    
    // Now fetch groups, which admins have read access to.
    const groupsRef = collection(db, "groups");
    const groupsSnap = await getDocs(groupsRef);
    const groups = groupsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Group));
    
    return { admin, groups, allStudents, allTeachers };
}


export const createGroupWithTeacher = async (teacher: User, students: {id: string, name: string}[], plan: StudentPlan) => {
    const studentIds = students.map(s => s.id);
    const studentNames = students.map(s => s.name);
    // Create group name from student names
    const groupName = studentNames.join(', ');

    const newGroupRef = doc(collection(db, "groups"));
    
    await setDoc(newGroupRef, {
        name: groupName,
        type: plan,
        teacherId: teacher.id,
        teacherName: teacher.name,
        studentIds,
        content: {
            scheduledClasses: [],
            notes: [],
            reminders: [],
        },
    });
};



// === Teacher Functions ===
export const getTeacherDataForDashboard = async (teacherId: string): Promise<{
    groups: Group[],
    allStudents: StudentProfile[], // We still need all students to populate group member names
}> => {
    // 1. Get all groups assigned to this teacher
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("teacherId", "==", teacherId));
    const groupsSnap = await getDocs(q);
    const groups = groupsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Group));

    // 2. Get all students to resolve names
    const usersRef = collection(db, "users");
    const studentsSnap = await getDocs(query(usersRef, where('role', '==', 'student')));
    const allStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StudentProfile[];

    return { groups, allStudents };
}

// === Lesson Functions ===

// Get all lessons for a specific group
export const getLessonsForGroup = async (groupId: string): Promise<Lesson[]> => {
    const lessonsRef = collection(db, "groups", groupId, "lessons");
    const q = query(lessonsRef, orderBy("number", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(lessonFromDoc);
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

// Create a new lesson for a group
export const createLessonForGroup = async (groupId: string, groupName: string, students: StudentProfile[]): Promise<void> => {
    const lessonsRef = collection(db, "groups", groupId, "lessons");
    const lessonsSnap = await getDocs(lessonsRef);
    const lessonNumber = lessonsSnap.size + 1;

    // Calculate average level
    const levels = students.map(s => s.level).filter(Boolean) as string[];
    const avgLevel = levels.length > 0 ? levels[0] : 'N/A'; // Placeholder for actual average calculation
    
    const newLessonName = `L${lessonNumber.toString().padStart(2, '0')}.${groupName}.${avgLevel}`;

    const newLesson: Omit<Lesson, 'id'> = {
        groupId,
        name: newLessonName,
        number: lessonNumber,
        createdAt: Timestamp.now() as any,
        recording: { link: "" },
        content: defaultContent,
        classNote: defaultContent,
        homework: defaultContent,
        attendance: {},
    };

    await addDoc(lessonsRef, newLesson);
};

// Update an existing lesson
export const updateLesson = async (groupId: string, lessonId: string, data: Partial<Lesson>): Promise<void> => {
    const lessonRef = doc(db, "groups", groupId, "lessons", lessonId);
    await updateDoc(lessonRef, data);
};


// === Bank Functions ===

// Get all bank cards for a user (teacher/admin) of a specific type
export const getBankCards = async (ownerId: string, type: BankType): Promise<BankCard[]> => {
    const bankRef = collection(db, "bank_cards");
    const q = query(bankRef, where("ownerId", "==", ownerId), where("type", "==", type));
    const querySnapshot = await getDocs(q);
    const cards = querySnapshot.docs.map(bankCardFromDoc);
    // Sort manually in code
    return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get all bank files for a user (teacher/admin) of a specific type
export const getBankFiles = async (ownerId: string, type: 'image' | 'video' | 'audio'): Promise<BankCard[]> => {
    const bankRef = collection(db, "bank_cards");
    const q = query(bankRef, where("ownerId", "==", ownerId), where("type", "==", type));
    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map(bankCardFromDoc);
    // Sort manually in code
    return files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Create a new bank card
export const createBankCard = async (data: Omit<BankCard, 'id' | 'createdAt'>): Promise<string> => {
    const bankRef = collection(db, "bank_cards");
    const newCardRef = await addDoc(bankRef, {
        ...data,
        createdAt: Timestamp.now(),
    });
    return newCardRef.id;
};

// Update a bank card
export const updateBankCard = async (cardId: string, data: Partial<BankCard>): Promise<void> => {
    const cardRef = doc(db, "bank_cards", cardId);
    await updateDoc(cardRef, data);
};

// Delete a bank card
export const deleteBankCard = async (cardId: string): Promise<void> => {
    const cardRef = doc(db, "bank_cards", cardId);
    await deleteDoc(cardRef);
};

// Upload a file to a bank
export const uploadBankFile = (ownerId: string, type: BankType, file: File, onProgress: (progress: number) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filePath = `${ownerId}/${type}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Save file metadata to Firestore
        const bankRef = collection(db, "bank_cards");
        await addDoc(bankRef, {
            ownerId,
            type,
            name: file.name,
            fileUrl: downloadURL,
            filePath: filePath,
            createdAt: Timestamp.now(),
        });

        resolve();
      }
    );
  });
};

// Delete a bank file from Storage and Firestore
export const deleteBankFile = async (cardId: string, filePath: string): Promise<void> => {
    // Delete from Firestore
    const cardRef = doc(db, "bank_cards", cardId);
    await deleteDoc(cardRef);

    // Delete from Storage
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
}


// Function to add content to a group
export const addContentToGroup = async (
    groupId: string, 
    type: 'scheduledClass' | 'note' | 'reminder',
    data: any,
) => {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) {
        throw new Error("Group not found!");
    }
    const groupData = groupSnap.data() as Group;

    if (type === 'scheduledClass') {
        const classDate = new Date(data.time);
        await updateDoc(groupRef, {
            'content.scheduledClasses': arrayUnion({
                 id: `c${Date.now()}`,
                 link: data.link, 
                 time: Timestamp.fromDate(classDate) 
            })
        });

        // Update teacher interaction for each student in the group
        const teacherProfile = await getUserProfile(groupData.teacherId);
        if (!teacherProfile) {
            console.error("Teacher profile not found for interaction update.");
            return;
        }

        const batch = writeBatch(db);
        const newInteraction: Omit<TeacherInteraction, 'lastInteraction'> = {
            teacherId: groupData.teacherId,
            teacherName: teacherProfile.name, // Use the fetched teacher's name
        };

        const studentsSnap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', groupData.studentIds)));
        
        studentsSnap.forEach(studentDoc => {
            const studentData = studentDoc.data() as StudentProfile;
            let interactions = studentData.teacherInteractions || [];
            
            const existingInteractionIndex = interactions.findIndex(i => i.teacherId === newInteraction.teacherId);
            
            if (existingInteractionIndex > -1) {
                // Update existing interaction's timestamp
                interactions[existingInteractionIndex].lastInteraction = Timestamp.now() as any;
            } else {
                // Add new interaction
                interactions.push({ ...newInteraction, lastInteraction: Timestamp.now() as any });
            }

            // Keep only the 5 most recent interactions by sorting
            interactions.sort((a, b) => {
                const timeA = a.lastInteraction instanceof Timestamp ? a.lastInteraction.toMillis() : new Date(a.lastInteraction).getTime();
                const timeB = b.lastInteraction instanceof Timestamp ? b.lastInteraction.toMillis() : new Date(b.lastInteraction).getTime();
                return timeB - timeA;
            });
            const updatedInteractions = interactions.slice(0, 5);

            batch.update(studentDoc.ref, { teacherInteractions: updatedInteractions });
        });
        await batch.commit();


    } else if (type === 'note') {
        await updateDoc(groupRef, {
            'content.notes': arrayUnion({ ...data, id: `n${Date.now()}` })
        });
    } else if (type === 'reminder') {
        const newReminder: Omit<Reminder, 'id'> = {
            message: data.message,
            teacherName: groupData.teacherName,
            sentAt: Timestamp.now() as any,
        };
        await updateDoc(groupRef, {
            'content.reminders': arrayUnion({ ...newReminder, id: `r${Date.now()}` })
        });
    }
};

// Function to dissolve a group
export const dissolveGroup = async (groupId: string): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    await deleteDoc(groupRef);
};

// Function to add students to an existing group
export const addStudentsToGroup = async (groupId: string, studentIds: string[]): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
        studentIds: arrayUnion(...studentIds)
    });
};

// Function to remove students from an existing group
export const removeStudentsFromGroup = async (groupId: string, studentIds: string[]): Promise<void> => {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
        studentIds: arrayRemove(...studentIds)
    });
};

// Function for teacher to update student details
export const updateStudentDetails = async (studentId: string, data: { level: string, courseStartDate: string, courseDuration: number }): Promise<void> => {
    const studentRef = doc(db, "users", studentId);
    await updateDoc(studentRef, {
        level: data.level,
        courseStartDate: data.courseStartDate,
        courseDuration: data.courseDuration,
    });
};
