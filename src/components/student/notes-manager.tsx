

"use client";

import { useEffect, useState, useMemo } from 'react';
import { Loader2, Plus, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import type { StudentProfile, Lesson, StudentNote, EditorContent } from '@/lib/types';
import { createStudentNote, getStudentNotes, updateStudentNote, deleteStudentNote } from '@/lib/firestore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Editor } from '../common/editor';

interface StudentNotesManagerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    student: StudentProfile;
    lessons: Lesson[];
}

const defaultContent: EditorContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function StudentNotesManager({ isOpen, onOpenChange, student, lessons }: StudentNotesManagerProps) {
    const { translations } = useLanguage();
    const t = translations.studentDashboard.notes;
    const { toast } = useToast();

    const [notes, setNotes] = useState<StudentNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // State for create/edit dialog
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Partial<StudentNote> | null>(null);

    // State for filtering
    const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
    const [filterLesson, setFilterLesson] = useState<string>('all');

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const fetchedNotes = await getStudentNotes(student.id);
            setNotes(fetchedNotes);
        } catch (error) {
            console.error("Error fetching student notes:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch notes.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotes();
        }
    }, [isOpen, student.id]);

    const handleOpenNoteDialog = (note: StudentNote | null = null) => {
        if (note) {
            setEditingNote({ ...note });
        } else {
            setEditingNote({
                studentId: student.id,
                title: '',
                content: defaultContent,
            });
        }
        setIsNoteDialogOpen(true);
    };

    const handleSaveNote = async () => {
        if (!editingNote || !editingNote.title?.trim()) {
            toast({ variant: 'destructive', title: t.toasts.titleRequired });
            return;
        }
        
        setIsSaving(true);
        try {
            if (editingNote.id) {
                // Update existing note
                await updateStudentNote(editingNote.id, editingNote);
                toast({ title: t.toasts.updateSuccess });
            } else {
                // Create new note
                await createStudentNote(editingNote as any);
                toast({ title: t.toasts.createSuccess });
            }
            setIsNoteDialogOpen(false);
            setEditingNote(null);
            fetchNotes();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save note.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteStudentNote(noteId);
            toast({ title: t.toasts.deleteSuccess });
            fetchNotes();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete note.' });
        }
    };

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const dateMatch = filterDate ? format(parseISO(note.updatedAt), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd') : true;
            const lessonMatch = filterLesson !== 'all' ? note.lessonId === filterLesson : true;
            return dateMatch && lessonMatch;
        });
    }, [notes, filterDate, filterLesson]);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{t.manager.title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex-grow flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filterDate ? format(filterDate, "PPP", { locale: es }) : <span>{t.manager.filterByDate}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filterDate} onSelect={setFilterDate} /></PopoverContent>
                                </Popover>
                                <Select value={filterLesson} onValueChange={setFilterLesson}>
                                    <SelectTrigger className="w-[240px]">
                                        <SelectValue placeholder={t.manager.filterByLesson} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t.manager.allLessons}</SelectItem>
                                        {lessons.map(lesson => (
                                            <SelectItem key={lesson.id} value={lesson.id}>{lesson.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => handleOpenNoteDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t.manager.createButton}
                            </Button>
                        </div>
                        <div className="flex-grow overflow-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : filteredNotes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredNotes.map(note => (
                                        <Card key={note.id} className="flex flex-col justify-between">
                                            <CardHeader>
                                                <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                                                <CardDescription>
                                                    {format(parseISO(note.updatedAt), "PP", { locale: es })}
                                                    {note.lessonId && <span className="block mt-1">Lección: {lessons.find(l => l.id === note.lessonId)?.name || 'N/A'}</span>}
                                                </CardDescription>
                                            </CardHeader>
                                            <div className="p-4 pt-0 flex justify-end gap-2">
                                                 <Button variant="outline" size="sm" onClick={() => handleOpenNoteDialog(note)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    {t.manager.editButton}
                                                </Button>
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />{t.manager.deleteButton}</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t.deleteDialog.title}</AlertDialogTitle>
                                                            <AlertDialogDescription>{t.deleteDialog.description}</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t.deleteDialog.cancel}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>{t.deleteDialog.confirm}</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground pt-10">{t.manager.noNotes}</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Note Create/Edit Dialog */}
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingNote?.id ? t.dialog.editTitle : t.dialog.createTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4 flex-grow overflow-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="note-title">{t.dialog.titleLabel}</Label>
                                <Input
                                    id="note-title"
                                    value={editingNote?.title || ''}
                                    onChange={e => setEditingNote(prev => ({...prev!, title: e.target.value}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="note-lesson">{t.dialog.lessonLabel}</Label>
                                <Select
                                    value={editingNote?.lessonId || ''}
                                    onValueChange={val => setEditingNote(prev => ({...prev!, lessonId: val === 'no-lesson' ? '' : val}))}
                                >
                                    <SelectTrigger id="note-lesson">
                                        <SelectValue placeholder={t.dialog.lessonPlaceholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-lesson">Sin vincular</SelectItem>
                                        {lessons.length > 0 ? lessons.map(lesson => (
                                            <SelectItem key={lesson.id} value={lesson.id}>{lesson.name}</SelectItem>
                                        )) : <p className="p-2 text-sm text-muted-foreground">{t.dialog.noLessons}</p>}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Editor
                                content={editingNote?.content || defaultContent}
                                onChange={content => setEditingNote(prev => ({ ...prev!, content }))}
                                editable
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">{t.dialog.cancelButton}</Button></DialogClose>
                        <Button onClick={handleSaveNote} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.dialog.saveButton}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
