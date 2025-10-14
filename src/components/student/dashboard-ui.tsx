

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar as CalendarIcon, Loader2, MessageCircleQuestion, Video, Target, FileText, BookCheck, Users2, MessageSquareQuote, Goal, Notebook } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, Group, StudentProfile, Lesson, ScheduledClass, TeacherInteraction } from "@/lib/types";
import { getStudentData, getLessonsForGroup, updateUserProfile } from "@/lib/firestore";
import { useLanguage } from "@/context/language-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { Editor } from "../common/editor";
import { format, parse, parseISO, isSameDay, getWeek, isFuture } from "date-fns";
import { es } from "date-fns/locale";
import { PqrsDialog } from "./pqrs-dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User as UserIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { StudentNotesManager } from "./notes-manager";


interface StudentDashboardData {
    user: StudentProfile;
    group: Group | null;
    lessons: Lesson[];
}

const CalendarDialog = ({ user, onOpenChange, isOpen }: { user: StudentProfile, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const [slots, setSlots] = useState(user.scheduledSlots || []);
    const maxClassesPerWeek = user.classesPerWeek || 1;

    const selectedDates = useMemo(() => slots.map(s => parseISO(s.date)), [slots]);

    const handleDayClick = (day: Date) => {
        const isAlreadySelected = slots.some(s => isSameDay(parseISO(s.date), day));
        
        if (isAlreadySelected) {
            // If it's selected, remove it
            setSlots(prevSlots => prevSlots.filter(s => !isSameDay(parseISO(s.date), day)));
        } else {
            // If it's not selected, check the weekly limit before adding
            const weekNumber = getWeek(day, { weekStartsOn: 1 });
            const classesInSameWeek = slots.filter(s => getWeek(parseISO(s.date), { weekStartsOn: 1 }) === weekNumber).length;

            if (classesInSameWeek >= maxClassesPerWeek) {
                toast({
                    variant: "destructive",
                    title: "Límite semanal alcanzado",
                    description: `Ya has seleccionado el máximo de ${maxClassesPerWeek} clases para esta semana.`,
                });
                return;
            }

            // Add the new slot
            const newSlot = { date: format(day, 'yyyy-MM-dd'), time: '18:00' };
            setSlots(prevSlots => [...prevSlots, newSlot].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        }
    };

    const handleTimeChange = (date: string, time: string) => {
        setSlots(prevSlots => prevSlots.map(s => s.date === date ? { ...s, time } : s));
    };

    const handleSave = async () => {
        try {
            await updateUserProfile(user.id, { scheduledSlots: slots });
            toast({ title: "Calendario actualizado", description: "Tus preferencias de horario han sido guardadas." });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar tu horario." });
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Selecciona tu Horario</DialogTitle>
                     <DialogDescription>Selecciona los días y horas que te gustaría tener clase. Tu docente verá tu disponibilidad.</DialogDescription>
                </DialogHeader>
                <div className="py-4 grid md:grid-cols-2 gap-6">
                     <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onDayClick={handleDayClick}
                        className="rounded-md border self-start"
                        disabled={(date) => !isFuture(date) && !isSameDay(date, new Date())}
                    />
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Clases por Semana</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">Tienes un máximo de <span className="font-bold">{maxClassesPerWeek}</span> clases por semana.</p>
                            </CardContent>
                        </Card>
                        <h3 className="font-semibold text-lg">Horarios Seleccionados</h3>
                        <ScrollArea className="h-60">
                            <div className="space-y-3 pr-4">
                                {slots.length > 0 ? slots.map(slot => (
                                     <div key={slot.date} className="flex items-center justify-between gap-4 p-2 rounded-md bg-secondary/50">
                                        <span className="font-medium">{format(parseISO(slot.date), "PPP", { locale: es })}</span>
                                        <Input 
                                            type="time" 
                                            value={slot.time}
                                            onChange={(e) => handleTimeChange(slot.date, e.target.value)}
                                            className="w-32"
                                        />
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center pt-8">Selecciona uno o más días del calendario.</p>}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Horario</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export function StudentDashboardUI() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { translations } = useLanguage();
  const t = translations.studentDashboard;
  const t_teacher_lessons = translations.teacherDashboard.lessons;
  const t_goals = translations.studentDashboard.goals;
  const t_schedule = translations.studentDashboard.scheduleClass;
  const t_notes = translations.studentDashboard.notes;

  const [isPqrsDialogOpen, setPqrsDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotesManagerOpen, setNotesManagerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherInteraction | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [modalContent, setModalContent] = useState<keyof Lesson | null>(null);


  const fetchDashboardData = async () => {
        const storedUser = localStorage.getItem("uncoverly-user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        
        setIsLoading(true);
        try {
            const studentData = await getStudentData(parsedUser.id);
            
            // Role-based redirection
            if (studentData.user.role !== 'student') {
                router.push(studentData.user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
                return;
            }
             if (!studentData.user.hasOnboarded) {
                router.push('/student/onboarding');
                return;
            }

            let lessons: Lesson[] = [];
            if (studentData.group) {
                lessons = await getLessonsForGroup(studentData.group.id);
            }
            setData({ ...studentData, lessons });
        } catch (error) {
            console.error("Error fetching student data:", error);
            // If profile doesn't exist or another error, maybe send back to login
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePqrsClick = (teacher: TeacherInteraction) => {
    setSelectedTeacher(teacher);
    setPqrsDialogOpen(true);
  }

  const handleCardClick = (lesson: Lesson, contentKey: keyof Lesson) => {
    setActiveLesson(lesson);
    setModalContent(contentKey);
  };
  
  const handleCloseModal = () => {
    setActiveLesson(null);
    setModalContent(null);
  }

  const nextClass = useMemo(() => {
    if (!data?.group?.content?.scheduledClasses?.length) {
      return null;
    }
    // Sort classes to find the most recent one (or upcoming one in the future)
    const sortedClasses = [...data.group.content.scheduledClasses].sort(
      (a, b) => new Date(b.time as string).getTime() - new Date(a.time as string).getTime()
    );
    return sortedClasses[0];
  }, [data?.group]);

  const currentTeacher = useMemo((): TeacherInteraction | null => {
    if (!data?.group?.teacherId || !data.group.teacherName) {
      return null;
    }
    return {
      teacherId: data.group.teacherId,
      teacherName: data.group.teacherName,
      lastInteraction: new Date().toISOString(), // This can be a placeholder or fetched if needed
    };
  }, [data?.group]);
  
  if (isLoading || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = data?.user;
  const lessons = data?.lessons || [];
  const isPrivateStudent = user?.plan === 'privado';

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user || null} title={t.title} />
      <main className="flex-1 overflow-auto p-4 md:p-8 space-y-6">
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {/* Next Class Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Video />
                        {t.nextClass.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {nextClass ? (
                        <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-secondary/50 space-y-3">
                           <p className="font-semibold text-lg">
                             {format(typeof nextClass.time === 'string' ? parseISO(nextClass.time) : nextClass.time, "eeee, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                           </p>
                           <a href={nextClass.link} target="_blank" rel="noopener noreferrer">
                             <Button size="lg">{t.nextClass.joinButton}</Button>
                           </a>
                        </div>
                    ) : (
                        <p className="p-4 text-center text-muted-foreground">{t.nextClass.noClass}</p>
                    )}
                </CardContent>
            </Card>

            {/* Notes Card */}
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Notebook />
                        {t_notes.title}
                    </CardTitle>
                     <CardDescription>{t_notes.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={() => setNotesManagerOpen(true)}>{t_notes.manageButton}</Button>
                </CardContent>
            </Card>

            {/* Goals Card */}
            {data.group && (
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <Goal />
                            {t_goals.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="multiple" className="w-full space-y-4">
                            <AccordionItem value="main-objective">
                                <Card>
                                    <CardHeader>
                                        <AccordionTrigger>
                                            <CardTitle className="font-headline text-lg">{t_goals.mainObjective}</CardTitle>
                                        </AccordionTrigger>
                                    </CardHeader>
                                    <AccordionContent>
                                        <CardContent>
                                            <Editor content={data.group.mainObjective} onChange={() => {}} editable={false} />
                                        </CardContent>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                             <AccordionItem value="weekly-objectives">
                                <Card>
                                    <CardHeader>
                                        <AccordionTrigger>
                                            <CardTitle className="font-headline text-lg">{t_goals.weeklyObjectives}</CardTitle>
                                        </AccordionTrigger>
                                    </CardHeader>
                                    <AccordionContent>
                                        <CardContent>
                                            <Editor content={data.group.weeklyObjectives} onChange={() => {}} editable={false} />
                                        </CardContent>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            )}

            {/* PQRS Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <MessageCircleQuestion />
                        {t.pqrs.title}
                    </CardTitle>
                    <CardDescription>{t.pqrs.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {currentTeacher ? (
                      <div className="flex items-center justify-between p-2 rounded-md">
                           <div className="flex items-center gap-3">
                               <Avatar className="h-9 w-9">
                                   <AvatarFallback><UserIcon className="h-5 w-5"/></AvatarFallback>
                               </Avatar>
                               <div>
                                   <p className="font-semibold">{currentTeacher.teacherName}</p>
                                   <p className="text-xs text-muted-foreground">{t.pqrsDialog.teacherPrefix}</p>
                               </div>
                           </div>
                          <Button variant="outline" onClick={() => handlePqrsClick(currentTeacher)}>{t.pqrs.contactButton}</Button>
                      </div>
                    ) : (
                       <p className="p-4 text-center text-muted-foreground">{t.pqrs.noInteractions}</p>
                    )}
                </CardContent>
            </Card>
            
             {/* Calendar Card - Only for private students */}
            {isPrivateStudent && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <CalendarIcon />
                            {t_schedule.title}
                        </CardTitle>
                        <CardDescription>{t_schedule.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => setIsCalendarOpen(true)}>{t_schedule.button}</Button>
                    </CardContent>
                </Card>
            )}
        </div>


        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BookOpen />
                    {t.lessons.title}
                </CardTitle>
                <CardDescription>{t.lessons.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {lessons.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {lessons.map(lesson => (
                            <AccordionItem value={lesson.id} key={lesson.id} className="border rounded-lg bg-background">
                                <AccordionTrigger className="px-4 py-3 font-semibold text-lg hover:no-underline">
                                    {lesson.name}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t space-y-4">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <Card>
                                            <CardHeader>
                                                <CardTitle className="font-headline text-base flex items-center gap-2"><Video /> {t.lessons.recording}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {lesson.recording?.link ? (
                                                    <a href={lesson.recording.link} target="_blank" rel="noopener noreferrer">
                                                        <Button>{t.lessons.viewRecording}</Button>
                                                    </a>
                                                ) : <p className="text-muted-foreground text-sm">{t.lessons.noRecording}</p>}
                                            </CardContent>
                                        </Card>
                                        <Card onClick={() => handleCardClick(lesson, 'content')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                            <CardHeader>
                                                <CardTitle className="font-headline text-base flex items-center gap-2"><Target/> {t.lessons.content}</CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card onClick={() => handleCardClick(lesson, 'classNote')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                            <CardHeader>
                                                <CardTitle className="font-headline text-base flex items-center gap-2"><FileText/> {t.classNotes.title}</CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card onClick={() => handleCardClick(lesson, 'homework')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                            <CardHeader>
                                                <CardTitle className="font-headline text-base flex items-center gap-2"><BookCheck/> {t.lessons.homework}</CardTitle>
                                            </CardHeader>
                                        </Card>
                                         <Card>
                                            <CardHeader>
                                                <CardTitle className="font-headline text-base flex items-center gap-2"><Users2/> {t_teacher_lessons.attendance}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span>{t.lessons.yourStatus}:</span>
                                                    <Badge variant="secondary" className="capitalize">
                                                        {lesson.attendance[user!.id] || t_teacher_lessons.attendanceStates.na}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                     </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="p-4 text-center text-muted-foreground">{t.lessons.noLessons}</p>
                )}
            </CardContent>
        </Card>
      </main>

      <Dialog open={!!activeLesson} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {modalContent === 'content' && t.lessons.content}
              {modalContent === 'classNote' && t.classNotes.title}
              {modalContent === 'homework' && t.lessons.homework}
            </DialogTitle>
             <DialogDescription>{activeLesson?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {activeLesson && modalContent && (
              <Editor content={activeLesson[modalContent as keyof Lesson]} onChange={() => {}} editable={false} />
            )}
             {activeLesson && modalContent === 'homework' && (
                  <div className="p-4 border rounded-lg bg-secondary/50 mt-6">
                    <p className="text-center font-semibold">{t.lessons.yourSubmission}</p>
                    <p className="text-center text-muted-foreground text-sm">{t.lessons.noSubmission}</p>
                  </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {user && currentTeacher && (
        <PqrsDialog 
          isOpen={isPqrsDialogOpen} 
          onOpenChange={setPqrsDialogOpen} 
          student={user}
          teacher={currentTeacher}
        />
      )}
      {user && isPrivateStudent && (
        <CalendarDialog user={user} isOpen={isCalendarOpen} onOpenChange={setIsCalendarOpen} />
      )}
      {user && (
          <StudentNotesManager 
            isOpen={isNotesManagerOpen} 
            onOpenChange={setNotesManagerOpen}
            student={user}
            lessons={lessons}
          />
      )}
    </div>
  );
}
