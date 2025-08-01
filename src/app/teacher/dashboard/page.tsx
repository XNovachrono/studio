import { TeacherDashboardUI } from "@/components/teacher/dashboard-ui";
import { users, students as allStudents, initialGroups } from "@/lib/data";

const getTeacherData = () => {
    const teacher = users.find(u => u.role === 'teacher');
    
    const allStudentProfiles = allStudents;

    // Students not in any group yet
    const studentsInGroups = new Set(initialGroups.flatMap(g => g.studentIds));
    const availableStudents = allStudentProfiles.filter(s => !studentsInGroups.has(s.id));

    return {
        teacher,
        availableStudents,
        groups: initialGroups,
        allStudents: allStudentProfiles,
    };
};

export default function TeacherDashboardPage() {
    const data = getTeacherData();

    return (
        <TeacherDashboardUI
            user={data.teacher || null}
            initialAvailableStudents={data.availableStudents}
            initialGroups={data.groups}
            allStudents={data.allStudents}
        />
    );
}
