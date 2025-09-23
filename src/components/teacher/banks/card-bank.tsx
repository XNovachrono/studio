
"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, PlusCircle, Trash2, Edit, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User, BankCard, EditorContent } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { createBankCard, getBankCards, updateBankCard, deleteBankCard } from "@/lib/firestore";
import { Editor } from "@/components/common/editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const defaultContent: EditorContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const ENGLISH_LEVELS = ["A1", "A1.2", "A2", "A2.2", "B1", "B1.2", "C1", "C1.2", "C2"];

interface CardBankProps {
  user: User;
  bankType: 'objective' | 'class' | 'homework';
}

const ViewCardDialog = ({ card, isOpen, onOpenChange }: { card: BankCard | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    if (!card) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{card.name}</DialogTitle>
                    <DialogDescription>
                        Autor: {card.ownerName} | Nivel: <Badge variant="outline">{card.level || "Sin Nivel"}</Badge>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-auto">
                    <Editor content={card.content} onChange={() => {}} editable={false} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function CardBank({ user, bankType }: CardBankProps) {
  const { translations } = useLanguage();
  const t = translations.banksDashboard.cardBank;
  const t_specifics = translations.banksDashboard.cardBank[bankType];
  const { toast } = useToast();

  const [cards, setCards] = useState<BankCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Partial<BankCard> | null>(null);
  const [viewingCard, setViewingCard] = useState<BankCard | null>(null);

  const fetchCards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Teachers can now see all cards, not just their own.
      const fetchedCards = await getBankCards(bankType);
      setCards(fetchedCards);
    } catch (err: any) {
      console.error(`Error fetching ${bankType} bank cards:`, err);
      setError(err.message || t.errors.loadError);
      toast({ variant: "destructive", title: t.errors.errorTitle, description: err.message || t.errors.loadError });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankType]);
  
  const groupedCards = useMemo(() => {
    const groups: Record<string, BankCard[]> = {};
    cards.forEach(card => {
        const level = card.level || "Sin Nivel";
        if (!groups[level]) {
            groups[level] = [];
        }
        groups[level].push(card);
    });
    // Sort levels: A1, A1.2, ..., Sin Nivel
    return Object.entries(groups).sort(([levelA], [levelB]) => {
        if (levelA === "Sin Nivel") return 1;
        if (levelB === "Sin Nivel") return -1;
        return levelA.localeCompare(levelB, undefined, { numeric: true });
    });
  }, [cards]);

  const handleOpenModal = (card: BankCard | null = null) => {
    if (card) {
      setEditingCard({ ...card });
    } else {
      setEditingCard({ name: "", content: defaultContent, type: bankType, ownerId: user.id, ownerName: user.name, level: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveCard = async () => {
    if (!editingCard || !editingCard.name || !editingCard.content) {
      toast({ variant: "destructive", description: t.toasts.nameRequired });
      return;
    }
    
    const cardToSave: Omit<BankCard, 'id' | 'createdAt'> = {
        name: editingCard.name,
        content: editingCard.content,
        ownerId: user.id,
        ownerName: user.name,
        type: bankType,
        level: editingCard.level || "",
    };

    setIsSaving(true);
    try {
      if (editingCard.id) {
        // Ensure only owner or admin can update
        if (editingCard.ownerId !== user.id && user.role !== 'admin') {
            throw new Error("You don't have permission to edit this card.");
        }
        await updateBankCard(editingCard.id, cardToSave);
        toast({ title: t.toasts.updateSuccessTitle });
      } else {
        await createBankCard(cardToSave);
        toast({ title: t.toasts.createSuccessTitle });
      }
      await fetchCards();
      setIsModalOpen(false);
      setEditingCard(null);
    } catch (error: any) {
      console.error("Error saving card:", error);
      toast({ variant: "destructive", title: t.errors.errorTitle, description: error.message || t.errors.saveError });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (card: BankCard) => {
      try {
          if (card.ownerId !== user.id && user.role !== 'admin') {
             throw new Error("You don't have permission to delete this card.");
          }
          await deleteBankCard(card.id);
          toast({ title: t.toasts.deleteSuccessTitle });
          setCards(prev => prev.filter(c => c.id !== card.id));
      } catch (error: any) {
           toast({ variant: "destructive", title: t.errors.errorTitle, description: error.message || t.errors.deleteError });
      }
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    if (error) {
       return (
        <Alert variant="destructive">
          <AlertTitle>{t.errors.errorTitle}</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button variant="link" onClick={fetchCards} className="p-0 mt-2 h-auto text-destructive-foreground">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (cards.length === 0) {
      return <p className="text-center text-muted-foreground">{t.noCards}</p>;
    }

    return (
        <Accordion type="multiple" className="w-full space-y-2">
            {groupedCards.map(([level, levelCards]) => (
                <AccordionItem value={level} key={level}>
                    <AccordionTrigger className="text-lg font-semibold font-headline px-4 py-2 rounded-md bg-secondary/50 hover:no-underline">
                        Nivel: {level}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {levelCards.map(card => {
                                const canEdit = user.role === 'admin' || user.id === card.ownerId;
                                return (
                                    <Card key={card.id} className="flex flex-col">
                                        <div className="flex-grow cursor-pointer" onClick={() => setViewingCard(card)}>
                                            <CardHeader>
                                                <CardTitle className="truncate">{card.name}</CardTitle>
                                                <CardDescription>{t.author}: {card.ownerName || 'N/A'}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="text-sm text-muted-foreground">
                                                <p>{t.createdAt}: {new Date(card.createdAt).toLocaleDateString()}</p>
                                            </CardContent>
                                        </div>
                                        <CardFooter className="flex justify-end gap-2">
                                            {canEdit && (
                                                <>
                                                    <Button variant="outline" size="icon" onClick={() => handleOpenModal(card)}>
                                                    <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteCard(card)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t_specifics?.title}</CardTitle>
            <CardDescription>{t_specifics?.description}</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t.newCard}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>

      {/* View Modal */}
      <ViewCardDialog card={viewingCard} isOpen={!!viewingCard} onOpenChange={() => setViewingCard(null)} />

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingCard?.id ? t.editCard : t.newCard}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card-name">{t.cardName}</Label>
                  <Input
                    id="card-name"
                    value={editingCard?.name || ""}
                    onChange={(e) => setEditingCard(prev => ({ ...prev!, name: e.target.value }))}
                  />
                </div>
                 <div>
                    <Label htmlFor="card-level">Nivel de Inglés</Label>
                    <Select value={editingCard?.level || ""} onValueChange={(level) => setEditingCard(prev => ({...prev!, level}))}>
                        <SelectTrigger id="card-level">
                            <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                            {ENGLISH_LEVELS.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            <div>
              <Label>{t.cardContent}</Label>
                <ScrollArea className="max-h-[50vh] w-full pr-4">
                    <Editor
                        content={editingCard?.content || defaultContent}
                        onChange={(content) => setEditingCard(prev => ({...prev!, content}))}
                        editable
                    />
                </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t.cancel}</Button></DialogClose>
            <Button onClick={handleSaveCard} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
