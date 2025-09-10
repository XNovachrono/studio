import { TeacherDashboardUI } from "@/components/teacher/dashboard-ui";

export default function TeacherDashboardPage() {
    // The TeacherDashboardUI component is a client component and will handle
    // fetching its own data and checking for authentication.
    return <TeacherDashboardUI />;
}
