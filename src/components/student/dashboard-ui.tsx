
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Loader2, MessageCircleQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, Group, StudentProfile, Lesson } from "@/lib/types";
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
      <main className="flex-1 overflow-auto p-4 md:p-8">
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
                                        <CardHeader><CardTitle>{t.lessons.attendance}</CardTitle></CardHeader>
                                        <CardContent>
                                            <p>{t.lessons.yourStatus}: <span className="font-semibold capitalize">{lesson.attendance[user!.id] || t.lessons.notRegistered}</span></p>
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
    </div>
  );
}
