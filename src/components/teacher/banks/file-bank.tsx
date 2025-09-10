
"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, PlusCircle, Trash2, Edit, RefreshCw, Upload, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { User, BankCard } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { getBankFiles, uploadBankFile, deleteBankFile } from "@/lib/firestore";
import { Progress } from "@/components/ui/progress";

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
  const { toast } = useToast();
  
  const [files, setFiles] = useState<BankCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFiles = await getBankFiles(user.id, bankType);
      setFiles(fetchedFiles);
    } catch (err) {
      console.error(`Error fetching ${bankType} bank files:`, err);
      setError(t.errors.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, bankType]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    try {
      await uploadBankFile(user.id, bankType, file, (progress) => {
        setUploadProgress(progress);
      });
      toast({ title: t.toasts.uploadSuccessTitle });
      await fetchFiles();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: t.errors.errorTitle, description: t.errors.uploadError });
    } finally {
      setUploadProgress(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleDeleteFile = async (cardId: string, filePath: string) => {
      try {
          await deleteBankFile(cardId, filePath);
          toast({ title: t.toasts.deleteSuccessTitle });
          setFiles(prev => prev.filter(f => f.id !== cardId));
      } catch (error) {
           toast({ variant: "destructive", title: t.errors.errorTitle, description: t.errors.deleteError });
      }
  }


  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }
    
    if (error) {
       return (
        <Alert variant="destructive">
          <AlertTitle>{t.errors.errorTitle}</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button variant="link" onClick={fetchFiles} className="p-0 mt-2 h-auto text-destructive-foreground">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t.retry}
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (files.length === 0) {
      return <p className="text-center text-muted-foreground">{t.noFiles}</p>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map(file => (
            <Card key={file.id}>
              <CardHeader>
                <CardTitle className="truncate">{file.name}</CardTitle>
                 <CardDescription>
                  {t.createdAt}: {new Date(file.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                 <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </a>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteFile(file.id, file.filePath!)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
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
