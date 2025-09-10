
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, Loader2, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, StudentProfile, Group, Lesson } from "@/lib/types";
import { getTeacherDataForDashboard, getLessonsForGroup, createLessonForGroup } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "../ui/textarea";

interface TeacherDashboardData {
  teacher: User | null;
  groups: Group[];
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

const GroupLessons = ({ group, studentsById }: { group: Group, studentsById: Map<string, StudentProfile> }) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.lessons;
    const t_toast = translations.teacherDashboard.toasts;
    const { toast } = useToast();

    const fetchLessons = async () => {
        setIsLoading(true);
        try {
            const groupLessons = await getLessonsForGroup(group.id);
            setLessons(groupLessons);
        } catch (error) {
            console.error("Error fetching lessons:", error);
            toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.lessonError });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group.id]);

    const handleCreateLesson = async () => {
        setIsCreating(true);
        try {
            const groupStudents = group.studentIds.map(id => studentsById.get(id)).filter(Boolean) as StudentProfile[];
            await createLessonForGroup(group.id, group.name, groupStudents);
            toast({ title: t_toast.lessonCreatedTitle, description: t_toast.lessonCreatedDescription });
            await fetchLessons(); // Refresh lessons
        } catch (error) {
            console.error("Error creating lesson:", error);
            toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.createLessonError });
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreateLesson} disabled={isCreating}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {t.newLesson}
                </Button>
            </div>
             {lessons.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {lessons.map(lesson => (
                         <AccordionItem value={lesson.id} key={lesson.id}>
                            <AccordionTrigger className="font-semibold text-lg hover:no-underline">{lesson.name}</AccordionTrigger>
                            <AccordionContent className="space-y-6 pl-2">
                                {/* TODO: Teacher-specific lesson content editing will go here */}
                                <Card>
                                    <CardHeader><CardTitle>{t.recording}</CardTitle></CardHeader>
                                    <CardContent><p className="text-muted-foreground">{t.recordingPlaceholder}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>{t.content}</CardTitle></CardHeader>
                                    <CardContent><p className="text-muted-foreground">{t.contentPlaceholder}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>{t.classNote}</CardTitle></CardHeader>
                                    <CardContent><p className="text-muted-foreground">{t.classNotePlaceholder}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>{t.homework}</CardTitle></CardHeader>
                                    <CardContent><p className="text-muted-foreground">{t.homeworkPlaceholder}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>{t.attendance}</CardTitle></CardHeader>
                                    <CardContent><p className="text-muted-foreground">{t.attendancePlaceholder}</p></CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <p className="p-4 text-center text-muted-foreground">{t.noLessons}</p>
            )}
        </div>
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
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{group.name}</DialogTitle>
                     <DialogDescription>
                      <Badge variant="secondary" className="capitalize">{group.type}</Badge>
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="lessons" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="shrink-0">
                        <TabsTrigger value="lessons"><BookOpen className="mr-2 h-4 w-4"/>Lecciones</TabsTrigger>
                        <TabsTrigger value="members"><Users className="mr-2 h-4 w-4"/>Miembros</TabsTrigger>
                    </TabsList>
                    <TabsContent value="lessons" className="flex-grow overflow-auto p-4">
                       <GroupLessons group={group} studentsById={studentsById} />
                    </TabsContent>
                    <TabsContent value="members" className="flex-grow overflow-auto p-4">
                         <ScrollArea className="h-full">
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
                    </TabsContent>
                </Tabs>
            </DialogContent>
            <StudentDataDialog student={studentToView} isOpen={!!studentToView} onOpenChange={() => setStudentToView(null)} />
        </Dialog>
    );
};


const GroupSection = ({ title, groups, studentsById, onView }: { title: string; groups: Group[]; studentsById: Map<string, StudentProfile>; onView: (group: Group) => void; }) => {
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
