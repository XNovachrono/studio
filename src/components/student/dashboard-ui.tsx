
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Loader2, MessageCircleQuestion, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, Group, StudentProfile, Lesson, ScheduledClass, TeacherInteraction } from "@/lib/types";
import { getStudentData, getLessonsForGroup } from "@/lib/firestore";
import { useLanguage } from "@/context/language-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { Editor } from "../common/editor";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PqrsDialog } from "./pqrs-dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User as UserIcon } from "lucide-react";
import { Badge } from "../ui/badge";


interface StudentDashboardData {
    user: StudentProfile;
    group: Group | null;
    lessons: Lesson[];
}

export function StudentDashboardUI() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { translations } = useLanguage();
  const t = translations.studentDashboard;
  const t_teacher_lessons = translations.teacherDashboard.lessons;
  const [isPqrsDialogOpen, setPqrsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherInteraction | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("uncoverly-user");
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'student') {
            router.push('/login');
            return;
        }
         if (!parsedUser.hasOnboarded) {
            router.push('/student/onboarding');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const studentData = await getStudentData(parsedUser.id);
                let lessons: Lesson[] = [];
                if (studentData.group) {
                    lessons = await getLessonsForGroup(studentData.group.id);
                }
                setData({ ...studentData, lessons });
            } catch (error) {
                console.error("Error fetching student data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    } else {
        router.push("/login");
    }
  }, [router]);

  const handlePqrsClick = (teacher: TeacherInteraction) => {
    setSelectedTeacher(teacher);
    setPqrsDialogOpen(true);
  }

  const nextClass = useMemo(() => {
    if (!data?.group?.content?.scheduledClasses?.length) {
      return null;
    }
    // Sort classes to find the most recent one (or upcoming one in the future)
    const sortedClasses = [...data.group.content.scheduledClasses].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
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
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = data?.user;
  const lessons = data?.lessons || [];

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user || null} title={t.title} />
      <main className="flex-1 overflow-auto p-4 md:p-8 space-y-6">
        
        <div className="grid gap-6 md:grid-cols-2">
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
                             {format(new Date(nextClass.time), "eeee, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
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
                    <Accordion type="single" collapsible className="w-full">
                        {lessons.map(lesson => (
                            <AccordionItem value={lesson.id} key={lesson.id}>
                                <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                                    {lesson.name}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6 pl-2">
                                    {/* Recording */}
                                    <Card>
                                        <CardHeader><CardTitle>{t.lessons.recording}</CardTitle></CardHeader>
                                        <CardContent>
                                            {lesson.recording?.link ? (
                                                <a href={lesson.recording.link} target="_blank" rel="noopener noreferrer">
                                                    <Button>{t.lessons.viewRecording}</Button>
                                                </a>
                                            ) : <p className="text-muted-foreground">{t.lessons.noRecording}</p>}
                                        </CardContent>
                                    </Card>

                                    {/* Content */}
                                    <Card>
                                        <CardHeader><CardTitle>{t.lessons.content}</CardTitle></CardHeader>
                                        <CardContent>
                                            <Editor content={lesson.content} onChange={() => {}} editable={false} />
                                        </CardContent>
                                    </Card>
                                    
                                    {/* Class Note */}
                                    <Card>
                                        <CardHeader><CardTitle>{t.notes.title}</CardTitle></CardHeader>
                                        <CardContent>
                                            <Editor content={lesson.classNote} onChange={() => {}} editable={false} />
                                        </CardContent>
                                    </Card>
                                    
                                    {/* Homework */}
                                    <Card>
                                        <CardHeader><CardTitle>{t.lessons.homework}</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="font-semibold mb-2">{t.lessons.instructions}</p>
                                            <Editor content={lesson.homework} onChange={() => {}} editable={false} />
                                            <div className="p-4 border rounded-lg bg-secondary/50 mt-6">
                                                <p className="text-center font-semibold">{t.lessons.yourSubmission}</p>
                                                <p className="text-center text-muted-foreground text-sm">{t.lessons.noSubmission}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Attendance */}
                                     <Card>
                                        <CardHeader><CardTitle>{t_teacher_lessons.attendance}</CardTitle></CardHeader>
                                        <CardContent>
                                           <div className="flex items-center gap-2">
                                            <span>{t.lessons.yourStatus}:</span>
                                            <Badge variant="secondary" className="capitalize">
                                                {lesson.attendance[user!.id] || t_teacher_lessons.attendanceStates.na}
                                            </Badge>
                                           </div>
                                        </CardContent>
                                    </Card>

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

      {user && selectedTeacher && (
        <PqrsDialog 
          isOpen={isPqrsDialogOpen} 
          onOpenChange={setPqrsDialogOpen} 
          student={user}
          teacher={selectedTeacher}
        />
      )}
    </div>
  );
}
