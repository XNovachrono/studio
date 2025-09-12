
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { StudentProfile, TeacherInteraction } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { submitPQRS } from "@/lib/firestore";

interface PqrsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentProfile;
  teacher: TeacherInteraction;
}

export function PqrsDialog({ isOpen, onOpenChange, student, teacher }: PqrsDialogProps) {
  const { translations } = useLanguage();
  const t = translations.studentDashboard.pqrsDialog;
  const t_toast = translations.studentDashboard.toasts;
  const { toast } = useToast();

  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({ variant: "destructive", description: t_toast.emptyMessage });
      return;
    }
    setIsSending(true);
    try {
      await submitPQRS({
        studentId: student.id,
        studentEmail: student.email || "No proporcionado",
        teacherId: teacher.teacherId,
        message,
        isAnonymous,
      });
      toast({ title: t_toast.pqrsSentTitle, description: t_toast.pqrsSentDescription });
      setMessage("");
      setIsAnonymous(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting PQRS:", error);
      toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.errorDescription });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title.replace('{teacherName}', teacher.teacherName)}</DialogTitle>
          <DialogDescription>
            {t.lastInteraction.replace('{time}', new Date(teacher.lastInteraction).toLocaleDateString())}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pqrs-message">{t.messageLabel}</Label>
            <Textarea
              id="pqrs-message"
              placeholder={t.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <label
              htmlFor="anonymous"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.anonymousLabel}
            </label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">{t.cancelButton}</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.submitButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    