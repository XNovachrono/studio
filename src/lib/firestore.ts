

import { 
    doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, writeBatch, arrayUnion, Timestamp, deleteDoc, arrayRemove, addDoc
} from "firebase/firestore";
import { db } from "./firebase";
import type { User, StudentProfile, Group, StudentPlan, TeacherInteraction, PQRSMessage, Reminder } from "./types";

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


// === Teacher Functions ===

export const getTeacherData = async (): Promise<{
    teacher: User | null,
    availableStudents: StudentProfile[],
    groups: Group[],
    allStudents: StudentProfile[],
}> => {
    // 1. Get all users and filter for the teacher
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
    
    const teacher = allUsers.find(u => u.role === 'teacher') || null;
    const allStudents = allUsers.filter(u => u.role === 'student') as StudentProfile[];

    // 2. Get all groups
    const groupsRef = collection(db, "groups");
    const groupsSnap = await getDocs(groupsRef);
    const groups = groupsSnap.docs.map(d => {
        const groupData = d.data() as Omit<Group, 'id'>;
         // Convert Timestamps to string dates for serialization
        if (groupData.content.scheduledClasses) {
            groupData.content.scheduledClasses = groupData.content.scheduledClasses.map(c => ({
                ...c,
                time: c.time instanceof Timestamp ? c.time.toDate().toISOString() : c.time,
            }));
        }
        return { id: d.id, ...groupData };
    });

    // 3. Determine available students (those not in any group)
    const studentsInGroups = new Set(groups.flatMap(g => g.studentIds));
    const availableStudents = allStudents.filter(s => s.hasOnboarded && !studentsInGroups.has(s.id));

    return {
        teacher,
        availableStudents,
        groups,
        allStudents,
    }
}

// Function to create a new group
export const createGroup = async (teacher: User, students: {id: string, name: string}[], plan: StudentPlan) => {
    const studentIds = students.map(s => s.id);
    let groupName = "";

    if (plan === 'privado' && students.length === 1) {
        groupName = `Clase Privada - ${students[0].name}`;
    } else {
        const groupNumber = Math.floor(1000 + Math.random() * 9000);
        groupName = `Grupo ${groupNumber}`;
    }

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
