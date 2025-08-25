
import { 
    doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, writeBatch, arrayUnion, Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type { User, StudentProfile, Group, StudentPlan } from "./types";

// Function to get a user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() } as User;
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
    // Get user profile
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
        group = { id: groupDoc.id, ...groupData };
    }

    return { user, group };
}

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
export const createGroup = async (teacherId: string, students: {id: string, name: string}[], plan: StudentPlan) => {
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
        teacherId,
        studentIds,
        content: {
            scheduledClasses: [],
            notes: [],
            books: [],
        },
    });
};


// Function to add content to a group
export const addContentToGroup = async (
    groupId: string, 
    type: 'scheduledClass' | 'note' | 'bookChapter',
    data: any,
    bookTitle?: string
) => {
    const groupRef = doc(db, "groups", groupId);

    if (type === 'scheduledClass') {
        const classDate = new Date(data.time);
        await updateDoc(groupRef, {
            'content.scheduledClasses': arrayUnion({
                 id: `c${Date.now()}`,
                 link: data.link, 
                 time: Timestamp.fromDate(classDate) 
            })
        });
    } else if (type === 'note') {
        await updateDoc(groupRef, {
            'content.notes': arrayUnion({ ...data, id: `n${Date.now()}` })
        });
    } else if (type === 'bookChapter') {
        const groupSnap = await getDoc(groupRef);
        if (!groupSnap.exists()) {
            throw new Error("Group not found!");
        }
        const groupData = groupSnap.data() as Group;
        const books = groupData.content.books || [];
        
        if (data.bookId === 'new') {
            // Create a new book
            const newBook = {
                id: `b${Date.now()}`,
                title: bookTitle || 'Nuevo Libro',
                chapters: [{ id: `ch${Date.now()}`, name: data.name, pdfUrl: data.pdfUrl }]
            };
            await updateDoc(groupRef, { 'content.books': arrayUnion(newBook) });
        } else {
            // Add chapter to existing book
            const bookIndex = books.findIndex(b => b.id === data.bookId);
            if (bookIndex > -1) {
                const newChapter = { id: `ch${Date.now()}`, name: data.name, pdfUrl: data.pdfUrl };
                books[bookIndex].chapters.push(newChapter);
                await updateDoc(groupRef, { 'content.books': books });
            } else {
                 throw new Error("Book not found!");
            }
        }
    }
};
