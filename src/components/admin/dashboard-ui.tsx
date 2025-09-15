

      
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Users, Edit, Calendar as CalendarIcon, MessageCircle, Trash2, Eye, BookOpen, Library, Link as LinkIcon, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, StudentProfile, PQRSMessage, Group, BankCard, Lesson } from "@/lib/types";
import { getAdminData, createGroupWithTeacher, updateUserProfile, deletePQRSMessage, getLessonsForGroup } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/context/language-context";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format, addWeeks, differenceInWeeks, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "../ui/scroll-area";
import { BanksDashboardUI } from "../teacher/banks/dashboard-ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Editor } from "../common/editor";

interface AdminDashboardData {
  admin: User | null;
  groups: any[];
  allStudents: StudentProfile[];
  allTeachers: User[];
  pqrsMessages: PQRSMessage[];
  bankCards: BankCard[];
}

const ENGLISH_LEVELS = ["A1", "A1.2", "A2", "A2.2", "B1", "B1.2", "C1", "C1.2", "C2"];

const StudentDataDialog = ({ student, isOpen, onOpenChange }: { student: StudentProfile | null; isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.studentDataDialog;

    if (!student) return null;

    const studentData = [
        { label: t.name, value: student.name },
        { label: t.plan, value: student.plan, isBadge: true },
        { label: t.level, value: student.level },
        { label: t.age, value: student.age },
        { label: t.email, value: student.email },
        { label: t.phone, value: student.phone },
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
                                {data.isBadge ? <Badge variant="secondary" className="capitalize">{data.value}</Badge> : data.value}
                            </span>
                        </div>
                    ) : null)}
                </div>
            </DialogContent>
        </Dialog>
    );
};


const LessonViewer = ({ group }: { group: Group }) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { translations } = useLanguage();
    const t_lessons = translations.studentDashboard.lessons;

    useEffect(() => {
        const fetchLessons = async () => {
            setIsLoading(true);
            const groupLessons = await getLessonsForGroup(group.id);
            setLessons(groupLessons);
            setIsLoading(false);
        };
        fetchLessons();
    }, [group.id]);

    if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    if (lessons.length === 0) return <p className="text-center text-muted-foreground">{t_lessons.noLessons}</p>;

    return (
        <Accordion type="single" collapsible className="w-full">
            {lessons.map(lesson => (
                <AccordionItem value={lesson.id} key={lesson.id}>
                    <AccordionTrigger className="font-semibold text-lg hover:no-underline">{lesson.name}</AccordionTrigger>
                    <AccordionContent className="space-y-6 pl-2">
                        <Card>
                            <CardHeader><CardTitle>{t_lessons.recording}</CardTitle></CardHeader>
                            <CardContent>{lesson.recording?.link ? <a href={lesson.recording.link} target="_blank" rel="noopener noreferrer"><Button>{t_lessons.viewRecording}</Button></a> : <p className="text-muted-foreground">{t_lessons.noRecording}</p>}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>{t_lessons.content}</CardTitle></CardHeader>
                            <CardContent><Editor content={lesson.content} onChange={() => {}} editable={false} /></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>{translations.studentDashboard.notes.title}</CardTitle></CardHeader>
                            <CardContent><Editor content={lesson.classNote} onChange={() => {}} editable={false} /></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>{t_lessons.homework}</CardTitle></CardHeader>
                            <CardContent><Editor content={lesson.homework} onChange={() => {}} editable={false} /></CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

const AdminGroupDetailsDialog = ({ group, studentsById, isOpen, onOpenChange }: { group: Group | null; studentsById: Map<string, StudentProfile>; isOpen: boolean; onOpenChange: (open: boolean) => void; }) => {
    const { translations } = useLanguage();
    const t_groups = translations.teacherDashboard.groups;
    const [studentToView, setStudentToView] = useState<StudentProfile | null>(null);

    if (!group) return null;

    const groupMembers = group.studentIds.map(id => studentsById.get(id)).filter(Boolean) as StudentProfile[];
    const scheduledClasses = group.content.scheduledClasses || [];
    const reminders = group.content.reminders || [];

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{group.name}</DialogTitle>
                     <DialogDescription>
                      <Badge variant="secondary" className="capitalize">{group.type}</Badge> · Docente: {group.teacherName}
                    </DialogDescription>
                </DialogHeader>
                 <Tabs defaultValue="lessons" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="shrink-0">
                        <TabsTrigger value="lessons"><BookOpen className="mr-2 h-4 w-4"/>Lecciones</TabsTrigger>
                        <TabsTrigger value="members"><Users className="mr-2 h-4 w-4"/>Miembros</TabsTrigger>
                        <TabsTrigger value="history"><CalendarIcon className="mr-2 h-4 w-4"/>Historial</TabsTrigger>
                    </TabsList>
                    <TabsContent value="lessons" className="flex-grow overflow-auto p-4">
                       <LessonViewer group={group} />
                    </TabsContent>
                    <TabsContent value="members" className="flex-grow overflow-auto p-4">
                         <ScrollArea className="h-full">
                            <ul className="space-y-2 pr-4">
                                {groupMembers.map(student => (
                                    <li key={student.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                        <span className="text-sm">{student.name}</span>
                                        <Button variant="ghost" size="sm" onClick={() => setStudentToView(student)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t_groups.viewData}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </TabsContent>
                     <TabsContent value="history" className="flex-grow overflow-auto p-4 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><LinkIcon/>Links de Clases Enviados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {scheduledClasses.length > 0 ? (
                                    <ul className="space-y-3">
                                        {scheduledClasses.map(c => (
                                            <li key={c.id} className="text-sm p-3 rounded-md bg-secondary/50">
                                                <p><strong>Enlace:</strong> <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{c.link}</a></p>
                                                <p><strong>Fecha:</strong> {format(new Date(c.time), "PPpp", { locale: es })}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted-foreground text-center">El docente aún no ha enviado enlaces de clases.</p>}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                 <CardTitle className="flex items-center gap-2"><Bell/>Recordatorios Enviados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reminders.length > 0 ? (
                                    <ul className="space-y-3">
                                        {reminders.map(r => (
                                            <li key={r.id} className="text-sm p-3 rounded-md bg-secondary/50">
                                                <p>{r.message}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(r.sentAt), "PPpp", { locale: es })}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted-foreground text-center">El docente no ha enviado recordatorios.</p>}
                            </CardContent>
                        </Card>
                     </TabsContent>
                </Tabs>
            </DialogContent>
            <StudentDataDialog student={studentToView} isOpen={!!studentToView} onOpenChange={() => setStudentToView(null)} />
        </Dialog>
    )
}

const EditStudentDialog = ({ student, isOpen, onOpenChange, onStudentUpdate }: { student: StudentProfile | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onStudentUpdate: () => void }) => {
    const { toast } = useToast();
    const [level, setLevel] = useState(student?.level || "");
    const [startDate, setStartDate] = useState<Date | undefined>(student?.courseStartDate ? parseISO(student.courseStartDate) : new Date());
    const [duration, setDuration] = useState(student?.courseDuration || 12);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (student) {
            setLevel(student.level || "");
            setStartDate(student.courseStartDate ? parseISO(student.courseStartDate) : new Date());
            setDuration(student.courseDuration || 12);
        }
    }, [student]);

    const handleSave = async () => {
        if (!student || !startDate) return;
        setIsSaving(true);
        try {
            const dataToUpdate: Partial<StudentProfile> = {
                level,
                courseStartDate: format(startDate, "yyyy-MM-dd"),
                courseDuration: duration,
            };
            await updateUserProfile(student.id, dataToUpdate);
            toast({ title: "Estudiante actualizado", description: `Los datos de ${student.name} se guardaron correctamente.` });
            onStudentUpdate();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estudiante." });
        } finally {
            setIsSaving(false);
        }
    };

    const endDate = startDate ? format(addWeeks(startDate, duration), "PPP", { locale: es }) : "N/A";
    const currentWeek = startDate ? differenceInWeeks(new Date(), startDate) + 1 : "N/A";
    
    if (!student) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Estudiante: {student.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="level-select">Nivel de Inglés</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger id="level-select"><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                            <SelectContent>
                                {ENGLISH_LEVELS.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha de Inicio</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="duration">Duración (semanas)</Label>
                            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                        </div>
                    </div>
                    <Card className="bg-secondary/50">
                        <CardContent className="pt-6 text-sm space-y-2">
                            <p><strong>Fecha Final del Curso:</strong> {endDate}</p>
                            <p><strong>Semana Actual:</strong> {currentWeek > 0 && currentWeek <= duration ? currentWeek : "N/A"}</p>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};

const PqrsDetailsDialog = ({ student, messages, isOpen, onOpenChange, onDelete }: { student: StudentProfile | null; messages: PQRSMessage[]; isOpen: boolean; onOpenChange: (open: boolean) => void; onDelete: (messageId: string) => void; }) => {
    const { translations } = useLanguage();
    const t = translations.adminDashboard.pqrs;

    if (!student) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t.detailsTitle.replace('{studentName}', student.name)}</DialogTitle>
                    <DialogDescription>{student.email}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] my-4">
                    <div className="space-y-4 pr-6">
                    {messages.map(msg => (
                        <Card key={msg.id}>
                           <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span>{t.teacherLabel}: {msg.teacherName}</span>
                                        {msg.isAnonymous && <Badge variant="outline">{t.anonymous}</Badge>}
                                    </CardTitle>
                                    <CardDescription>{format(new Date(msg.createdAt), "PPpp", { locale: es })}</CardDescription>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0"><Trash2 className="h-4 w-4"/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t.deleteDialog.title}</AlertDialogTitle>
                                            <AlertDialogDescription>{t.deleteDialog.description}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t.deleteDialog.cancel}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(msg.id)}>{t.deleteDialog.confirm}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                           </CardHeader>
                           <CardContent>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                           </CardContent>
                        </Card>
                    ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

const TeacherDetailsDialog = ({ teacher, groups, pqrs, bankCards, isOpen, onOpenChange }: { teacher: User | null; groups: Group[]; pqrs: PQRSMessage[]; bankCards: BankCard[]; isOpen: boolean; onOpenChange: (open: boolean) => void; }) => {
    const { translations } = useLanguage();
    const t = translations.adminDashboard.teachers.details;
    if (!teacher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t.title}: {teacher.name}</DialogTitle>
                    <DialogDescription>
                        <div><strong>{t.contact}</strong></div>
                        <div>{t.email}: {teacher.email}</div>
                        <div>{t.phone}: {(teacher as any).phone || t.noPhone}</div>
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="groups" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="shrink-0">
                        <TabsTrigger value="groups"><Users className="mr-2 h-4 w-4"/>{t.tabs.groups}</TabsTrigger>
                        <TabsTrigger value="banks"><Library className="mr-2 h-4 w-4"/>{t.tabs.banks}</TabsTrigger>
                        <TabsTrigger value="pqrs"><MessageCircle className="mr-2 h-4 w-4"/>{t.tabs.pqrs}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="groups" className="flex-grow overflow-auto p-4">
                        {groups.length > 0 ? (
                             <div className="grid gap-4 md:grid-cols-2">
                                {groups.map(group => (
                                    <Card key={group.id}>
                                        <CardHeader>
                                            <CardTitle>{group.name}</CardTitle>
                                            <CardDescription><Badge variant="outline" className="capitalize">{group.type}</Badge></CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm"><strong>Miembros:</strong> {group.studentIds.length}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : <p className="text-center text-muted-foreground">Este docente no tiene grupos asignados.</p>}
                    </TabsContent>
                    <TabsContent value="banks" className="flex-grow overflow-auto">
                        <BanksDashboardUI />
                    </TabsContent>
                    <TabsContent value="pqrs" className="flex-grow overflow-auto p-4">
                         {pqrs.length > 0 ? (
                            <ScrollArea className="h-full">
                                <div className="space-y-4 pr-4">
                                    {pqrs.map(msg => (
                                        <Card key={msg.id}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{msg.isAnonymous ? "Anónimo" : "Estudiante"}</CardTitle>
                                            <CardDescription>{format(new Date(msg.createdAt), "PPpp", { locale: es })}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap">{msg.message}</p>
                                        </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                         ) : <p className="text-center text-muted-foreground">Este docente no ha recibido mensajes PQRS.</p>}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}


export function AdminDashboardUI() {
  const router = useRouter();
  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.adminDashboard;
  const t_toast = translations.adminDashboard.toasts;

  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Group creation state
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Student editing state
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  
  // PQRS state
  const [selectedPqrsStudent, setSelectedPqrsStudent] = useState<StudentProfile | null>(null);
  
  // Teacher details state
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  
  // Group details state
  const [groupToView, setGroupToView] = useState<Group | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const adminData = await getAdminData();
      setData(adminData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.dataError });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("uncoverly-user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'admin') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
      fetchDashboardData();
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const studentsInGroups = useMemo(() => new Set(data?.groups.flatMap(g => g.studentIds)), [data?.groups]);
  const ungroupedStudents = useMemo(() => data?.allStudents.filter(s => !studentsInGroups.has(s.id)) || [], [data, studentsInGroups]);

  const studentsById = useMemo(() => {
    return new Map(data?.allStudents.map(s => [s.id, s]));
  }, [data?.allStudents]);
  
  const pqrsByStudent = useMemo(() => {
    const grouped: Record<string, PQRSMessage[]> = {};
    if (!data) return [];
    
    data.pqrsMessages.forEach(msg => {
      if (!grouped[msg.studentId]) {
        grouped[msg.studentId] = [];
      }
      grouped[msg.studentId].push(msg);
    });
    
    return Object.entries(grouped).map(([studentId, messages]) => ({
      student: studentsById.get(studentId),
      messages,
    })).filter(item => !!item.student);
  }, [data, studentsById]);

  const groupsByTeacher = useMemo(() => {
      const grouped: Record<string, Group[]> = {};
      data?.groups.forEach(group => {
          if(!grouped[group.teacherId]) {
              grouped[group.teacherId] = [];
          }
          grouped[group.teacherId].push(group);
      });
      return grouped;
  }, [data?.groups]);

  const handleCreateGroupClick = () => {
    if (selectedStudentIds.length === 0) {
        toast({ variant: "destructive", title: t_toast.createGroupErrorTitle, description: t_toast.noStudentsSelectedError });
        return;
    }
    
    const selectedStudentsData = data?.allStudents.filter(s => selectedStudentIds.includes(s.id)) || [];
    const firstPlan = selectedStudentsData[0]?.plan;
    if (!firstPlan || !selectedStudentsData.every(s => s.plan === firstPlan)) {
      toast({
        variant: "destructive",
        title: t_toast.createGroupErrorTitle,
        description: t_toast.planMismatchError,
      });
      return;
    }
    
    setCreateGroupModalOpen(true);
  };

  const handleConfirmCreateGroup = async () => {
    if (!selectedTeacherId || !data) {
        toast({ variant: "destructive", title: t_toast.createGroupErrorTitle, description: t_toast.noTeacherSelectedError });
        return;
    }
    setIsCreatingGroup(true);

    const selectedStudentsData = data.allStudents.filter(s => selectedStudentIds.includes(s.id));
    const selectedTeacher = data.allTeachers.find(t => t.id === selectedTeacherId);

    if(!selectedTeacher) {
        toast({ variant: "destructive", title: t_toast.createGroupErrorTitle, description: t_toast.teacherNotFoundError });
        setIsCreatingGroup(false);
        return;
    }
    
    const plan = selectedStudentsData[0].plan!;

    try {
        const studentsToGroup = selectedStudentsData.map(s => ({ id: s.id, name: s.name }));
        await createGroupWithTeacher(selectedTeacher, studentsToGroup, plan);
        toast({
            title: t_toast.groupCreatedTitle,
            description: t_toast.groupCreatedDescription,
        });
        setSelectedStudentIds([]);
        setSelectedTeacherId(null);
        setCreateGroupModalOpen(false);
        await fetchDashboardData(); 
    } catch (error) {
        console.error("Error creating group:", error);
        toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.createGroupError });
    } finally {
        setIsCreatingGroup(false);
    }
  };

  const handleDeletePqrs = async (messageId: string) => {
    try {
        await deletePQRSMessage(messageId);
        toast({ title: t_toast.pqrsDeletedTitle });
        // Refresh local state to remove the message
        setData(prevData => {
            if (!prevData) return null;
            const newPqrsMessages = prevData.pqrsMessages.filter(msg => msg.id !== messageId);
            // Close the dialog if it was the last message for that student
            if (newPqrsMessages.filter(m => m.studentId === selectedPqrsStudent?.id).length === 0) {
              setSelectedPqrsStudent(null);
            }
            return { ...prevData, pqrsMessages: newPqrsMessages };
        });
    } catch (error) {
        console.error("Error deleting PQRS:", error);
        toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.pqrsDeleteError });
    }
  };

  if (isLoading || !data) {
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
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students"><Users className="mr-2 h-4 w-4" />{t.tabs.students}</TabsTrigger>
            <TabsTrigger value="teachers"><Users className="mr-2 h-4 w-4" />{t.tabs.teachers}</TabsTrigger>
            <TabsTrigger value="groups"><Users className="mr-2 h-4 w-4" />{t.tabs.groups}</TabsTrigger>
            <TabsTrigger value="pqrs"><MessageCircle className="mr-2 h-4 w-4" />{t.tabs.pqrs}</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{t.students.title}</CardTitle>
                <CardDescription>{t.students.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const ungroupedIds = ungroupedStudents.map(s => s.id);
                              setSelectedStudentIds(checked === true ? ungroupedIds : []);
                            }}
                            checked={ungroupedStudents.length > 0 && selectedStudentIds.length === ungroupedStudents.length}
                          />
                        </TableHead>
                        <TableHead>{t.students.table.name}</TableHead>
                        <TableHead>{t.students.table.email}</TableHead>
                        <TableHead>{t.students.table.phone}</TableHead>
                        <TableHead>{t.students.table.level}</TableHead>
                        <TableHead>{t.students.table.plan}</TableHead>
                        <TableHead>{t.students.table.availability}</TableHead>
                        <TableHead>{t.students.table.startDate}</TableHead>
                        <TableHead>{t.students.table.duration}</TableHead>
                        <TableHead>{t.students.table.currentWeek}</TableHead>
                        <TableHead className="text-right">{t.students.table.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ungroupedStudents.map(student => {
                        const startDate = student.courseStartDate ? parseISO(student.courseStartDate) : null;
                        let currentWeek: number | string = "N/A";
                        if (startDate && student.courseDuration) {
                            const week = differenceInWeeks(new Date(), startDate) + 1;
                            if (week > 0 && week <= student.courseDuration) {
                                currentWeek = week;
                            }
                        }
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStudentIds.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedStudentIds(prev => checked ? [...prev, student.id] : prev.filter(id => id !== student.id));
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.email || '-'}</TableCell>
                            <TableCell>{(student as any).phone || '-'}</TableCell>
                            <TableCell>{student.level || '-'}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{student.plan || '-'}</Badge></TableCell>
                            <TableCell>{student.availability || '-'}</TableCell>
                            <TableCell>{startDate ? format(startDate, "P", { locale: es }) : '-'}</TableCell>
                            <TableCell>{student.courseDuration ? `${student.courseDuration} sem` : '-'}</TableCell>
                            <TableCell>{currentWeek}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Button onClick={handleCreateGroupClick} disabled={selectedStudentIds.length === 0 || isCreatingGroup} className="mt-4">
                  {isCreatingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <PlusCircle className="mr-2 h-4 w-4" /> {t.students.createGroupButton}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="teachers">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t.teachers.title}</CardTitle>
                    <CardDescription>{t.teachers.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.teachers.table.name}</TableHead>
                                    <TableHead>{t.teachers.table.groups}</TableHead>
                                    <TableHead className="text-right">{t.teachers.table.actions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.allTeachers.map(teacher => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.name}</TableCell>
                                        <TableCell>{(groupsByTeacher[teacher.id] || []).length}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedTeacher(teacher)}>
                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{t.groups.title}</CardTitle>
                <CardDescription>{t.groups.description}</CardDescription>
              </CardHeader>
               <CardContent>
                 {data.groups.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.groups.map(group => (
                            <Card key={group.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setGroupToView(group)}>
                                <CardHeader>
                                    <CardTitle>{group.name}</CardTitle>
                                    <CardDescription>
                                        <Badge variant="outline" className="capitalize">{group.type}</Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p><strong>Docente:</strong> {group.teacherName}</p>
                                    <p><strong>Estudiantes:</strong> {group.studentIds.length}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 ) : (
                    <p className="text-center text-muted-foreground">{t.groups.noGroups}</p>
                 )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pqrs">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline">{t.pqrs.title}</CardTitle>
                <CardDescription>{t.pqrs.description}</CardDescription>
              </CardHeader>
               <CardContent>
                {pqrsByStudent.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.pqrs.table.student}</TableHead>
                                    <TableHead>{t.pqrs.table.email}</TableHead>
                                    <TableHead className="text-right">{t.pqrs.table.messages}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pqrsByStudent.map(({ student, messages }) => (
                                    <TableRow key={student!.id} className="cursor-pointer" onClick={() => setSelectedPqrsStudent(student!)}>
                                        <TableCell className="font-medium">{student!.name}</TableCell>
                                        <TableCell>{student!.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge>{messages.length}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">{t.pqrs.noPqrs}</p>
                )}
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog for Creating Group */}
      <Dialog open={isCreateGroupModalOpen} onOpenChange={setCreateGroupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createGroupDialog.title}</DialogTitle>
            <DialogDescription>{t.createGroupDialog.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="teacher-select">{t.createGroupDialog.teacherLabel}</Label>
            <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId || ''}>
                <SelectTrigger id="teacher-select">
                    <SelectValue placeholder={t.createGroupDialog.teacherPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                    {data?.allTeachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t.createGroupDialog.cancel}</Button></DialogClose>
            <Button onClick={handleConfirmCreateGroup} disabled={isCreatingGroup || !selectedTeacherId}>
              {isCreatingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.createGroupDialog.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Editing Student */}
      <EditStudentDialog 
        student={editingStudent} 
        isOpen={!!editingStudent} 
        onOpenChange={() => setEditingStudent(null)} 
        onStudentUpdate={fetchDashboardData}
      />

      {/* Dialog for PQRS Details */}
      <PqrsDetailsDialog 
        student={selectedPqrsStudent}
        messages={pqrsByStudent.find(item => item.student?.id === selectedPqrsStudent?.id)?.messages || []}
        isOpen={!!selectedPqrsStudent}
        onOpenChange={() => setSelectedPqrsStudent(null)}
        onDelete={handleDeletePqrs}
      />
      
      {/* Dialog for Teacher Details */}
      <TeacherDetailsDialog
        teacher={selectedTeacher}
        groups={groupsByTeacher[selectedTeacher?.id || ''] || []}
        pqrs={data.pqrsMessages.filter(p => p.teacherId === selectedTeacher?.id)}
        bankCards={data.bankCards.filter(c => c.ownerId === selectedTeacher?.id)}
        isOpen={!!selectedTeacher}
        onOpenChange={() => setSelectedTeacher(null)}
      />
      
       {/* Dialog for Group Details (Admin) */}
      <AdminGroupDetailsDialog 
        group={groupToView}
        studentsById={studentsById}
        isOpen={!!groupToView}
        onOpenChange={() => setGroupToView(null)}
      />
    </div>
  );
}
