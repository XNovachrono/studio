"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Users, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
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
import type { User, StudentProfile, Group, StudentPlan } from "@/lib/types";
import { getAdminData, createGroupWithTeacher } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/context/language-context";

interface AdminDashboardData {
  admin: User | null;
  groups: Group[];
  allStudents: StudentProfile[];
  allTeachers: User[];
}

const ENGLISH_LEVELS = ["A1", "A1.5", "A2", "A2.5", "B1", "B1.5", "C1", "C1.5", "C2"];

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students"><Users className="mr-2 h-4 w-4" />{t.tabs.students}</TabsTrigger>
            <TabsTrigger value="groups"><Users className="mr-2 h-4 w-4" />{t.tabs.groups}</TabsTrigger>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ungroupedStudents.map(student => (
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
                          <TableCell>{student.phone || '-'}</TableCell>
                          <TableCell>{student.level || '-'}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{student.plan || '-'}</Badge></TableCell>
                          <TableCell>{student.availability || '-'}</TableCell>
                        </TableRow>
                      ))}
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

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{t.groups.title}</CardTitle>
                <CardDescription>{t.groups.description}</CardDescription>
              </CardHeader>
               <CardContent>
                 {/* TODO: Group list for admin will go here */}
                 <p className="text-center text-muted-foreground">{t.groups.noGroups}</p>
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
    </div>
  );
}
