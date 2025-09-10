
"use client";

import { useEffect, useState } from "react";
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
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User, BankCard, EditorContent } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { createBankCard, getBankCards, updateBankCard, deleteBankCard } from "@/lib/firestore";
import { Editor } from "@/components/common/editor";

const defaultContent: EditorContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

interface ObjectiveBankProps {
  user: User;
}

export function ObjectiveBank({ user }: ObjectiveBankProps) {
  const { translations } = useLanguage();
  const t = translations.banksDashboard.objectiveBank;
  const t_toast = t.toasts;
  const { toast } = useToast();

  const [cards, setCards] = useState<BankCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Partial<BankCard> | null>(null);

  const fetchCards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCards = await getBankCards(user.id, 'objective');
      setCards(fetchedCards);
    } catch (error) {
      console.error("Error fetching bank cards:", error);
      // We set an error state, but the render logic will decide what to show
      setError(t_toast.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleOpenModal = (card: BankCard | null = null) => {
    if (card) {
      setEditingCard({ ...card });
    } else {
      setEditingCard({ name: "", content: defaultContent, type: 'objective', ownerId: user.id });
    }
    setIsModalOpen(true);
  };

  const handleSaveCard = async () => {
    if (!editingCard || !editingCard.name || !editingCard.content) {
      toast({ variant: "destructive", description: t_toast.nameRequired });
      return;
    }
    setIsSaving(true);
    try {
      if (editingCard.id) {
        await updateBankCard(editingCard.id, editingCard);
        toast({ title: t_toast.updateSuccessTitle });
      } else {
        await createBankCard(editingCard as Omit<BankCard, 'id' | 'createdAt'>);
        toast({ title: t_toast.createSuccessTitle });
      }
      await fetchCards();
      setIsModalOpen(false);
      setEditingCard(null);
    } catch (error) {
      toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.saveError });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
      try {
          await deleteBankCard(cardId);
          toast({ title: t_toast.deleteSuccessTitle });
          await fetchCards();
      } catch (error) {
           toast({ variant: "destructive", title: t_toast.errorTitle, description: t_toast.deleteError });
      }
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }
    // Only show error if loading is finished, there are no cards, and an error exists.
    // This avoids showing an error for an empty list. We will treat empty as a valid state.
    if (error && cards.length === 0 && !isLoading) {
       return (
        <Alert variant="destructive">
          <AlertTitle>{t_toast.errorTitle}</AlertTitle>
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

    if (cards.length > 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => (
            <Card key={card.id}>
              <CardHeader>
                <CardTitle className="truncate">{card.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{t.createdAt}: {new Date(card.createdAt).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => handleOpenModal(card)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteCard(card.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    // This is now the default state if not loading and no cards are present.
    return <p className="text-center text-muted-foreground">{t.noCards}</p>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
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

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingCard?.id ? t.editCard : t.newCard}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="card-name">{t.cardName}</Label>
              <Input
                id="card-name"
                value={editingCard?.name || ""}
                onChange={(e) => setEditingCard(prev => ({ ...prev!, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t.cardContent}</Label>
              <Editor
                content={editingCard?.content || defaultContent}
                onChange={(content) => setEditingCard(prev => ({...prev!, content}))}
                editable
              />
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
