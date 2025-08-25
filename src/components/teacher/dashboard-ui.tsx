
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Book, Calendar, FilePlus, Loader2, MoreVertical, Notebook, PlusCircle, Trash2, Users } from "lucide-react";

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
import { getTeacherData, createGroup, addContentToGroup, dissolveGroup } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

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
}

const GroupSection = ({ title, groups, studentsById, onDissolve }: GroupSectionProps) => {
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
                    <DropdownMenuItem onClick={() => onDissolve(group.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Disolver grupo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-semibold text-sm mb-2">Miembros:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {group.studentIds.map(id => (
                  <li key={id}>{studentsById.get(id)?.name || 'Desconocido'}</li>
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
  const [chapterName, setChapterName] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  
  // State for dissolving group
  const [groupToDissolve, setGroupToDissolve] = useState<string | null>(null);
  const [isDissolving, setIsDissolving] = useState(false);

  const fetchDashboardData = async () => {
      try {
        const teacherData = await getTeacherData();
        setData(teacherData);
      } catch (error) {
          console.error("Error fetching teacher data:", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos."});
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
  }, [router, toast]);

  const handleCreateGroup = async () => {
    if (selectedStudentIds.length === 0 || !user || !data) return;
    setIsCreatingGroup(true);

    const selectedStudentsData = data.allStudents.filter(s => selectedStudentIds.includes(s.id));
    const firstPlan = selectedStudentsData[0]?.plan;

    if (!firstPlan || !selectedStudentsData.every(s => s.plan === firstPlan)) {
      toast({
        variant: "destructive",
        title: "Error al crear grupo",
        description: "Todos los estudiantes deben tener el mismo plan.",
      });
      setIsCreatingGroup(false);
      return;
    }

    try {
        const studentsToGroup = selectedStudentsData.map(s => ({ id: s.id, name: s.name }));
        await createGroup(user.id, studentsToGroup, firstPlan);
        toast({
            title: "Grupo creado",
            description: `Se ha creado un nuevo grupo.`,
        });
        setSelectedStudentIds([]);
        await fetchDashboardData(); // Refresh data
    } catch (error) {
        console.error("Error creating group:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo crear el grupo."});
    } finally {
        setIsCreatingGroup(false);
    }
  };
  
  const handleAddContent = async (type: 'class' | 'note' | 'chapter') => {
    if (!selectedGroup) return;
    setIsAddingContent(true);

    try {
        let successMessage = "";
        if (type === 'class' && classLink && classTime) {
            await addContentToGroup(selectedGroup, 'scheduledClass', { link: classLink, time: classTime });
            successMessage = "Clase añadida.";
            setClassLink(''); setClassTime('');
        } else if (type === 'note' && noteLink) {
            await addContentToGroup(selectedGroup, 'note', { link: noteLink, title: `Nota - ${new Date().toLocaleDateString()}` });
            successMessage = "Nota añadida.";
            setNoteLink('');
        } else if (type === 'chapter' && chapterName && selectedBook) {
             await addContentToGroup(selectedGroup, 'bookChapter', { bookId: selectedBook, name: chapterName, pdfUrl: '/mock.pdf' }, chapterName);
             successMessage = "Capítulo/Libro añadido.";
             setChapterName('');
             setSelectedBook(null);
        }

        if (successMessage) {
            toast({ title: "Contenido añadido", description: successMessage });
            await fetchDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error("Error adding content:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el contenido."});
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
        title: "Grupo disuelto",
        description: "Los estudiantes ahora están disponibles nuevamente.",
      });
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error dissolving group:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo disolver el grupo.",
      });
    } finally {
      setIsDissolving(false);
      setGroupToDissolve(null);
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


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user} title="Panel de Docente" />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students"><Users className="mr-2 h-4 w-4" />Estudiantes</TabsTrigger>
            <TabsTrigger value="groups"><Users className="mr-2 h-4 w-4" />Grupos</TabsTrigger>
            <TabsTrigger value="content"><FilePlus className="mr-2 h-4 w-4" />Contenido</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Lista de Estudiantes Individuales</CardTitle>
                <CardDescription>Selecciona estudiantes para crear un nuevo grupo.</CardDescription>
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
                        <TableHead>Nombre</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Intereses</TableHead>
                        <TableHead>Disponibilidad</TableHead>
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
                  <PlusCircle className="mr-2 h-4 w-4" /> Crear Grupo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Grupos Creados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                 <GroupSection title="Grupos Privados" groups={privateGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} />
                 <GroupSection title="Grupos Pequeños" groups={smallGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} />
                 <GroupSection title="Grupos Grandes" groups={largeGroups} studentsById={studentsById} onDissolve={setGroupToDissolve} />
                 {data?.groups.length === 0 && (
                    <p className="text-center text-muted-foreground">Aún no se han creado grupos.</p>
                 )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Gestión de Contenido</CardTitle>
                <CardDescription>Selecciona un tipo de grupo y luego el grupo específico para añadirle contenido.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Selecciona un tipo de grupo</Label>
                        <Select
                            onValueChange={(value) => {
                                setSelectedGroupType(value as StudentPlan);
                                setSelectedGroup(null); // Reset group selection
                            }}
                            value={selectedGroupType || ''}
                        >
                            <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="privado">Privado</SelectItem>
                                <SelectItem value="grupo pequeño">Grupo Pequeño</SelectItem>
                                <SelectItem value="grupo grande">Grupo Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedGroupType && (
                        <div className="space-y-2">
                            <Label>Selecciona un grupo</Label>
                             {filteredGroups.length > 0 ? (
                                <Select onValueChange={setSelectedGroup} value={selectedGroup || ''}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona un grupo" /></SelectTrigger>
                                    <SelectContent>
                                        {filteredGroups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             ) : (
                                <div className="flex h-10 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">No existe grupo de este tipo</p>
                                </div>
                             )}
                        </div>
                    )}
                </div>

                {selectedGroup && (
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Calendar className="h-5 w-5"/> Cargar Clase</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="class-link">Link de clase</Label>
                          <Input id="class-link" value={classLink} onChange={e => setClassLink(e.target.value)} placeholder="https://meet.google.com/..." />
                        </div>
                         <div className="space-y-1">
                          <Label htmlFor="class-time">Fecha y hora</Label>
                          <Input id="class-time" value={classTime} onChange={e => setClassTime(e.target.value)} type="datetime-local" />
                        </div>
                        <Button onClick={() => handleAddContent('class')} size="sm" className="w-full" disabled={isAddingContent || !classLink || !classTime}>
                           {isAddingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Añadir Clase
                        </Button>
                      </CardContent>
                    </Card>
                     <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Notebook className="h-5 w-5"/> Cargar Nota</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="note-link">Link de Notion</Label>
                          <Input id="note-link" value={noteLink} onChange={e => setNoteLink(e.target.value)} placeholder="https://notion.so/..." />
                        </div>
                        <Button onClick={() => handleAddContent('note')} size="sm" className="w-full" disabled={isAddingContent || !noteLink}>
                           {isAddingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Añadir Nota
                        </Button>
                      </CardContent>
                    </Card>
                     <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Book className="h-5 w-5"/> Cargar Capítulo</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                         <div className="space-y-1">
                            <Label htmlFor="book-select">Libro</Label>
                            <Select onValueChange={setSelectedBook} value={selectedBook || ''}>
                                <SelectTrigger><SelectValue placeholder="Selecciona o crea libro" /></SelectTrigger>
                                <SelectContent>
                                    {data?.groups.find(g=>g.id === selectedGroup)?.content.books.map(b=><SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                                    <SelectItem value="new">Crear nuevo libro...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="chapter-name">Nombre del capítulo o libro</Label>
                          <Input id="chapter-name" value={chapterName} onChange={e => setChapterName(e.target.value)} placeholder="Título del libro o capítulo..." />
                        </div>
                        <Button onClick={() => handleAddContent('chapter')} size="sm" className="w-full" disabled={isAddingContent || !chapterName || !selectedBook}>
                           {isAddingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Añadir PDF
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

      <AlertDialog open={!!groupToDissolve} onOpenChange={(open) => !open && setGroupToDissolve(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. El grupo se eliminará y los estudiantes
              volverán a la lista de disponibles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDissolve} disabled={isDissolving} className="bg-destructive hover:bg-destructive/90">
              {isDissolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, disolver grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
