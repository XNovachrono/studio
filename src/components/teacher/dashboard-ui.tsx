

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, Loader2, PlusCircle, Users, MoreVertical, Save, Trash2, Import, RefreshCw, Library, ChevronRight, Expand, Calendar as CalendarIcon, Send, History, FileUp, Video, Target, FileText, BookCheck, Users2, MessageSquareQuote, Goal, Notebook, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Palette, Table2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, StudentProfile, Group, Lesson, EditorContent, BankCard, AttendanceStatus } from "@/lib/types";
import { getTeacherDataForDashboard, getLessonsForGroup, createLessonForGroup, updateLesson, getBankCards, addContentToGroup, getBankFiles, updateGroupObjectives } from "@/lib/firestore";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Editor } from "../common/editor";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { BanksDashboardUI } from "./banks/dashboard-ui";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format, parseISO, addDays, isBefore, startOfToday, differenceInMinutes, addMinutes, parse } from "date-fns";
import { es } from "date-fns/locale";
import { TeacherDataSettings } from "./teacher-data-settings";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Separator } from "../ui/separator";


interface TeacherDashboardData {
  teacher: User;
  groups: Group[];
  allStudents: StudentProfile[];
  groupHistory: Group[];
}

interface TeacherDashboardUIProps {
}

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

const BankCardImporter = ({ onSelectCard, ownerId, isOpen, onOpenChange, bankType }: { onSelectCard: (content: EditorContent) => void; ownerId: string; isOpen: boolean; onOpenChange: (open: boolean) => void; bankType: 'objective' | 'homework' }) => {
    const [cards, setCards] = useState<BankCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.bankImporter;

    useEffect(() => {
        if (isOpen) {
            const fetchCards = async () => {
                setIsLoading(true);
                const fetchedCards = await getBankCards(bankType);
                setCards(fetchedCards);
                setIsLoading(false);
            };
            fetchCards();
        }
    }, [isOpen, bankType]);

    const handleSelect = (card: BankCard) => {
        onSelectCard(card.content!);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>{t.title}</DialogTitle></DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>
                ) : (
                    <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-2 pr-4">
                        {cards.length > 0 ? cards.map(card => (
                            <div key={card.id} className="flex justify-between items-center p-2 border rounded-md">
                                <div>
                                    <p className="font-medium">{card.name}</p>
                                    <p className="text-xs text-muted-foreground">Autor: {card.ownerName}</p>
                                </div>
                                <Button size="sm" onClick={() => handleSelect(card)}>{t.import}</Button>
                            </div>
                        )) : <p className="text-center text-muted-foreground">{t.noCards}</p>}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}

const FileBankImporter = ({ onSelectFile, isOpen, onOpenChange }: { onSelectFile: (file: BankCard) => void; isOpen: boolean; onOpenChange: (open: boolean) => void; }) => {
    const [files, setFiles] = useState<BankCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.fileImporter;
    const [bankType, setBankType] = useState<'image' | 'video' | 'audio'>('image');

    useEffect(() => {
        if (isOpen) {
            const fetchFiles = async () => {
                setIsLoading(true);
                const imageFiles = await getBankFiles('image');
                const videoFiles = await getBankFiles('video');
                const audioFiles = await getBankFiles('audio');
                setFiles([...imageFiles, ...videoFiles, ...audioFiles]);
                setIsLoading(false);
            };
            fetchFiles();
        }
    }, [isOpen]);

    const filteredFiles = files.filter(f => f.type === bankType);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>{t.title}</DialogTitle></DialogHeader>
                 <Tabs value={bankType} onValueChange={(value) => setBankType(value as any)}>
                    <TabsList>
                        <TabsTrigger value="image">{t.tabs.images}</TabsTrigger>
                        <TabsTrigger value="video">{t.tabs.videos}</TabsTrigger>
                        <TabsTrigger value="audio">{t.tabs.audios}</TabsTrigger>
                    </TabsList>
                    <TabsContent value={bankType}>
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin"/></div>
                        ) : (
                            <ScrollArea className="h-[50vh] mt-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
                                {filteredFiles.length > 0 ? filteredFiles.map(file => (
                                    <Card key={file.id}>
                                        <CardHeader>
                                            <CardTitle className="text-sm truncate">{file.name}</CardTitle>
                                            <CardDescription className="text-xs">{file.ownerName}</CardDescription>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button size="sm" onClick={() => onSelectFile(file)} className="w-full">
                                                <Import className="mr-2 h-4 w-4"/>
                                                {t.import}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )) : <p className="col-span-full text-center text-muted-foreground p-8">{t.noFiles}</p>}
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

type ModalType = 'objective' | 'classNote' | 'homework' | 'attendance' | 'comments' | null;

const GroupProgram = ({ group, onGroupUpdate, studentsById, teacherId, onLessonCreated, refreshLessonKey }: { group: Group, onGroupUpdate: () => void, studentsById: Map<string, StudentProfile>, teacherId: string, onLessonCreated: () => void, refreshLessonKey: number }) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.program;
    const t_toast = translations.teacherDashboard.toasts;
    const { toast } = useToast();
    const [mainObjective, setMainObjective] = useState(group.mainObjective);
    const [weeklyObjectives, setWeeklyObjectives] = useState(group.weeklyObjectives);
    const [isBankImporterOpen, setBankImporterOpen] = useState(false);
    const [importTarget, setImportTarget] = useState<'main' | 'weekly' | null>(null);
    const [isSavingMain, setIsSavingMain] = useState(false);
    const [isSavingWeekly, setIsSavingWeekly] = useState(false);

    const handleOpenBankImporter = (target: 'main' | 'weekly') => {
        setImportTarget(target);
        setBankImporterOpen(true);
    };

    const handleImportFromBank = (content: EditorContent) => {
        if (importTarget === 'main') {
            setMainObjective(content);
        } else if (importTarget === 'weekly') {
            setWeeklyObjectives(content);
        }
    };
    
    const handleSaveMainObjective = async () => {
        setIsSavingMain(true);
        try {
            await updateGroupObjectives(group.id, { mainObjective });
            toast({ title: t_toast.objectivesSavedTitle });
            onGroupUpdate();
        } catch (error) {
            console.error("Error saving main objective:", error);
            toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.saveObjectivesError });
        } finally {
            setIsSavingMain(false);
        }
    };

    const handleSaveWeeklyObjectives = async () => {
        setIsSavingWeekly(true);
        try {
            await updateGroupObjectives(group.id, { weeklyObjectives });
            toast({ title: t_toast.objectivesSavedTitle });
            onGroupUpdate();
        } catch (error) {
            console.error("Error saving weekly objectives:", error);
            toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.saveObjectivesError });
        } finally {
            setIsSavingWeekly(false);
        }
    };


    return (
        <div className="space-y-6">
            <BankCardImporter ownerId={group.teacherId} isOpen={isBankImporterOpen} onOpenChange={setBankImporterOpen} onSelectCard={handleImportFromBank} bankType="objective" />
            
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-headline">{t.mainObjective}</h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenBankImporter('main')}>
                            <Import className="mr-2 h-4 w-4" />
                            {translations.teacherDashboard.lessons.importFromBank}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleSaveMainObjective} disabled={isSavingMain}>
                            {isSavingMain ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            {t.saveButton}
                        </Button>
                    </div>
                </div>
                <Editor
                    content={mainObjective}
                    onChange={setMainObjective}
                    editable
                    placeholder={t.mainPlaceholder}
                />
            </div>

            <Separator />
            
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-headline">{t.weeklyObjectives}</h3>
                    <div className="flex gap-2">
                         <Button size="sm" variant="ghost" onClick={() => handleOpenBankImporter('weekly')}>
                            <Import className="mr-2 h-4 w-4" />
                            {translations.teacherDashboard.lessons.importFromBank}
                        </Button>
                         <Button size="sm" variant="ghost" onClick={handleSaveWeeklyObjectives} disabled={isSavingWeekly}>
                            {isSavingWeekly ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            {t.saveButton}
                        </Button>
                    </div>
                </div>
                <Editor
                    content={weeklyObjectives}
                    onChange={setWeeklyObjectives}
                    editable
                    placeholder={t.weeklyPlaceholder}
                />
            </div>
            
            <Separator />

            <div>
                 <h3 className="text-xl font-headline mb-4">{translations.teacherDashboard.lessons.title}</h3>
                 <GroupLessons key={refreshLessonKey} group={group} studentsById={studentsById} teacherId={teacherId} onLessonCreated={onLessonCreated} />
            </div>
        </div>
    );
};

const getYouTubeId = (url:string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getVimeoId = (url:string) => {
    const regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[3] : null;
}

const VideoPlayer = ({ url }: { url: string }) => {
    const youTubeId = getYouTubeId(url);
    if (youTubeId) {
        return (
            <iframe
                className="w-full aspect-video rounded-md"
                src={`https://www.youtube.com/embed/${youTubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        );
    }

    const vimeoId = getVimeoId(url);
    if (vimeoId) {
        return (
            <iframe
                 className="w-full aspect-video rounded-md"
                src={`https://player.vimeo.com/video/${vimeoId}`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
            ></iframe>
        );
    }
    
    // Fallback for direct video links
    if(url.match(/\.(mp4|webm|ogg)$/)) {
        return <video src={url} controls className="w-full aspect-video rounded-md" />
    }

    return <p className="text-sm text-muted-foreground">Enlace de video no compatible. Pega un enlace de YouTube, Vimeo o un enlace directo a un archivo de video.</p>;
};

const AttendancePopover = ({
  classStartTime,
  currentStatus,
  onSave,
  isClassTimeValid,
}: {
  classStartTime: Date;
  currentStatus: AttendanceStatus;
  onSave: (minutes: number) => void;
  isClassTimeValid: boolean;
}) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.lessons.attendancePopover;
    const [minutesLate, setMinutesLate] = useState(typeof currentStatus === 'object' ? currentStatus.tarde : 10);
    const [arrivalTime, setArrivalTime] = useState(() => {
        if (!isClassTimeValid) return '';
        const arrival = addMinutes(classStartTime, minutesLate);
        return format(arrival, 'HH:mm');
    });

    useEffect(() => {
        if (isClassTimeValid) {
            const arrival = addMinutes(classStartTime, minutesLate);
            setArrivalTime(format(arrival, 'HH:mm'));
        }
    }, [classStartTime, minutesLate, isClassTimeValid]);

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const mins = parseInt(e.target.value, 10);
        if (isNaN(mins) || mins < 0) {
            setMinutesLate(0);
            if (isClassTimeValid) setArrivalTime(format(classStartTime, 'HH:mm'));
            return;
        }
        setMinutesLate(mins);
        if (isClassTimeValid) {
            const newArrival = addMinutes(classStartTime, mins);
            setArrivalTime(format(newArrival, 'HH:mm'));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeValue = e.target.value;
        setArrivalTime(timeValue);
        if (!isClassTimeValid) return;
        try {
            const parsedTime = parse(timeValue, 'HH:mm', new Date());
            const diff = differenceInMinutes(parsedTime, classStartTime);
            setMinutesLate(diff > 0 ? diff : 0);
        } catch (error) {
            // Handle invalid time format if necessary
        }
    };
    
    const handleSaveClick = () => {
        onSave(minutesLate);
    };

    const renderContent = () => {
        if (!isClassTimeValid) {
            return <p className="text-sm text-destructive">{t.noTimeError}</p>;
        }
        if (isBefore(new Date(), classStartTime)) {
            return <p className="text-sm text-muted-foreground">{t.notStartedError}</p>;
        }

        return (
             <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">{t.title}</h4>
                    <p className="text-sm text-muted-foreground">
                        {t.description.replace('{time}', format(classStartTime, 'p', { locale: es }))}
                    </p>
                </div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="minutes">{t.minutesLate}</Label>
                        <Input
                            id="minutes"
                            type="number"
                            min="0"
                            value={minutesLate}
                            onChange={handleMinutesChange}
                            className="col-span-2 h-8"
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="arrival-time">{t.arrivalTime}</Label>
                        <Input
                            id="arrival-time"
                            type="time"
                            value={arrivalTime}
                            onChange={handleTimeChange}
                            className="col-span-2 h-8"
                        />
                    </div>
                </div>
                <Button onClick={handleSaveClick}>{t.saveButton}</Button>
            </div>
        )
    };


    return (
        <PopoverContent className="w-80">
           {renderContent()}
        </PopoverContent>
    );
};



const GroupLessons = ({ group, studentsById, teacherId, onLessonCreated }: { group: Group, studentsById: Map<string, StudentProfile>, teacherId: string, onLessonCreated: () => void }) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.lessons;
    const t_toast = translations.teacherDashboard.toasts;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [isBankImporterOpen, setBankImporterOpen] = useState(false);
    const [isFileBankImporterOpen, setFileBankImporterOpen] = useState(false);
    const [activeLessonIdForImport, setActiveLessonIdForImport] = useState<string | null>(null);
    const [activeFieldForImport, setActiveFieldForImport] = useState<keyof Lesson | null>(null);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);


    const [editedContent, setEditedContent] = useState<Record<string, Partial<Lesson>>>({});
    
    const groupMembers = useMemo(() => group.studentIds.map(id => studentsById.get(id)).filter(Boolean) as StudentProfile[], [group.studentIds, studentsById]);

    const fetchLessons = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const groupLessons = await getLessonsForGroup(group.id);
            setLessons(groupLessons);
        } catch (error) {
            console.error("Error fetching lessons:", error);
            setError(t_toast.lessonError);
            toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.lessonError });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, [group.id, onLessonCreated]);

    const handleSaveLesson = async (lessonId: string) => {
      if (!editedContent[lessonId]) return;
      setIsSaving(lessonId);
      try {
        await updateLesson(group.id, lessonId, editedContent[lessonId]);
        toast({ title: t_toast.lessonSavedTitle, description: t_toast.lessonSavedDescription });
        
        setLessons(prev => prev.map(l => l.id === lessonId ? {...l, ...editedContent[lessonId]} : l));
        setEditedContent(prev => {
            const newState = {...prev};
            delete newState[lessonId];
            return newState;
        });

      } catch(error) {
        console.error("Error saving lesson:", error);
        toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.saveLessonError });
      } finally {
        setIsSaving(null);
        setActiveModal(null);
      }
    };
    
    const handleOpenModal = (lessonId: string, modalType: ModalType) => {
        setSelectedLessonId(lessonId);
        setActiveModal(modalType);
    }

    const handleContentChange = (lessonId: string, field: keyof Lesson, value: any) => {
        setEditedContent(prev => ({
            ...prev,
            [lessonId]: {
                ...prev[lessonId],
                [field]: value
            }
        }));
    };
    
    const handleStudentCommentChange = (lessonId: string, studentId: string, value: EditorContent) => {
        const currentLesson = lessons.find(l => l.id === lessonId);
        if (!currentLesson) return;
        const currentComments = editedContent[lessonId]?.studentComments || currentLesson.studentComments || {};
        const newComments = { ...currentComments, [studentId]: value };
        handleContentChange(lessonId, 'studentComments', newComments);
    };

    const handleAttendanceChange = (lessonId: string, studentId: string, status: AttendanceStatus ) => {
        const currentLesson = lessons.find(l => l.id === lessonId);
        if (!currentLesson) return;
        
        const currentAttendance = editedContent[lessonId]?.attendance || currentLesson.attendance || {};
        const newAttendance = {
            ...currentAttendance,
            [studentId]: status,
        };
        handleContentChange(lessonId, 'attendance', newAttendance);
        
        // Also save immediately for quick attendance updates
        setIsSaving(lessonId);
         updateLesson(group.id, lessonId, { attendance: newAttendance }).then(() => {
            setLessons(prev => prev.map(l => l.id === lessonId ? {...l, attendance: newAttendance } : l));
            setIsSaving(null);
        }).catch(err => {
            console.error(err);
            toast({ variant: "destructive", title: "Error", description: "Could not save attendance." });
            setIsSaving(null);
        });
    };
    
    const handleOpenBankImporter = (lessonId: string, field: 'homework') => {
        setActiveLessonIdForImport(lessonId);
        setActiveFieldForImport(field);
        setBankImporterOpen(true);
    };
    
    const handleOpenFileBankImporter = (lessonId: string) => {
        setActiveLessonIdForImport(lessonId);
        setFileBankImporterOpen(true);
    };

    const handleImportFromBank = (content: EditorContent) => {
        if (activeLessonIdForImport && activeFieldForImport) {
            handleContentChange(activeLessonIdForImport, activeFieldForImport, content);
        }
    };
    
    const handleImportFileFromBank = (file: BankCard) => {
        if (!activeLessonIdForImport) return;

        const lesson = lessons.find(l => l.id === activeLessonIdForImport);
        if (!lesson) return;

        const currentEditorContent = editedContent[activeLessonIdForImport]?.homework || lesson.homework;
        
        let fileNode;
        if (file.type === 'image') {
            fileNode = { type: 'image', attrs: { src: file.fileUrl, alt: file.name } };
        } else if (file.type === 'video') {
            fileNode = { type: 'video', attrs: { src: file.fileUrl } };
        } else if (file.type === 'audio') {
            fileNode = { type: 'audio', attrs: { src: file.fileUrl } };
        }

        if (fileNode) {
            const newContent: EditorContent = {
                ...currentEditorContent,
                content: [...(currentEditorContent.content || []), { type: 'paragraph' }, fileNode],
            };
            handleContentChange(activeLessonIdForImport, 'homework', newContent);
        }
        setFileBankImporterOpen(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>{t_toast.errorTitle}</AlertTitle>
                <AlertDescription>
                    <p>{error}</p>
                    <Button variant="link" onClick={fetchLessons} className="p-0 mt-2 h-auto text-destructive-foreground">
                        <RefreshCw className="mr-2 h-4 w-4"/>
                        {t.retry}
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    const selectedLesson = lessons.find(l => l.id === selectedLessonId);
    
     const renderModalContent = () => {
        if (!selectedLesson) return null;
        
        const latestClass = group.content.scheduledClasses
            ?.map(c => ({...c, time: (typeof c.time === 'string' ? parseISO(c.time) : c.time)}))
            .filter(c => c.time instanceof Date && !isNaN(c.time.getTime()))
            .sort((a,b) => b.time.getTime() - a.time.getTime())
            [0];

        const isClassTimeValid = !!latestClass;
        const classStartTime = latestClass?.time || new Date();


        const attendanceForStudent = (studentId: string): AttendanceStatus => {
            const editedAttendance = editedContent[selectedLessonId!]?.attendance;
            if (editedAttendance && editedAttendance[studentId] !== undefined) {
                return editedAttendance[studentId];
            }
            return selectedLesson.attendance?.[studentId] ?? 'ausente';
        }
        
        switch(activeModal) {
            case 'objective':
                return (
                    <Editor
                        content={editedContent[selectedLesson.id]?.content ?? selectedLesson.content}
                        onChange={(newContent) => handleContentChange(selectedLesson.id, 'content', newContent)}
                        editable
                        placeholder={t.placeholders.objective}
                    />
                );
            case 'classNote':
                 return (
                     <Editor
                        content={editedContent[selectedLesson.id]?.classNote ?? selectedLesson.classNote}
                        onChange={(newContent) => handleContentChange(selectedLesson.id, 'classNote', newContent)}
                        editable
                        placeholder={t.placeholders.classNote}
                        initialHint={t.placeholders.classNote}
                    />
                );
            case 'homework':
                 return (
                    <>
                        <div className="flex gap-2 mb-4">
                            <Button size="sm" variant="outline" onClick={() => handleOpenBankImporter(selectedLesson.id, 'homework')}>
                                <Import className="mr-2 h-4 w-4" />
                                {t.importFromBank}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleOpenFileBankImporter(selectedLesson.id)}>
                                <FileUp className="mr-2 h-4 w-4"/>
                                {t.importFile}
                            </Button>
                        </div>
                        <Editor
                            content={editedContent[selectedLesson.id]?.homework ?? selectedLesson.homework}
                            onChange={(newContent) => handleContentChange(selectedLesson.id, 'homework', newContent)}
                            editable
                            placeholder={t.placeholders.homework}
                            initialHint={t.placeholders.homework}
                        />
                    </>
                );
            case 'attendance':
                return (
                    <div className="space-y-4">
                        {isClassTimeValid && (
                            <Alert>
                                <Clock className="h-4 w-4" />
                                <AlertTitle>{t.attendancePopover.classTimeTitle}</AlertTitle>
                                <AlertDescription>
                                    {t.attendancePopover.classTimeDescription.replace('{time}', format(classStartTime, 'PPpp', { locale: es }))}
                                </AlertDescription>
                            </Alert>
                        )}
                        {groupMembers.map(student => {
                            const studentAttendance = attendanceForStudent(student.id);
                            return (
                                <div key={student.id} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
                                    <span>{student.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={studentAttendance === 'presente' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleAttendanceChange(selectedLesson!.id, student.id, 'presente')}
                                        >
                                            {t.attendanceStates.presente}
                                        </Button>
                                        <Button
                                            variant={studentAttendance === 'ausente' ? 'destructive' : 'outline'}
                                            size="sm"
                                            onClick={() => handleAttendanceChange(selectedLesson!.id, student.id, 'ausente')}
                                        >
                                            {t.attendanceStates.ausente}
                                        </Button>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={typeof studentAttendance === 'object' ? 'secondary' : 'outline'}
                                                    size="sm"
                                                >
                                                    {t.attendanceStates.tarde}
                                                    {typeof studentAttendance === 'object' && ` (${studentAttendance.tarde} min)`}
                                                </Button>
                                            </PopoverTrigger>
                                            <AttendancePopover 
                                                classStartTime={classStartTime}
                                                currentStatus={studentAttendance}
                                                onSave={(minutes) => {
                                                    handleAttendanceChange(selectedLesson!.id, student.id, { tarde: minutes });
                                                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                                                }}
                                                isClassTimeValid={isClassTimeValid}
                                            />
                                        </Popover>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
             case 'comments':
                const studentComments = editedContent[selectedLesson.id]?.studentComments || selectedLesson.studentComments || {};
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">{t.generalComment}</h4>
                            <Editor
                                content={editedContent[selectedLesson.id]?.comments || selectedLesson.comments}
                                onChange={(newContent) => handleContentChange(selectedLesson.id, 'comments', newContent)}
                                editable
                                placeholder={t.placeholders.comments}
                            />
                        </div>
                        <Separator />
                        <div>
                             <h4 className="font-semibold mb-4">{t.studentComments}</h4>
                             <Accordion type="multiple" className="w-full space-y-2">
                                {groupMembers.map(student => (
                                    <AccordionItem value={student.id} key={student.id} className="border rounded-md">
                                        <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">{student.name}</AccordionTrigger>
                                        <AccordionContent className="p-3 border-t">
                                            <Editor
                                                content={studentComments[student.id] || { type: "doc", content: []}}
                                                onChange={(newContent) => handleStudentCommentChange(selectedLesson.id, student.id, newContent)}
                                                editable
                                                placeholder={`${t.placeholders.studentComment} ${student.name}...`}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }


    return (
        <div className="space-y-4">
             <BankCardImporter ownerId={teacherId} isOpen={isBankImporterOpen} onOpenChange={setBankImporterOpen} onSelectCard={handleImportFromBank} bankType="homework"/>
             <FileBankImporter isOpen={isFileBankImporterOpen} onOpenChange={setFileBankImporterOpen} onSelectFile={handleImportFileFromBank} />
             {lessons.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-4">
                 {lessons.map(lesson => {
                     const recordingLink = editedContent[lesson.id]?.recording?.link ?? lesson.recording?.link ?? "";
                     const showVideoPlayer = recordingLink.startsWith('http');
                     return (
                     <AccordionItem value={lesson.id} key={lesson.id} className="border rounded-lg bg-background">
                        <AccordionTrigger className="px-4 py-3 font-semibold text-lg hover:no-underline">
                           {lesson.name}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t">
                             <div className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="font-headline text-lg flex items-center gap-2"><Video /> {t.recording}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                 <Input 
                                                    placeholder={t.recordingPlaceholder}
                                                    value={recordingLink}
                                                    onChange={(e) => handleContentChange(lesson.id, 'recording', { link: e.target.value })}
                                                />
                                                <Button onClick={() => handleSaveLesson(lesson.id)} disabled={isSaving === lesson.id} size="icon">
                                                    {isSaving === lesson.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            {showVideoPlayer && <div className="mt-2"><VideoPlayer url={recordingLink} /></div>}
                                        </CardContent>
                                    </Card>
                                    <Card onClick={() => handleOpenModal(lesson.id, 'objective')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle className="font-headline text-base flex items-center gap-2"><Target/> {t.objective}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card onClick={() => handleOpenModal(lesson.id, 'classNote')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle className="font-headline text-base flex items-center gap-2"><FileText/> {t.classNote}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card onClick={() => handleOpenModal(lesson.id, 'homework')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle className="font-headline text-base flex items-center gap-2"><BookCheck/> {t.homework}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                     <Card onClick={() => handleOpenModal(lesson.id, 'attendance')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle className="font-headline text-base flex items-center gap-2"><Users2/> {t.attendance}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                     <Card onClick={() => handleOpenModal(lesson.id, 'comments')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle className="font-headline text-base flex items-center gap-2"><MessageSquareQuote/> {t.comments}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                 )})}
                 </Accordion>
            ) : (
                <p className="p-4 text-center text-muted-foreground">{t.noLessons}</p>
            )}

            <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">
                           Editar {activeModal === 'objective' && t.objective}
                                   {activeModal === 'classNote' && t.classNote}
                                   {activeModal === 'homework' && t.homework}
                                   {activeModal === 'attendance' && t.attendance}
                                   {activeModal === 'comments' && t.comments}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-auto py-4">
                        {renderModalContent()}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                        <Button onClick={() => selectedLesson && handleSaveLesson(selectedLesson.id)} disabled={isSaving === selectedLessonId}>
                            {isSaving === selectedLessonId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar y Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

const GroupCommunication = ({ group, studentsById, onClassScheduled, teacherName }: { group: Group, studentsById: Map<string, StudentProfile>, onClassScheduled: () => void, teacherName: string }) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.communication;
    const t_toast = translations.teacherDashboard.toasts;
    const { toast } = useToast();
    const [link, setLink] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("18:00");
    const [isScheduling, setIsScheduling] = useState(false);

    useEffect(() => {
        if (group.type === 'privado' && group.studentIds.length > 0) {
            const student = studentsById.get(group.studentIds[0]);
            if (student?.scheduledSlots && student.scheduledSlots.length > 0) {
                const today = startOfToday();
                const nextAvailableSlot = student.scheduledSlots
                    .map(s => ({ ...s, dateTime: parseISO(`${s.date}T${s.time}`) }))
                    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
                    .find(s => !isBefore(s.dateTime, today));

                if (nextAvailableSlot) {
                    setDate(parseISO(nextAvailableSlot.date));
                    setTime(nextAvailableSlot.time);
                }
            }
        }
    }, [group, studentsById]);


    const handleScheduleClass = async () => {
        if (!link || !date || !time) {
            toast({ variant: "destructive", description: t_toast.scheduleClassError });
            return;
        }
        setIsScheduling(true);

        const [hours, minutes] = time.split(':').map(Number);
        const scheduledDateTime = new Date(date);
        scheduledDateTime.setHours(hours, minutes);

        try {
            await addContentToGroup(group.id, 'scheduledClass', { link, time: scheduledDateTime }, teacherName);
            
            const groupStudents = group.studentIds.map(id => studentsById.get(id)).filter(Boolean) as StudentProfile[];
            await createLessonForGroup(group.id, group.name, groupStudents);

            toast({ title: t_toast.scheduleClassSuccessTitle, description: t_toast.scheduleClassSuccessDescription });
            setLink("");
            setDate(new Date());
            setTime("18:00");
            onClassScheduled(); 
        } catch (error) {
            console.error("Error scheduling class:", error);
            toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.genericError });
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t.scheduleClass.title}</CardTitle>
                    <CardDescription>{t.scheduleClass.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="class-link">{t.scheduleClass.link}</Label>
                        <Input id="class-link" placeholder="https://meet.google.com/..." value={link} onChange={(e) => setLink(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t.scheduleClass.date}</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: es }) : <span>{t.scheduleClass.selectDate}</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class-time">{t.scheduleClass.time}</Label>
                            <Input id="class-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleScheduleClass} disabled={isScheduling}>
                        {isScheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.scheduleClass.button}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t.sendReminder.title}</CardTitle>
                    <CardDescription>{t.sendReminder.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t.sendReminder.placeholder}</p>
                </CardContent>
            </Card>
        </div>
    );
};


const GroupDetailsDialog = ({ group, studentsById, isOpen, onOpenChange, onGroupUpdate, teacherId, teacherName }: { group: Group | null; studentsById: Map<string, StudentProfile>; isOpen: boolean; onOpenChange: (open: boolean) => void; onGroupUpdate: () => void; teacherId: string; teacherName: string; }) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.groups;
    const t_program = translations.teacherDashboard.program;
    const [studentToView, setStudentToView] = useState<StudentProfile | null>(null);
    const [refreshLessonKey, setRefreshLessonKey] = useState(0);

    if (!group) return null;

    const groupMembers = group.studentIds.map(id => studentsById.get(id)).filter(Boolean) as StudentProfile[];
    const isPrivateGroup = group.type === 'privado';
    const privateStudent = isPrivateGroup && groupMembers.length > 0 ? groupMembers[0] : null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{group.name}</DialogTitle>
                     <DialogDescription>
                      <Badge variant="secondary" className="capitalize">{group.type}</Badge>
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="program" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="shrink-0">
                        <TabsTrigger value="program"><Notebook className="mr-2 h-4 w-4"/>{t_program.title}</TabsTrigger>
                        <TabsTrigger value="members"><Users className="mr-2 h-4 w-4"/>Miembros</TabsTrigger>
                        <TabsTrigger value="communication"><Send className="mr-2 h-4 w-4"/>Comunicación</TabsTrigger>
                        {isPrivateGroup && <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4"/>Calendario</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="program" className="flex-grow overflow-auto p-4">
                        <GroupProgram 
                            group={group} 
                            onGroupUpdate={onGroupUpdate} 
                            studentsById={studentsById}
                            teacherId={teacherId}
                            onLessonCreated={() => setRefreshLessonKey(k => k + 1)}
                            refreshLessonKey={refreshLessonKey}
                        />
                    </TabsContent>
                    <TabsContent value="members" className="flex-grow overflow-auto p-4">
                         <ScrollArea className="h-full">
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
                    </TabsContent>
                     <TabsContent value="communication" className="flex-grow overflow-auto p-4">
                        <GroupCommunication group={group} studentsById={studentsById} onClassScheduled={() => setRefreshLessonKey(k => k + 1)} teacherName={teacherName}/>
                    </TabsContent>
                    {isPrivateGroup && (
                        <TabsContent value="calendar" className="flex-grow overflow-auto p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Disponibilidad del Estudiante</CardTitle>
                                    <CardDescription>
                                        Días y horas seleccionados por {privateStudent?.name || 'el estudiante'} para las clases.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {privateStudent?.scheduledSlots && privateStudent.scheduledSlots.length > 0 ? (
                                        <ScrollArea className="h-72">
                                            <div className="space-y-2 pr-4">
                                                {privateStudent.scheduledSlots.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(slot => (
                                                     <div key={slot.date} className="flex items-center justify-between gap-4 p-2 rounded-md bg-secondary/50">
                                                        <span className="font-medium">{format(parseISO(slot.date), "PPP", { locale: es })}</span>
                                                        <Badge variant="outline">{slot.time}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <p className="text-muted-foreground text-center pt-4">El estudiante aún no ha seleccionado su horario.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </DialogContent>
            <StudentDataDialog student={studentToView} isOpen={!!studentToView} onOpenChange={() => setStudentToView(null)} />
        </Dialog>
    );
};


const GroupSection = ({ title, groups, studentsById, onView }: { title: string; groups: Group[]; studentsById: Map<string, StudentProfile>; onView: (group: Group) => void; }) => {
  const { translations } = useLanguage();
  const t = translations.teacherDashboard.groups;
  
  if (groups.length === 0) {
    return null;
  }
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-headline text-foreground">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <Card key={group.id} className="flex flex-col">
             <div onClick={() => onView(group)} className="flex-grow cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                <CardHeader>
                    <CardTitle className="truncate">{group.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="capitalize">{group.type}</Badge>
                    </CardDescription>
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
             </div>
             <div className="p-2 border-t flex items-center justify-between">
               <div className="text-xs text-muted-foreground">
                    {group.studentIds.length} {t.members.toLowerCase()}
               </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(group)}>
                        <BookOpen className="mr-2 h-4 w-4"/>
                        {t.viewGroup}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4"/>
                        {t.editGroup}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>
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
  
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  
  const [groupToView, setGroupToView] = useState<Group | null>(null);
  const [isBanksModalOpen, setIsBanksModalOpen] = useState(false);
  
  const fetchDashboardData = async (teacherId: string) => {
      try {
        const teacherData = await getTeacherDataForDashboard(teacherId);
         // Role-based redirection
        if (teacherData.teacher.role !== 'teacher') {
            router.push(teacherData.teacher.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
            return;
        }
        setData(teacherData);
        // If a group is being viewed, update its data
        if (groupToView) {
            const updatedGroup = teacherData.groups.find(g => g.id === groupToView.id);
            if (updatedGroup) {
                setGroupToView(updatedGroup);
            } else {
                // The group might have been archived or is no longer active
                const updatedHistoryGroup = teacherData.groupHistory.find(g => g.id === groupToView.id);
                if(updatedHistoryGroup) setGroupToView(updatedHistoryGroup);
                else setGroupToView(null); // Or close it if it's gone completely
            }
        }
      } catch (error) {
          console.error("Error fetching teacher data:", error);
          const t_toast = translations.teacherDashboard.toasts;
          toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.dataError });
          router.push('/login');
      }
    };

  useEffect(() => {
    const storedUser = localStorage.getItem("uncoverly-user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    fetchDashboardData(parsedUser.id);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studentsById = useMemo(() => new Map(data?.allStudents.map(s => [s.id, s])), [data?.allStudents]);
  
  const privateGroups = useMemo(() => data?.groups.filter(g => g.type === 'privado') || [], [data?.groups]);
  const smallGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo pequeño') || [], [data?.groups]);
  const largeGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo grande') || [], [data?.groups]);
  const historicalGroups = useMemo(() => data?.groupHistory || [], [data?.groupHistory]);


  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  const user = data.teacher;

  return (
    <>
      <div className="flex h-screen flex-col">
        <DashboardHeader user={user} title={t.title} />
        <main className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
          <Tabs defaultValue="active">
              <TabsList>
                  <TabsTrigger value="active"><Users className="mr-2 h-4 w-4"/>{t.groups.title}</TabsTrigger>
                  <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>{t.groups.history}</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-6 space-y-8">
                  <GroupSection title={t.groups.private} groups={privateGroups} studentsById={studentsById} onView={setGroupToView}/>
                  <GroupSection title={t.groups.small} groups={smallGroups} studentsById={studentsById} onView={setGroupToView}/>
                  <GroupSection title={t.groups.large} groups={largeGroups} studentsById={studentsById} onView={setGroupToView}/>
                  {data?.groups.length === 0 && (
                      <p className="text-center text-muted-foreground pt-8">{t.groups.noGroups}</p>
                  )}
              </TabsContent>
              <TabsContent value="history" className="mt-6">
                  {historicalGroups.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {historicalGroups.map(group => (
                              <Card key={group.id}>
                                  <CardHeader>
                                      <CardTitle className="truncate">{group.name}</CardTitle>
                                      <CardDescription>
                                          <Badge variant="outline" className="capitalize">{group.type}</Badge>
                                      </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                      <p className="text-sm"><strong>Docente actual:</strong> {group.teacherName}</p>
                                      <p className="text-sm"><strong>Miembros:</strong> {group.studentIds.length}</p>
                                  </CardContent>
                              </Card>
                          ))}
                      </div>
                  ) : (
                      <p className="text-center text-muted-foreground pt-8">{t.groups.noHistory}</p>
                  )}
              </TabsContent>
          </Tabs>

          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">{t.banks.title}</CardTitle>
                  <CardDescription>{t.banks.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                  <Button onClick={() => setIsBanksModalOpen(true)}>
                      {t.banks.button}
                  </Button>
              </CardFooter>
          </Card>
        </main>
        
        <GroupDetailsDialog 
            group={groupToView} 
            studentsById={studentsById} 
            isOpen={!!groupToView} 
            onOpenChange={() => setGroupToView(null)} 
            onGroupUpdate={() => fetchDashboardData(user.id)}
            teacherId={user.id} 
            teacherName={user.name}
        />
      </div>
      <Dialog open={isBanksModalOpen} onOpenChange={setIsBanksModalOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-0">
                  <DialogTitle>{t.banks.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
                  <BanksDashboardUI user={user} isModal={true} />
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}



    
