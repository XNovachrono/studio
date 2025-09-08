
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Calendar, FilePlus, Loader2, MoreVertical, Notebook, PlusCircle, Trash2, UserPlus, UserX, Users, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, StudentProfile, Group, StudentPlan } from "@/lib/types";
import { getTeacherData, createGroup, addContentToGroup, dissolveGroup, addStudentsToGroup, removeStudentsFromGroup, updateStudentDetails } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useLanguage } from "@/context/language-context";
import { Textarea } from "../ui/textarea";

interface TeacherDashboardData {
    teacher: User | null;
    groups: Group[];
    allStudents: StudentProfile[];
}

interface GroupSectionProps {
  title: string;
  groups: Group[];
  studentsById: Map<string, StudentProfile>;
  onDissolve: (groupId: string) => void;
  onManage: (group: Group) => void;
  onView: (group: Group) => void;
}

const ENGLISH_LEVELS = ["A1", "A1.5", "A2", "A2.5", "B1", "B1.5", "C1", "C1.5", "C2"];

const GroupSection = ({ title, groups, studentsById, onDissolve, onManage, onView }: GroupSectionProps) => {
  const { translations } = useLanguage();
  const t = translations.teacherDashboard.groups;

  if (groups.length === 0) {
    return null; // Don't render the section if there are no groups
  }
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-headline text-foreground">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <Card key={group.id} className="flex flex-col cursor-pointer hover:border-primary transition-colors" onClick={() => onView(group)}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="capitalize">{group.type}</Badge>
                </CardDescription>
              </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => onManage(group)}>
                      <Users className="mr-2 h-4 w-4" />
                      {t.manageGroup}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDissolve(group.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t.dissolveGroup}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

export function TeacherDashboardUI() {
  const router = useRouter();
  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.teacherDashboard;
  const t_toast = translations.teacherDashboard.toasts;
  
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Content management state
  const [selectedGroupType, setSelectedGroupType] = useState<StudentPlan | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [classLink, setClassLink] = useState('');
  const [classTime, setClassTime] = useState('');
  const [noteLink, setNoteLink] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [isAddingContent, setIsAddingContent] = useState(false);
  
  // State for dissolving group
  const [groupToDissolve, setGroupToDissolve] = useState<string | null>(null);
  const [isDissolving, setIsDissolving] = useState(false);

  // State for managing group
  const [groupToManage, setGroupToManage] = useState<Group | null>(null);
  const [studentsToAdd, setStudentsToAdd] = useState<string[]>([]);
  const [studentsToRemove, setStudentsToRemove] = useState<string[]>([]);
  const [isManagingGroup, setIsManagingGroup] = useState(false);

  // State for editing student
  const [studentToEdit, setStudentToEdit] = useState<StudentProfile | null>(null);
  const [editFormData, setEditFormData] = useState({ level: '', courseStartDate: '', courseDuration: 0 });
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  
  // State for viewing group details
  const [groupToView, setGroupToView] = useState<Group | null>(null);

  const fetchDashboardData = async () => {
      try {
        const teacherData = await getTeacherData();
        setData(teacherData);
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
        setIsLoading(true);
        fetchDashboardData();
    } else {
        router.push("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (studentToEdit) {
      setEditFormData({
        level: studentToEdit.level || '',
        courseStartDate: studentToEdit.courseStartDate || '',
        courseDuration: studentToEdit.courseDuration || 0,
      });
    }
  }, [studentToEdit]);

  const handleCreateGroup = async () => {
    if (selectedStudentIds.length === 0 || !user || !data) return;
    setIsCreatingGroup(true);

    const selectedStudentsData = data.allStudents.filter(s => selectedStudentIds.includes(s.id));
    const firstPlan = selectedStudentsData[0]?.plan;

    if (!firstPlan || !selectedStudentsData.every(s => s.plan === firstPlan)) {
      toast({
        variant: "destructive",
        title: t_toast.createGroupErrorTitle,
        description: t_toast.planMismatchError,
      });
      setIsCreatingGroup(false);
      return;
    }

    try {
        const studentsToGroup = selectedStudentsData.map(s => ({ id: s.id, name: s.name }));
        await createGroup(user, studentsToGroup, firstPlan);
        toast({
            title: t_toast.groupCreatedTitle,
            description: t_toast.groupCreatedDescription,
        });
        setSelectedStudentIds([]);
        await fetchDashboardData(); // Refresh data
    } catch (error) {
        console.error("Error creating group:", error);
        toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.createGroupError });
    } finally {
        setIsCreatingGroup(false);
    }
  };
  
  const handleAddContent = async (type: 'class' | 'note' | 'reminder') => {
    if (!selectedGroup || !user) return;
    setIsAddingContent(true);

    try {
        let successMessage = "";
        if (type === 'class' && classLink && classTime) {
            await addContentToGroup(selectedGroup, 'scheduledClass', { link: classLink, time: classTime });
            successMessage = t_toast.classAdded;
            setClassLink(''); setClassTime('');
        } else if (type === 'note' && noteLink && noteTitle) {
            await addContentToGroup(selectedGroup, 'note', { link: noteLink, title: noteTitle });
            successMessage = t_toast.noteAdded;
            setNoteLink(''); setNoteTitle('');
        } else if (type === 'reminder' && reminderMessage) {
             await addContentToGroup(selectedGroup, 'reminder', { message: reminderMessage });
             successMessage = t_toast.reminderAdded;
             setReminderMessage('');
        }

        if (successMessage) {
            toast({ title: t_toast.contentAddedTitle, description: successMessage });
            await fetchDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error("Error adding content:", error);
        toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.addContentError });
    } finally {
        setIsAddingContent(false);
    }
  };

  const handleConfirmDissolve = async () => {
    if (!groupToDissolve) return;
    setIsDissolving(true);
    try {
      await dissolveGroup(groupToDissolve);
      toast({
        title: t_toast.groupDissolvedTitle,
        description: t_toast.groupDissolvedDescription,
      });
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error dissolving group:", error);
      toast({
        variant: "destructive",
        title: t_toast.errorTitle,
        description: t_toast.dissolveGroupError,
      });
    } finally {
      setIsDissolving(false);
      setGroupToDissolve(null);
    }
  };

  const handleAddStudents = async () => {
    if (!groupToManage || studentsToAdd.length === 0) return;
    setIsManagingGroup(true);
    try {
        await addStudentsToGroup(groupToManage.id, studentsToAdd);
        toast({ title: t_toast.studentsAddedTitle, description: t_toast.studentsAddedDescription });
        setStudentsToAdd([]);
        setGroupToManage(null);
        await fetchDashboardData();
    } catch (error) {
        console.error("Error adding students:", error);
        toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.addStudentsError });
    } finally {
        setIsManagingGroup(false);
    }
  };

  const handleRemoveStudents = async () => {
    if (!groupToManage || studentsToRemove.length === 0) return;
    if (studentsToRemove.length === groupToManage.studentIds.length) {
        toast({ variant: "destructive", title: t_toast.actionNotAllowedTitle, description: t_toast.removeAllStudentsError });
        return;
    }

    setIsManagingGroup(true);
    try {
        await removeStudentsFromGroup(groupToManage.id, studentsToRemove);
        toast({ title: t_toast.studentsRemovedTitle, description: t_toast.studentsRemovedDescription });
        setStudentsToRemove([]);
        setGroupToManage(null);
        await fetchDashboardData();
    } catch (error) {
        console.error("Error removing students:", error);
        toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.removeStudentsError });
    } finally {
        setIsManagingGroup(false);
    }
  };

  const handleUpdateStudentDetails = async () => {
    if (!studentToEdit) return;
    setIsUpdatingStudent(true);
    try {
      await updateStudentDetails(studentToEdit.id, editFormData);
      toast({ title: t_toast.studentUpdatedTitle, description: t_toast.studentUpdatedDescription });
      setStudentToEdit(null);
      await fetchDashboardData();
    } catch (error) {
      console.error("Error updating student:", error);
      toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.studentUpdateError });
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  const getStudentCourseInfo = (student: StudentProfile) => {
    const { courseStartDate, courseDuration } = student;
    if (!courseStartDate || !courseDuration) {
      return { endDate: '-', currentWeek: '-', status: '-' };
    }

    const startDate = new Date(courseStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + courseDuration * 7);

    const now = new Date();
    const currentWeek = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
    
    let status = 'Finalizado';
    if (now >= startDate && now <= endDate) {
      status = 'Activo';
    } else if (now < startDate) {
      status = 'Próximo';
    }

    return {
      endDate: endDate.toLocaleDateString(),
      currentWeek: currentWeek > 0 && currentWeek <= courseDuration ? currentWeek : '-',
      status: status,
    };
  };

  const studentsById = useMemo(() => new Map(data?.allStudents.map(s => [s.id, s])), [data?.allStudents]);
  
  const privateGroups = useMemo(() => data?.groups.filter(g => g.type === 'privado') || [], [data?.groups]);
  const smallGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo pequeño') || [], [data?.groups]);
  const largeGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo grande') || [], [data?.groups]);

  const filteredGroups = useMemo(() => {
    if (!selectedGroupType || !data?.groups) return [];
    return data.groups.filter(g => g.type === selectedGroupType);
  }, [selectedGroupType, data?.groups]);
  
  const availableStudentsForGroup = useMemo(() => {
    if (!groupToManage || !data) return [];
    const studentsInGroups = new Set(data.groups.flatMap(g => g.studentIds));
    return data.allStudents.filter(s => s.plan === groupToManage.type && !studentsInGroups.has(s.id));
  }, [groupToManage, data]);

  const currentGroupMembers = useMemo(() => {
    if (!groupToManage || !data) return [];
    return data.allStudents.filter(s => groupToManage.studentIds.includes(s.id));
  }, [groupToManage, data]);

  const studentsInGroups = useMemo(() => new Set(data?.groups.flatMap(g => g.studentIds)), [data?.groups]);

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
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students"><Users className="mr-2 h-4 w-4" />{t.tabs.students}</TabsTrigger>
            <TabsTrigger value="groups"><Users className="mr-2 h-4 w-4" />{t.tabs.groups}</TabsTrigger>
            <TabsTrigger value="content"><FilePlus className="mr-2 h-4 w-4" />{t.tabs.content}</TabsTrigger>
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
                                    const ungroupedIds = data?.allStudents.filter(s => !studentsInGroups.has(s.id)).map(s => s.id) || [];
                                    if(checked === true) setSelectedStudentIds(ungroupedIds);
                                    else setSelectedStudentIds([]);
                                }}
                                checked={!!data && (data.allStudents.filter(s => !studentsInGroups.has(s.id)).length > 0) && selectedStudentIds.length === data.allStudents.filter(s => !studentsInGroups.has(s.id)).length}
                            />
                        </TableHead>
                        <TableHead>{t.students.table.name}</TableHead>
                        <TableHead>{t.students.table.age}</TableHead>
                        <TableHead>{t.students.table.phone}</TableHead>
                        <TableHead>{t.students.table.email}</TableHead>
                        <TableHead>{t.students.table.plan}</TableHead>
                        <TableHead>{t.students.table.interests}</TableHead>
                        <TableHead>{t.students.table.level}</TableHead>
                        <TableHead>{t.students.table.duration}</TableHead>
                        <TableHead>{t.students.table.currentWeek}</TableHead>
                        <TableHead>{t.students.table.startDate}</TableHead>
                        <TableHead>{t.students.table.endDate}</TableHead>
                        <TableHead>{t.students.table.status}</TableHead>
                        <TableHead>{t.students.table.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.allStudents.filter(student => !studentsInGroups.has(student.id)).map(student => {
                         const courseInfo = getStudentCourseInfo(student);
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
                            <TableCell>{student.age || '-'}</TableCell>
                            <TableCell>{student.phone || '-'}</TableCell>
                            <TableCell>{student.email || '-'}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{student.plan || '-'}</Badge></TableCell>
                            <TableCell className="max-w-[200px]">
                              {student.interests && student.interests.length > 0 ? (
                                <div>
                                  {student.interests.map((interest) => (
                                    <div key={interest}>{interest}</div>
                                  ))}
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{student.level || '-'}</TableCell>
                            <TableCell>{student.courseDuration ? `${student.courseDuration} sem` : '-'}</TableCell>
                            <TableCell>{courseInfo.currentWeek}</TableCell>
                            <TableCell>{student.courseStartDate ? new Date(student.courseStartDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>{courseInfo.endDate}</TableCell>
                            <TableCell>
                                <Badge variant={courseInfo.status === 'Activo' ? 'default' : 'secondary'}>{courseInfo.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => setStudentToEdit(student)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Button onClick={handleCreateGroup} disabled={selectedStudentIds.length === 0 || isCreatingGroup} className="mt-4">
                  {isCreatingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <PlusCircle className="mr-2 h-4 w-4" /> {t.students.createGroupButton}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{t.groups.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                 <GroupSection title={t.groups.private} groups={privateGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} onManage={setGroupToManage} onView={setGroupToView}/>
                 <GroupSection title={t.groups.small} groups={smallGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} onManage={setGroupToManage} onView={setGroupToView}/>
                 <GroupSection title={t.groups.large} groups={largeGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} onManage={setGroupToManage} onView={setGroupToView}/>
                 {data?.groups.length === 0 && (
                    <p className="text-center text-muted-foreground">{t.groups.noGroups}</p>
                 )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{t.content.title}</CardTitle>
                <CardDescription>{t.content.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>{t.content.selectGroupType}</Label>
                        <Select
                            onValueChange={(value) => {
                                setSelectedGroupType(value as StudentPlan);
                                setSelectedGroup(null); // Reset group selection
                            }}
                            value={selectedGroupType || ''}
                        >
                            <SelectTrigger><SelectValue placeholder={t.content.selectTypePlaceholder} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="privado">{t.planTypes.privado}</SelectItem>
                                <SelectItem value="grupo pequeño">{t.planTypes.small}</SelectItem>
                                <SelectItem value="grupo grande">{t.planTypes.large}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedGroupType && (
                        <div className="space-y-2">
                            <Label>{t.content.selectGroup}</Label>
                             {filteredGroups.length > 0 ? (
                                <Select onValueChange={setSelectedGroup} value={selectedGroup || ''}>
                                    <SelectTrigger><SelectValue placeholder={t.content.selectGroupPlaceholder} /></SelectTrigger>
                                    <SelectContent>
                                        {filteredGroups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             ) : (
                                <div className="flex h-10 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">{t.content.noGroupsOfType}</p>
                                </div>
                             )}
                        </div>
                    )}
                </div>

                {selectedGroup && (
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Calendar className="h-5 w-5"/> {t.content.uploadClass.title}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="class-link">{t.content.uploadClass.link}</Label>
                          <Input id="class-link" value={classLink} onChange={e => setClassLink(e.target.value)} placeholder="https://meet.google.com/..." />
                        </div>
                         <div className="space-y-1">
                          <Label htmlFor="class-time">{t.content.uploadClass.dateTime}</Label>
                          <Input id="class-time" value={classTime} onChange={e => setClassTime(e.target.value)} type="datetime-local" />
                        </div>
                        <Button onClick={() => handleAddContent('class')} size="sm" className="w-full" disabled={isAddingContent || !classLink || !classTime}>
                           {isAddingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t.content.uploadClass.button}
                        </Button>
                      </CardContent>
                    </Card>
                     <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Notebook className="h-5 w-5"/> {t.content.uploadNote.title}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                         <div className="space-y-1">
                          <Label htmlFor="note-title">{t.content.uploadNote.titleLabel}</Label>
                          <Input id="note-title" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder={t.content.uploadNote.titlePlaceholder} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="note-link">{t.content.uploadNote.link}</Label>
                          <Input id="note-link" value={noteLink} onChange={e => setNoteLink(e.target.value)} placeholder="https://notion.so/..." />
                        </div>
                        <Button onClick={() => handleAddContent('note')} size="sm" className="w-full" disabled={isAddingContent || !noteLink || !noteTitle}>
                           {isAddingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t.content.uploadNote.button}
                        </Button>
                      </CardContent>
                    </Card>
                     <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Lightbulb className="h-5 w-5"/> {t.content.uploadReminder.title}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                         <div className="space-y-1">
                            <Label htmlFor="reminder-message">{t.content.uploadReminder.message}</Label>
                            <Textarea id="reminder-message" value={reminderMessage} onChange={e => setReminderMessage(e.target.value)} placeholder={t.content.uploadReminder.placeholder} />
                        </div>
                        <Button onClick={() => handleAddContent('reminder')} size="sm" className="w-full" disabled={isAddingContent || !reminderMessage}>
                           {isAddingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t.content.uploadReminder.button}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog for Dissolving Group */}
      <AlertDialog open={!!groupToDissolve} onOpenChange={(open) => !open && setGroupToDissolve(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dissolveDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{t.dissolveDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.dissolveDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDissolve} disabled={isDissolving} className="bg-destructive hover:bg-destructive/90">
              {isDissolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.dissolveDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog for Managing Group */}
      <Dialog open={!!groupToManage} onOpenChange={(open) => {
        if (!open) {
            setGroupToManage(null);
            setStudentsToAdd([]);
            setStudentsToRemove([]);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t.manageDialog.title}: {groupToManage?.name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="add">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add" disabled={groupToManage?.type === 'privado'}><UserPlus className="mr-2 h-4 w-4" />{t.manageDialog.addTab}</TabsTrigger>
                <TabsTrigger value="remove"><UserX className="mr-2 h-4 w-4" />{t.manageDialog.removeTab}</TabsTrigger>
            </TabsList>
            <TabsContent value="add">
                <Card>
                    <CardHeader><CardDescription>{t.manageDialog.addDescription}</CardDescription></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                          <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>{t.students.table.name}</TableHead>
                                    <TableHead>{t.students.table.interests}</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {availableStudentsForGroup.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell><Checkbox checked={studentsToAdd.includes(student.id)} onCheckedChange={(checked) => {
                                            setStudentsToAdd(prev => checked ? [...prev, student.id] : prev.filter(id => id !== student.id))
                                        }} /></TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.interests?.join(', ')}</TableCell>
                                    </TableRow>
                                ))}
                             </TableBody>
                          </Table>
                          {availableStudentsForGroup.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t.manageDialog.noAvailableStudents}</p>}
                        </ScrollArea>
                         <Button onClick={handleAddStudents} disabled={studentsToAdd.length === 0 || isManagingGroup} className="mt-4">
                            {isManagingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.manageDialog.addButton}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="remove">
                 <Card>
                    <CardHeader><CardDescription>{t.manageDialog.removeDescription}</CardDescription></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                            <Table>
                               <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>{t.students.table.name}</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {currentGroupMembers.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell><Checkbox checked={studentsToRemove.includes(student.id)} onCheckedChange={(checked) => {
                                            setStudentsToRemove(prev => checked ? [...prev, student.id] : prev.filter(id => id !== student.id))
                                        }} /></TableCell>
                                        <TableCell>{student.name}</TableCell>
                                    </TableRow>
                                ))}
                             </TableBody>
                            </Table>
                        </ScrollArea>
                         <Button variant="destructive" onClick={handleRemoveStudents} disabled={studentsToRemove.length === 0 || isManagingGroup} className="mt-4">
                            {isManagingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.manageDialog.removeButton}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Editing Student */}
      <Dialog open={!!studentToEdit} onOpenChange={(open) => !open && setStudentToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editStudentDialog.title.replace('{studentName}', studentToEdit?.name || '')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">{t.editStudentDialog.level}</Label>
              <Select value={editFormData.level} onValueChange={(value) => setEditFormData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t.editStudentDialog.levelPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {ENGLISH_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="courseStartDate" className="text-right">{t.editStudentDialog.startDate}</Label>
                <Input
                    id="courseStartDate"
                    type="date"
                    value={editFormData.courseStartDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, courseStartDate: e.target.value }))}
                    className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="courseDuration" className="text-right">{t.editStudentDialog.duration}</Label>
                <Input
                    id="courseDuration"
                    type="number"
                    value={editFormData.courseDuration}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, courseDuration: parseInt(e.target.value, 10) || 0 }))}
                    className="col-span-3"
                    placeholder={t.editStudentDialog.durationPlaceholder}
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t.editStudentDialog.cancel}</Button></DialogClose>
            <Button onClick={handleUpdateStudentDetails} disabled={isUpdatingStudent}>
              {isUpdatingStudent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.editStudentDialog.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Viewing Group Details */}
      <GroupDetailsDialog group={groupToView} studentsById={studentsById} isOpen={!!groupToView} onOpenChange={() => setGroupToView(null)} />

    </div>
  );
}
