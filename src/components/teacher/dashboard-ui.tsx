"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Book, Calendar, FilePlus, Link, Loader2, Notebook, PlusCircle, Users } from "lucide-react";

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
import type { User, StudentProfile, Group } from "@/lib/types";

interface TeacherDashboardUIProps {
  user: User | null;
  initialAvailableStudents: StudentProfile[];
  initialGroups: Group[];
  allStudents: StudentProfile[];
}

export function TeacherDashboardUI({ user: initialUser, initialAvailableStudents, initialGroups, allStudents }: TeacherDashboardUIProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(initialUser);
  const [availableStudents, setAvailableStudents] = useState<StudentProfile[]>(initialAvailableStudents);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Form state for content management
  const [classLink, setClassLink] = useState('');
  const [classTime, setClassTime] = useState('');
  const [noteLink, setNoteLink] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  useEffect(() => {
    if (!initialUser) {
      const storedUser = localStorage.getItem("uncoverly-user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'teacher') {
            router.push('/login');
            return;
        }
        setUser(parsedUser);
      } else {
        router.push("/login");
      }
    }
  }, [initialUser, router]);

  const handleCreateGroup = () => {
    if (selectedStudentIds.length === 0) return;
    setIsLoading(true);

    const selectedStudents = allStudents.filter(s => selectedStudentIds.includes(s.id));
    const firstPlan = selectedStudents[0].plan;

    if (!selectedStudents.every(s => s.plan === firstPlan)) {
      toast({
        variant: "destructive",
        title: "Error al crear grupo",
        description: "Hay estudiantes con planes diferentes en este grupo.",
      });
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const newGroupId = Math.random().toString().slice(2, 9);
      const newGroup: Group = {
        id: newGroupId,
        name: `Grupo ${newGroupId}`,
        type: firstPlan!,
        studentIds: selectedStudentIds,
        teacherId: user!.id,
        content: { scheduledClasses: [], notes: [], books: [] },
      };

      setGroups(prev => [...prev, newGroup]);
      setAvailableStudents(prev => prev.filter(s => !selectedStudentIds.includes(s.id)));
      setSelectedStudentIds([]);
      toast({
        title: "Grupo creado",
        description: `Se ha creado el grupo ${newGroup.name} con ${selectedStudentIds.length} estudiantes.`,
      });
      setIsLoading(false);
    }, 1000);
  };
  
  const handleAddContent = (type: 'class' | 'note' | 'chapter') => {
    if (!selectedGroup) return;

    let successMessage = "";
    
    setGroups(prevGroups => prevGroups.map(g => {
        if (g.id === selectedGroup) {
            const newContent = { ...g.content };
            if (type === 'class' && classLink && classTime) {
                newContent.scheduledClasses.push({ id: `c${Date.now()}`, link: classLink, time: classTime });
                successMessage = "Clase añadida.";
            } else if (type === 'note' && noteLink) {
                newContent.notes.push({ id: `n${Date.now()}`, link: noteLink, title: `Nota - ${new Date().toLocaleDateString()}` });
                successMessage = "Nota añadida.";
            } else if (type === 'chapter' && chapterName && selectedBook) {
                const book = newContent.books.find(b => b.id === selectedBook);
                if (book) {
                    book.chapters.push({ id: `ch${Date.now()}`, name: chapterName, pdfUrl: '/mock.pdf' });
                } else {
                     newContent.books.push({ id: `b${Date.now()}`, title: chapterName, chapters: [{ id: `ch${Date.now()}`, name: 'Capítulo 1', pdfUrl: '/mock.pdf'}] });
                }
                 successMessage = "Capítulo añadido.";
            }
            return { ...g, content: newContent };
        }
        return g;
    }));

    if (successMessage) {
        toast({ title: "Contenido añadido", description: successMessage });
        // Reset forms
        setClassLink(''); setClassTime(''); setNoteLink(''); setChapterName('');
    }
  };

  const studentsById = useMemo(() => new Map(allStudents.map(s => [s.id, s])), [allStudents]);

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
                            if(checked) setSelectedStudentIds(availableStudents.map(s => s.id));
                            else setSelectedStudentIds([]);
                        }}
                        checked={selectedStudentIds.length === availableStudents.length && availableStudents.length > 0}
                        /></TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Intereses</TableHead>
                        <TableHead>Disponibilidad</TableHead>
                        <TableHead>Plan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableStudents.map(student => (
                        <TableRow key={student.id}>
                          <TableCell><Checkbox checked={selectedStudentIds.includes(student.id)} onCheckedChange={(checked) => {
                              setSelectedStudentIds(prev => checked ? [...prev, student.id] : prev.filter(id => id !== student.id));
                          }} /></TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.interests?.join(', ')}</TableCell>
                          <TableCell>{student.availability}</TableCell>
                          <TableCell><span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">{student.plan}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button onClick={handleCreateGroup} disabled={selectedStudentIds.length === 0 || isLoading} className="mt-4">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map(group => (
                  <Card key={group.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>ID: {group.id} - {group.type}</CardDescription>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Gestión de Contenido</CardTitle>
                <CardDescription>Selecciona un grupo para añadirle contenido.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select onValueChange={setSelectedGroup}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un grupo" /></SelectTrigger>
                  <SelectContent>
                    {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>

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
                        <Button onClick={() => handleAddContent('class')} size="sm" className="w-full">Añadir Clase</Button>
                      </CardContent>
                    </Card>
                     <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Notebook className="h-5 w-5"/> Cargar Nota</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="note-link">Link de Notion</Label>
                          <Input id="note-link" value={noteLink} onChange={e => setNoteLink(e.target.value)} placeholder="https://notion.so/..." />
                        </div>
                        <Button onClick={() => handleAddContent('note')} size="sm" className="w-full">Añadir Nota</Button>
                      </CardContent>
                    </Card>
                     <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Book className="h-5 w-5"/> Cargar Capítulo</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                         <div className="space-y-1">
                            <Label htmlFor="book-select">Libro</Label>
                            <Select onValueChange={setSelectedBook}>
                                <SelectTrigger><SelectValue placeholder="Selecciona o crea libro" /></SelectTrigger>
                                <SelectContent>
                                    {groups.find(g=>g.id === selectedGroup)?.content.books.map(b=><SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                                    <SelectItem value="new">Crear nuevo libro...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="chapter-name">Nombre del capítulo o libro</Label>
                          <Input id="chapter-name" value={chapterName} onChange={e => setChapterName(e.target.value)} placeholder="Título del libro o capítulo..." />
                        </div>
                        <Button onClick={() => handleAddContent('chapter')} size="sm" className="w-full">Añadir PDF</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
