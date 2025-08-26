
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Calendar, FilePlus, Loader2, MoreVertical, Notebook, PlusCircle, Trash2, UserPlus, UserX, Users } from "lucide-react";

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
import { getTeacherData, createGroup, addContentToGroup, dissolveGroup, addStudentsToGroup, removeStudentsFromGroup } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useLanguage } from "@/context/language-context";
import { Textarea } from "../ui/textarea";

interface TeacherDashboardData {
    teacher: User | null;
    availableStudents: StudentProfile[];
    groups: Group[];
    allStudents: StudentProfile[];
}

interface GroupSectionProps {
  title: string;
  groups: Group[];
  studentsById: Map<string, StudentProfile>;
  onDissolve: (groupId: string) => void;
  onManage: (group: Group) => void;
}

const GroupSection = ({ title, groups, studentsById, onDissolve, onManage }: GroupSectionProps) => {
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
          <Card key={group.id} className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="capitalize">{group.type}</Badge>
                </CardDescription>
              </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                {group.studentIds.map(id => (
                  <li key={id}>{studentsById.get(id)?.name || t.unknown}</li>
                ))}
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
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Content management state
  const [selectedGroupType, setSelectedGroupType] = useState<StudentPlan | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [classLink, setClassLink] = useState('');
  const [classTime, setClassTime] = useState('');
  const [noteLink, setNoteLink] = useState('');
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
    if (!selectedGroup) return;
    setIsAddingContent(true);

    try {
        let successMessage = "";
        if (type === 'class' && classLink && classTime) {
            await addContentToGroup(selectedGroup, 'scheduledClass', { link: classLink, time: classTime });
            successMessage = t_toast.classAdded;
            setClassLink(''); setClassTime('');
        } else if (type === 'note' && noteLink) {
            await addContentToGroup(selectedGroup, 'note', { link: noteLink, title: `Nota - ${new Date().toLocaleDateString()}` });
            successMessage = t_toast.noteAdded;
            setNoteLink('');
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
    return data.availableStudents.filter(s => s.plan === groupToManage.type);
  }, [groupToManage, data]);

  const currentGroupMembers = useMemo(() => {
    if (!groupToManage || !data) return [];
    return data.allStudents.filter(s => groupToManage.studentIds.includes(s.id));
  }, [groupToManage, data]);


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
                        <TableHead className="w-[50px]"><Checkbox onCheckedChange={(checked) => {
                            if(checked === true) setSelectedStudentIds(data?.availableStudents.map(s => s.id) || []);
                            else setSelectedStudentIds([]);
                        }}
                        checked={!!data && data.availableStudents.length > 0 && selectedStudentIds.length === data.availableStudents.length}
                        /></TableHead>
                        <TableHead>{t.students.table.name}</TableHead>
                        <TableHead>{t.students.table.plan}</TableHead>
                        <TableHead>{t.students.table.interests}</TableHead>
                        <TableHead>{t.students.table.availability}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.availableStudents.map(student => (
                        <TableRow key={student.id}>
                          <TableCell><Checkbox checked={selectedStudentIds.includes(student.id)} onCheckedChange={(checked) => {
                              setSelectedStudentIds(prev => checked ? [...prev, student.id] : prev.filter(id => id !== student.id));
                          }} /></TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{student.plan}</Badge>
                          </TableCell>
                          <TableCell>{student.interests?.join(', ')}</TableCell>
                          <TableCell>{student.availability}</TableCell>
                        </TableRow>
                      ))}
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
                 <GroupSection title={t.groups.private} groups={privateGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} onManage={setGroupToManage} />
                 <GroupSection title={t.groups.small} groups={smallGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} onManage={setGroupToManage} />
                 <GroupSection title={t.groups.large} groups={largeGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} onManage={setGroupToManage} />
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
                          <Label htmlFor="note-link">{t.content.uploadNote.link}</Label>
                          <Input id="note-link" value={noteLink} onChange={e => setNoteLink(e.target.value)} placeholder="https://notion.so/..." />
                        </div>
                        <Button onClick={() => handleAddContent('note')} size="sm" className="w-full" disabled={isAddingContent || !noteLink}>
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
    </div>
  );
}
