
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectiveBank } from "./objective-bank";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotImplemented = ({ title }: { title: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Esta sección estará disponible próximamente.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">Próximamente...</p>
        </CardContent>
    </Card>
)


export function BanksDashboardUI() {
  const router = useRouter();
  const { translations } = useLanguage();
  const t = translations.banksDashboard;
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("uncoverly-user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'teacher' && parsedUser.role !== 'admin') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user} title={t.title} />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Tabs defaultValue="objectives">
          <TabsList>
            <TabsTrigger value="objectives">{t.tabs.objectives}</TabsTrigger>
            <TabsTrigger value="classes">{t.tabs.classes}</TabsTrigger>
            <TabsTrigger value="homework">{t.tabs.homework}</TabsTrigger>
            <TabsTrigger value="images">{t.tabs.images}</TabsTrigger>
            <TabsTrigger value="videos">{t.tabs.videos}</TabsTrigger>
            <TabsTrigger value="audios">{t.tabs.audios}</TabsTrigger>
          </TabsList>
          <TabsContent value="objectives" className="mt-4">
            <ObjectiveBank user={user} />
          </TabsContent>
           <TabsContent value="classes" className="mt-4">
            <NotImplemented title={t.tabs.classes} />
          </TabsContent>
           <TabsContent value="homework" className="mt-4">
            <NotImplemented title={t.tabs.homework} />
          </TabsContent>
           <TabsContent value="images" className="mt-4">
            <NotImplemented title={t.tabs.images} />
          </TabsContent>
           <TabsContent value="videos" className="mt-4">
            <NotImplemented title={t.tabs.videos} />
          </TabsContent>
           <TabsContent value="audios" className="mt-4">
            <NotImplemented title={t.tabs.audios} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
