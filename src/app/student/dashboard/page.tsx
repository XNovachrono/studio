import { StudentDashboardUI } from "@/components/student/dashboard-ui";
import { users, students as allStudents, initialGroups } from "@/lib/data";
import type { User } from "@/lib/types";

// In a real app, this data would be fetched based on the logged-in user.
// For this demo, we'll simulate it.
const getStudentData = (userId: string) => {
    const user = users.find(u => u.id === userId && u.role === 'student');
    if (!user) return null;

    const profile = allStudents.find(s => s.id === userId);
    const group = initialGroups.find(g => g.studentIds.includes(userId));

    return {
        user,
        profile,
        content: group?.content,
    };
};

export default function StudentDashboardPage() {
    // We'd get the user ID from the session. For now, let's hardcode it.
    // Let's use a user who is in a group, e.g., student2 (id: '2').
    const data = getStudentData('2');

    return (
        <StudentDashboardUI 
            user={data?.user || null}
            content={data?.content || { scheduledClasses: [], notes: [], books: [] }} 
        />
    );
}
