
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Calendar, FilePlus, Loader2, MoreVertical, Notebook, PlusCircle, Trash2, UserPlus, UserX, Users, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, StudentProfile, Group, StudentPlan } from "@/lib/types";
import { getTeacherDataForDashboard } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useLanguage } from "@/context/language-context";

interface TeacherDashboardData {
  teacher: User | null;
  groups: Group[];
}

interface GroupSectionProps {
  title: string;
  groups: Group[];
  studentsById: Map<string, StudentProfile>;
  onView: (group: Group) => void;
}

const StudentDataDialog = ({ student, isOpen, onOpenChange }: { student: StudentProfile | null; isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.studentDataDialog;

    if (!student) return null;

    const studentData = [
        { label: t.name, value: student.name },
        { label: t.age, value: student.age },
        { label: t.email, value: student.email },
        { label: t.phone, value: student.phone },
        { label: t.plan, value: student.plan, isBadge: true },
        { label: t.level, value: student.level },
        { label: t.interests, value: student.interests?.join(', ') },
        { label: t.objective, value: student.objective },
        { label: t.availability, value: student.availability },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.title.replace('{studentName}', student.name)}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    {studentData.map(data => data.value ? (
                        <div key={data.label} className="grid grid-cols-3 gap-2 text-sm">
                            <span className="font-semibold text-muted-foreground">{data.label}:</span>
                            <span className="col-span-2">
                                {data.isBadge ? <Badge variant="outline" className="capitalize">{data.value}</Badge> : data.value}
                            </span>
                        </div>
                    ) : null)}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const GroupDetailsDialog = ({ group, studentsById, isOpen, onOpenChange }: { group: Group | null; studentsById: Map<string, StudentProfile>; isOpen: boolean; onOpenChange: (open: boolean) => void; }) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.groups;
    const [studentToView, setStudentToView] = useState<StudentProfile | null>(null);

    if (!group) return null;

    const groupMembers = group.studentIds.map(id => studentsById.get(id)).filter(Boolean) as StudentProfile[];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{group.name}</DialogTitle>
                     <DialogDescription>
                      <Badge variant="secondary" className="capitalize">{group.type}</Badge>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <h4 className="font-semibold text-md mb-2">{t.members}:</h4>
                    <ScrollArea className="h-72">
                        <ul className="space-y-2 pr-4">
                            {groupMembers.map(student => (
                                <li key={student.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                    <span className="text-sm">{student.name}</span>
                                    <Button variant="ghost" size="sm" onClick={() => setStudentToView(student)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t.viewData}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </div>
            </DialogContent>
            <StudentDataDialog student={studentToView} isOpen={!!studentToView} onOpenChange={() => setStudentToView(null)} />
        </Dialog>
    );
};


const GroupSection = ({ title, groups, studentsById, onView }: GroupSectionProps) => {
  const { translations } = useLanguage();
  const t = translations.teacherDashboard.groups;

  if (groups.length === 0) {
    return null;
  }
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-headline text-foreground">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <Card key={group.id} className="flex flex-col cursor-pointer hover:border-primary transition-colors" onClick={() => onView(group)}>
            <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="capitalize">{group.type}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-semibold text-sm mb-2">{t.members}:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {group.studentIds.slice(0, 5).map(id => (
                  <li key={id}>{studentsById.get(id)?.name || t.unknown}</li>
                ))}
                {group.studentIds.length > 5 && <li>...</li>}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export function TeacherDashboardUI() {
  const router = useRouter();
  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.teacherDashboard;
  const t_toast = translations.teacherDashboard.toasts;
  
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [groupToView, setGroupToView] = useState<Group | null>(null);

  const fetchDashboardData = async (teacherId: string) => {
      setIsLoading(true);
      try {
        const teacherData = await getTeacherDataForDashboard(teacherId);
        setData({ teacher: user, groups: teacherData.groups });
        setAllStudents(teacherData.allStudents);
      } catch (error) {
          console.error("Error fetching teacher data:", error);
          toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.dataError });
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("uncoverly-user");
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'teacher') {
            router.push('/login');
            return;
        }
        setUser(parsedUser);
        fetchDashboardData(parsedUser.id);
    } else {
        router.push("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const studentsById = useMemo(() => new Map(allStudents.map(s => [s.id, s])), [allStudents]);
  
  const privateGroups = useMemo(() => data?.groups.filter(g => g.type === 'privado') || [], [data?.groups]);
  const smallGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo pequeño') || [], [data?.groups]);
  const largeGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo grande') || [], [data?.groups]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user} title={t.title} />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t.groups.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
             <GroupSection title={t.groups.private} groups={privateGroups} studentsById={studentsById} onView={setGroupToView}/>
             <GroupSection title={t.groups.small} groups={smallGroups} studentsById={studentsById} onView={setGroupToView}/>
             <GroupSection title={t.groups.large} groups={largeGroups} studentsById={studentsById} onView={setGroupToView}/>
             {data?.groups.length === 0 && (
                <p className="text-center text-muted-foreground">{t.groups.noGroups}</p>
             )}
          </CardContent>
        </Card>
      </main>
      
      <GroupDetailsDialog group={groupToView} studentsById={studentsById} isOpen={!!groupToView} onOpenChange={() => setGroupToView(null)} />

    </div>
  );
}
