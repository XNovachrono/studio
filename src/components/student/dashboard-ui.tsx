
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Maximize, Notebook, Loader2, MessageCircleQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, Group, StudentProfile, TeacherInteraction } from "@/lib/types";
import { getStudentData, submitPQRS } from "@/lib/firestore";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/language-context";


interface StudentDashboardData {
    user: StudentProfile;
    group: Group | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

function FullScreenCard({ trigger, title, children }: { trigger: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="h-[90vh] max-w-[90vw] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function PqrsDialog({ teacher, studentId, studentEmail }: { teacher: TeacherInteraction; studentId: string; studentEmail: string }) {
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const { language, translations } = useLanguage();
    const t = translations.studentDashboard.pqrsDialog;
    const t_toast = translations.studentDashboard.toasts;
    
    const dateLocale = language === 'es' ? es : enUS;
    const lastInteractionText = t.lastInteraction.replace('{time}', formatDistanceToNow(new Date(teacher.lastInteraction), { addSuffix: true, locale: dateLocale }));

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast({ variant: 'destructive', description: t_toast.emptyMessage });
            return;
        }
        setIsSubmitting(true);
        try {
            await submitPQRS({
                studentId,
                studentEmail,
                teacherId: teacher.teacherId,
                message,
                isAnonymous,
            });
            toast({ title: t_toast.pqrsSentTitle, description: t_toast.pqrsSentDescription });
            setMessage('');
            setIsAnonymous(false);
            setIsOpen(false);
        } catch (error) {
            console.error("Error submitting PQRS:", error);
            toast({ variant: 'destructive', title: t_toast.errorTitle, description: t_toast.errorDescription });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="block w-full text-left rounded-lg p-3 hover:bg-secondary">
                    <p className="font-semibold">{teacher.teacherName}</p>
                    <p className="text-sm text-muted-foreground">
                        {lastInteractionText}
                    </p>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.title.replace('{teacherName}', teacher.teacherName)}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="pqrs-message">{t.messageLabel}</Label>
                        <Textarea id="pqrs-message" placeholder={t.messagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(!!checked)} />
                        <label htmlFor="anonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t.anonymousLabel}
                        </label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">{t.cancelButton}</Button></DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.submitButton}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function StudentDashboardUI() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language, translations } = useLanguage();
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
                setData(studentData);
            } catch (error) {
                console.error("Error fetching student data:", error);
                // Handle error (e.g., show toast)
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    } else {
        router.push("/login");
    }
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'full', timeStyle: 'short' });
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = data?.user;
  const content = data?.group?.content || { scheduledClasses: [], notes: [] };
  const teacherInteractions = user?.teacherInteractions || [];

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user || null} title={t.title} />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Clases Programadas */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl">{t.scheduledClasses.title}</CardTitle>
                </div>
                 <FullScreenCard
                  trigger={<Button variant="ghost" size="icon"><Maximize className="h-4 w-4" /></Button>}
                  title={t.scheduledClasses.title}
                >
                  {content.scheduledClasses.length > 0 ? (
                    <ul className="space-y-4 p-4">
                      {content.scheduledClasses.map(c => (
                        <li key={c.id} className="rounded-lg border p-4">
                          <p className="font-semibold">{formatDate(c.time)}</p>
                          <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">{t.scheduledClasses.joinButton}</a>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="p-4 text-center text-muted-foreground">{t.scheduledClasses.noClasses}</p>}
                </FullScreenCard>
              </CardHeader>
              <CardContent>
                {content.scheduledClasses.length > 0 ? (
                  <ul className="space-y-2">
                    {content.scheduledClasses.slice(0, 3).map(c => (
                      <li key={c.id}>
                        <a href={c.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg p-3 hover:bg-secondary">
                          <p className="font-semibold">{formatDate(c.time)}</p>
                          <p className="text-sm text-accent hover:underline">{t.scheduledClasses.classLink}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-center text-muted-foreground">{t.scheduledClasses.noClasses}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notas */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center gap-2">
                  <Notebook className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl">{t.notes.title}</CardTitle>
                 </div>
                 <FullScreenCard
                    trigger={<Button variant="ghost" size="icon"><Maximize className="h-4 w-4" /></Button>}
                    title={t.notes.fullScreenTitle}
                  >
                     {content.notes.length > 0 ? (
                        <ul className="space-y-2 p-4">
                          {content.notes.map(n => (
                            <li key={n.id}>
                               <a href={n.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg border p-4 hover:bg-secondary">
                                  <p className="font-semibold">{n.title}</p>
                                  <p className="text-sm text-accent hover:underline">{t.notes.viewButton}</p>
                               </a>
                            </li>
                          ))}
                        </ul>
                     ) : <p className="p-4 text-center text-muted-foreground">{t.notes.noNotes}</p>}
                 </FullScreenCard>
              </CardHeader>
              <CardContent>
                {content.notes.length > 0 ? (
                  <ul className="space-y-2">
                    {content.notes.slice(0, 3).map(n => (
                      <li key={n.id}>
                        <a href={n.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg p-3 hover:bg-secondary">
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-sm text-accent hover:underline">{t.notes.viewButton}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-center text-muted-foreground">{t.notes.noNotes}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* PQRS */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="h-full">
              <CardHeader>
                  <div className="flex items-center gap-2">
                      <MessageCircleQuestion className="h-6 w-6 text-primary" />
                      <CardTitle className="font-headline text-xl">{t.pqrs.title}</CardTitle>
                  </div>
                  <CardDescription>{t.pqrs.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {teacherInteractions.length > 0 && user ? (
                    <ul className="space-y-2">
                        {teacherInteractions.map(teacher => (
                            <li key={teacher.teacherId}>
                                <PqrsDialog teacher={teacher} studentId={user.id} studentEmail={user.email || ''} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground">{t.pqrs.noInteractions}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
