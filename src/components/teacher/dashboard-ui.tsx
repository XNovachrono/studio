

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, Loader2, PlusCircle, Users, MoreVertical, Save, Trash2, Import, RefreshCw, Library, ChevronRight, Expand, Calendar as CalendarIcon, Send, History, FileUp, Video, Target, FileText, BookCheck, Users2, MessageSquareQuote } from "lucide-react";
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
import { getTeacherDataForDashboard, getLessonsForGroup, createLessonForGroup, updateLesson, getBankCards, addContentToGroup, getBankFiles } from "@/lib/firestore";
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
import { format, parseISO, addDays, isBefore, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { TeacherDataSettings } from "./teacher-data-settings";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";


interface TeacherDashboardData {
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

const BankCardImporter = ({ onSelectCard, ownerId, isOpen, onOpenChange }: { onSelectCard: (content: EditorContent) => void; ownerId: string; isOpen: boolean; onOpenChange: (open: boolean) => void; }) => {
    const [cards, setCards] = useState<BankCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.bankImporter;

    useEffect(() => {
        if (isOpen) {
            const fetchCards = async () => {
                setIsLoading(true);
                const fetchedCards = await getBankCards('objective');
                setCards(fetchedCards);
                setIsLoading(false);
            };
            fetchCards();
        }
    }, [isOpen]);

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

type ModalType = 'content' | 'classNote' | 'homework' | 'attendance' | 'comments' | null;

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

    const handleAttendanceChange = (lessonId: string, studentId: string, status: AttendanceStatus) => {
        const currentLesson = lessons.find(l => l.id === lessonId);
        if (!currentLesson) return;
        
        const currentAttendance = editedContent[lessonId]?.attendance || currentLesson.attendance || {};
        const newAttendance = {
            ...currentAttendance,
            [studentId]: status,
        };
        handleContentChange(lessonId, 'attendance', newAttendance);
    };
    
    const handleOpenBankImporter = (lessonId: string, field: keyof Lesson) => {
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

        const currentEditorContent = editedContent[activeLessonIdForImport]?.classNote || lesson.classNote;
        
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
            handleContentChange(activeLessonIdForImport, 'classNote', newContent);
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
        
        switch(activeModal) {
            case 'content':
                return (
                    <>
                        <Editor
                            content={editedContent[selectedLesson.id]?.content || selectedLesson.content}
                            onChange={(newContent) => handleContentChange(selectedLesson.id, 'content', newContent)}
                            editable
                            placeholder={t.placeholders.content}
                        />
                        <Button className="mt-4" onClick={() => handleOpenBankImporter(selectedLesson.id, 'content')}>
                            <Import className="mr-2 h-4 w-4" />
                            {t.importFromBank}
                        </Button>
                    </>
                );
            case 'classNote':
                return (
                     <>
                        <Editor
                            content={editedContent[selectedLesson.id]?.classNote || selectedLesson.classNote}
                            onChange={(newContent) => handleContentChange(selectedLesson.id, 'classNote', newContent)}
                            editable
                            placeholder={t.placeholders.classNote}
                        />
                         <Button className="mt-4" variant="outline" onClick={() => handleOpenFileBankImporter(selectedLesson.id)}>
                            <FileUp className="mr-2 h-4 w-4"/>
                            Importar Archivo
                        </Button>
                    </>
                );
            case 'homework':
                 return (
                    <>
                        <Editor
                            content={editedContent[selectedLesson.id]?.homework || selectedLesson.homework}
                            onChange={(newContent) => handleContentChange(selectedLesson.id, 'homework', newContent)}
                            editable
                            placeholder={t.placeholders.homework}
                        />
                         <Button className="mt-4" onClick={() => handleOpenBankImporter(selectedLesson.id, 'homework')}>
                            <Import className="mr-2 h-4 w-4" />
                            {t.importFromBank}
                        </Button>
                    </>
                );
            case 'attendance':
                 return (
                    <div className="space-y-4">
                        {groupMembers.map(student => (
                        <div key={student.id} className="flex justify-between items-center">
                            <span>{student.name}</span>
                            <RadioGroup 
                                defaultValue={(editedContent[selectedLesson.id]?.attendance || selectedLesson.attendance)?.[student.id]} 
                                className="flex gap-4"
                                onValueChange={(value) => handleAttendanceChange(selectedLesson.id, student.id, value as AttendanceStatus)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="presente" id={`${selectedLesson.id}-${student.id}-presente`} />
                                    <Label htmlFor={`${selectedLesson.id}-${student.id}-presente`}>{t.attendanceStates.presente}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ausente" id={`${selectedLesson.id}-${student.id}-ausente`} />
                                    <Label htmlFor={`${selectedLesson.id}-${student.id}-ausente`}>{t.attendanceStates.ausente}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="tarde" id={`${selectedLesson.id}-${student.id}-tarde`} />
                                    <Label htmlFor={`${selectedLesson.id}-${student.id}-tarde`}>{t.attendanceStates.tarde}</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        ))}
                    </div>
                );
             case 'comments':
                return (
                    <Editor
                        content={editedContent[selectedLesson.id]?.comments || selectedLesson.comments}
                        onChange={(newContent) => handleContentChange(selectedLesson.id, 'comments', newContent)}
                        editable
                        placeholder={t.placeholders.comments}
                    />
                );
            default:
                return null;
        }
    }


    return (
        <div className="space-y-4">
             <BankCardImporter ownerId={teacherId} isOpen={isBankImporterOpen} onOpenChange={setBankImporterOpen} onSelectCard={handleImportFromBank} />
             <FileBankImporter isOpen={isFileBankImporterOpen} onOpenChange={setFileBankImporterOpen} onSelectFile={handleImportFileFromBank} />
             {lessons.length > 0 ? (
                 lessons.map(lesson => (
                     <div key={lesson.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg mb-4">{lesson.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Video /> {t.recording}</CardTitle>
                                    <CardDescription>{t.recordingPlaceholder}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center gap-2">
                                    <Input 
                                        placeholder="https://..." 
                                        value={editedContent[lesson.id]?.recording?.link ?? lesson.recording?.link ?? ""}
                                        onChange={(e) => handleContentChange(lesson.id, 'recording', { link: e.target.value })}
                                    />
                                    <Button onClick={() => handleSaveLesson(lesson.id)} disabled={isSaving === lesson.id}>
                                        {isSaving === lesson.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card onClick={() => handleOpenModal(lesson.id, 'content')} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="font-headline text-base flex items-center gap-2"><Target/> {t.content}</CardTitle>
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
                 ))
            ) : (
                <p className="p-4 text-center text-muted-foreground">{t.noLessons}</p>
            )}

            <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">
                           Editar {activeModal === 'content' && t.content}
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


const GroupDetailsDialog = ({ group, studentsById, isOpen, onOpenChange, teacherId, teacherName }: { group: Group | null; studentsById: Map<string, StudentProfile>; isOpen: boolean; onOpenChange: (open: boolean) => void; teacherId: string; teacherName: string; }) => {
    const { translations } = useLanguage();
    const t = translations.teacherDashboard.groups;
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
                <Tabs defaultValue="lessons" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="shrink-0">
                        <TabsTrigger value="lessons"><BookOpen className="mr-2 h-4 w-4"/>Lecciones</TabsTrigger>
                        <TabsTrigger value="members"><Users className="mr-2 h-4 w-4"/>Miembros</TabsTrigger>
                        <TabsTrigger value="communication"><Send className="mr-2 h-4 w-4"/>Comunicación</TabsTrigger>
                        {isPrivateGroup && <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4"/>Calendario</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="lessons" className="flex-grow overflow-auto p-4">
                       <GroupLessons key={refreshLessonKey} group={group} studentsById={studentsById} teacherId={teacherId} onLessonCreated={() => setRefreshLessonKey(k => k + 1)} />
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
  const t_toast = translations.teacherDashboard.toasts;
  
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [groupToView, setGroupToView] = useState<Group | null>(null);
  const [isBanksModalOpen, setIsBanksModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedUser = localStorage.getItem("uncoverly-user");
      if (!storedUser) {
        router.push("/login");
        return;
      }
      
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'teacher') {
          router.push('/login');
          return;
      }
      setUser(parsedUser);
      
      setIsLoading(true);
      try {
        const teacherData = await getTeacherDataForDashboard(parsedUser.id);
        setData(teacherData);
      } catch (error) {
          console.error("Error fetching teacher data:", error);
          toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.dataError });
      } finally {
          setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [router, toast]);

  const studentsById = useMemo(() => new Map(data?.allStudents.map(s => [s.id, s])), [data?.allStudents]);
  
  const privateGroups = useMemo(() => data?.groups.filter(g => g.type === 'privado') || [], [data?.groups]);
  const smallGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo pequeño') || [], [data?.groups]);
  const largeGroups = useMemo(() => data?.groups.filter(g => g.type === 'grupo grande') || [], [data?.groups]);
  const historicalGroups = useMemo(() => data?.groupHistory || [], [data?.groupHistory]);


  if (isLoading || !data || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                      {t.banks.button} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
              </CardFooter>
          </Card>
        </main>
        
        <GroupDetailsDialog group={groupToView} studentsById={studentsById} isOpen={!!groupToView} onOpenChange={() => setGroupToView(null)} teacherId={user.id} teacherName={user.name}/>
      </div>
      <Dialog open={isBanksModalOpen} onOpenChange={setIsBanksModalOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-0 relative">
                  <DialogTitle>{t.banks.title}</DialogTitle>
                <DialogDescription>{t.banks.description}</DialogDescription>
                  <Button variant="ghost" size="icon" className="absolute top-4 right-16" asChild>
                    <Link href="/teacher/banks">
                        <Expand className="h-5 w-5" />
                        <span className="sr-only">Ver en pantalla completa</span>
                    </Link>
                </Button>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
                  <BanksDashboardUI isModal={true} />
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
