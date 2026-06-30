"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Edit, Loader2, PlusCircle, RefreshCw, Trash2, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { deleteBankFile, getBankFiles, uploadBankFile } from "@/lib/firestore";
import type { BankCard, User } from "@/lib/types";

interface FileBankProps {
  user: User;
  bankType: 'image' | 'video' | 'audio';
}

const fileTypeConfig = {
    image: { accept: "image/*" },
    video: { accept: "video/*" },
    audio: { accept: "audio/*" },
};

export function FileBank({ user, bankType }: FileBankProps) {
  const { translations } = useLanguage();
  const t_specifics = translations.banksDashboard.fileBank[bankType];
  const t = translations.banksDashboard.fileBank.common;
  const t_card = translations.banksDashboard.cardBank;
  const { toast } = useToast();
  
  const [files, setFiles] = useState<BankCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const fetchedFiles = await getBankFiles(bankType);
      
      // Populate with visual placeholders if empty
      if (fetchedFiles.length === 0) {
          const placeholderUrl = bankType === 'image' 
            ? "https://picsum.photos/seed/uncoverly/400/300"
            : bankType === 'video'
            ? "https://www.w3schools.com/html/mov_bbb.mp4"
            : "https://www.w3schools.com/html/horse.mp3";

          setFiles([
              {
                  id: "demo-f-1",
                  name: `Ejemplo_${bankType}_1.ext`,
                  ownerName: "Sistema",
                  ownerId: "system",
                  createdAt: new Date().toISOString(),
                  type: bankType,
                  fileUrl: placeholderUrl,
                  filePath: "demo/path"
              },
              {
                  id: "demo-f-2",
                  name: `Ejemplo_${bankType}_2.ext`,
                  ownerName: "Sistema",
                  ownerId: "system",
                  createdAt: new Date().toISOString(),
                  type: bankType,
                  fileUrl: placeholderUrl,
                  filePath: "demo/path"
              }
          ]);
      } else {
          setFiles(fetchedFiles);
      }
    } catch (err: any) {
      console.error(`Error fetching ${bankType} bank files:`, err);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFiles();
  }, [bankType]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    try {
      await uploadBankFile(user.id, user.name, bankType, file, (progress) => {
        setUploadProgress(progress);
      });
      toast({ title: t.toasts.uploadSuccessTitle });
      await fetchFiles();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudo subir. Intenta de nuevo." });
    } finally {
      setUploadProgress(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleDeleteFile = async (file: BankCard) => {
      if(file.id.startsWith('demo-')) {
          setFiles(prev => prev.filter(f => f.id !== file.id));
          return;
      }
      try {
          await deleteBankFile(file.id, file.filePath!);
          toast({ title: t.toasts.deleteSuccessTitle });
          setFiles(prev => prev.filter(f => f.id !== file.id));
      } catch (error: any) {
           toast({ variant: "destructive", title: "Error", description: "No tienes permisos." });
      }
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map(file => {
            const canDelete = user.role === 'admin' || user.id === file.ownerId || file.id.startsWith('demo-');
            return (
                <Card key={file.id}>
                <CardHeader>
                    <CardTitle className="truncate">{file.name}</CardTitle>
                    <CardDescription>{t_card.author}: {file.ownerName || 'N/A'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t.createdAt}: {new Date(file.createdAt).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                        </Button>
                    </a>
                    {canDelete && (
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteFile(file)}>
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
                </Card>
            )
          })}
        </div>
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
          <Button onClick={handleFileSelect} disabled={uploadProgress !== null}>
             {uploadProgress !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {t.uploadButton}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept={fileTypeConfig[bankType].accept}
            className="hidden" 
          />
        </div>
      </CardHeader>
      <CardContent>
        {uploadProgress !== null && (
          <div className="mb-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center mt-2 text-muted-foreground">{t.uploading.replace('{progress}', uploadProgress.toFixed(0))}</p>
          </div>
        )}
        {renderContent()}
      </CardContent>
    </Card>
  );
}