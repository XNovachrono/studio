"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Maximize, Notebook, Paperclip } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/common/dashboard-header";
import type { User, GroupContent } from "@/lib/types";

interface StudentDashboardUIProps {
  user: User | null;
  content: GroupContent;
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

export function StudentDashboardUI({ user: initialUser, content }: StudentDashboardUIProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    if (!initialUser) {
      const storedUser = localStorage.getItem("uncoverly-user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'student' || !parsedUser.hasOnboarded) {
            router.push('/login');
            return;
        }
        setUser(parsedUser);
      } else {
        router.push("/login");
      }
    }
  }, [initialUser, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });
  };

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user} title="Panel de Estudiante" />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Clases Programadas */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl">Clases Programadas</CardTitle>
                </div>
                 <FullScreenCard
                  trigger={<Button variant="ghost" size="icon"><Maximize className="h-4 w-4" /></Button>}
                  title="Clases Programadas"
                >
                  {content.scheduledClasses.length > 0 ? (
                    <ul className="space-y-4 p-4">
                      {content.scheduledClasses.map(c => (
                        <li key={c.id} className="rounded-lg border p-4">
                          <p className="font-semibold">{formatDate(c.time)}</p>
                          <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">Unirse a la clase</a>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="p-4 text-center text-muted-foreground">No hay clases programadas.</p>}
                </FullScreenCard>
              </CardHeader>
              <CardContent>
                {content.scheduledClasses.length > 0 ? (
                  <ul className="space-y-2">
                    {content.scheduledClasses.slice(0, 3).map(c => (
                      <li key={c.id}>
                        <a href={c.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg p-3 hover:bg-secondary">
                          <p className="font-semibold">{formatDate(c.time)}</p>
                          <p className="text-sm text-accent hover:underline">Link de la clase</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-center text-muted-foreground">No hay clases programadas.</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notas */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center gap-2">
                  <Notebook className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl">Notas</CardTitle>
                 </div>
                 <FullScreenCard
                    trigger={<Button variant="ghost" size="icon"><Maximize className="h-4 w-4" /></Button>}
                    title="Notas de Clase"
                  >
                     {content.notes.length > 0 ? (
                        <ul className="space-y-2 p-4">
                          {content.notes.map(n => (
                            <li key={n.id}>
                               <a href={n.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg border p-4 hover:bg-secondary">
                                  <p className="font-semibold">{n.title}</p>
                                  <p className="text-sm text-accent hover:underline">Ver en Notion</p>
                               </a>
                            </li>
                          ))}
                        </ul>
                     ) : <p className="p-4 text-center text-muted-foreground">No hay notas disponibles.</p>}
                 </FullScreenCard>
              </CardHeader>
              <CardContent>
                {content.notes.length > 0 ? (
                  <ul className="space-y-2">
                    {content.notes.slice(0, 3).map(n => (
                      <li key={n.id}>
                        <a href={n.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg p-3 hover:bg-secondary">
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-sm text-accent hover:underline">Ver en Notion</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-center text-muted-foreground">No hay notas disponibles.</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Libros */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl">Libros</CardTitle>
                 </div>
                 <FullScreenCard
                    trigger={<Button variant="ghost" size="icon"><Maximize className="h-4 w-4" /></Button>}
                    title="Material de Lectura"
                  >
                    <div className="p-4">
                      {content.books.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {content.books.map(book => (
                            <AccordionItem value={book.id} key={book.id}>
                              <AccordionTrigger className="font-semibold">{book.title}</AccordionTrigger>
                              <AccordionContent>
                                {book.chapters.length > 0 ? (
                                  <ul className="space-y-2 pt-2">
                                    {book.chapters.map(ch => (
                                      <li key={ch.id}>
                                        <a href={ch.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg p-2 hover:bg-secondary">
                                          <Paperclip className="h-4 w-4" /> <span>{ch.name}</span>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-sm text-muted-foreground">No hay capítulos.</p>}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : <p className="text-center text-muted-foreground">No hay libros asignados.</p>}
                    </div>
                  </FullScreenCard>
              </CardHeader>
              <CardContent>
                {content.books.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {content.books.map(book => (
                      <AccordionItem value={book.id} key={book.id}>
                        <AccordionTrigger>{book.title}</AccordionTrigger>
                        <AccordionContent>
                           {book.chapters.length > 0 ? (
                            <ul className="space-y-1">
                              {book.chapters.map(ch => (
                                <li key={ch.id}>
                                  <a href={ch.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-secondary">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" /> {ch.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                           ) : <p className="px-2 py-1 text-sm text-muted-foreground">No hay capítulos.</p>}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : <p className="text-center text-muted-foreground">No hay libros asignados.</p>}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
