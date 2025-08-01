
"use client";

import { useState } from 'react';
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// IMPORTANT: Hardcoded credentials for seeding purposes.
// Advise user to change these in Firebase Console after seeding.
const TEACHER_EMAIL = "teacher@uncoverly.com";
const TEACHER_PASS = "teacher123";
const STUDENT_EMAIL = "student@uncoverly.com";
const STUDENT_PASS = "student123";

export default function SeedPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSeedDatabase = async () => {
        setIsLoading(true);
        toast({ title: "Inicializando la base de datos...", description: "Esto puede tardar un momento." });

        try {
            // Step 1: Create users in Firebase Auth
            const teacherCred = await createUserWithEmailAndPassword(auth, TEACHER_EMAIL, TEACHER_PASS);
            const studentCred = await createUserWithEmailAndPassword(auth, STUDENT_EMAIL, STUDENT_PASS);

            const teacherUid = teacherCred.user.uid;
            const studentUid = studentCred.user.uid;

            // Step 2: Create a batch write to Firestore
            const batch = writeBatch(db);

            // Create teacher document
            const teacherRef = doc(db, "users", teacherUid);
            batch.set(teacherRef, {
                name: "Profesor Davis",
                email: TEACHER_EMAIL,
                role: "teacher"
            });

            // Create student document
            const studentRef = doc(db, "users", studentUid);
            batch.set(studentRef, {
                name: "Ana García",
                email: STUDENT_EMAIL,
                role: "student",
                plan: "privado",
                hasOnboarded: false
            });

            // Commit the batch
            await batch.commit();

            toast({
                title: "¡Base de datos inicializada!",
                description: "Se crearon el profesor y el estudiante de prueba.",
                duration: 9000
            });

        } catch (error: any) {
            console.error("Error seeding database:", error);
            // Provide more specific error messages
            let errorMessage = "Ocurrió un error desconocido.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "El correo electrónico ya existe. Es posible que la base de datos ya haya sido inicializada. Intenta iniciar sesión.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "La contraseña es demasiado débil.";
            }
            toast({
                variant: "destructive",
                title: "Error al inicializar",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Inicializar Base de Datos</CardTitle>
                    <CardDescription>
                        Haz clic en el botón para poblar tu base de datos de Firestore con los datos de ejemplo necesarios para empezar a usar la aplicación.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Se crearán los siguientes usuarios:</p>
                    <ul className="text-sm list-disc pl-5 space-y-2">
                        <li>
                            <strong>Profesor:</strong><br/>
                            <span className="font-mono text-xs">Email: {TEACHER_EMAIL}</span><br/>
                            <span className="font-mono text-xs">Pass: {TEACHER_PASS}</span>
                        </li>
                        <li>
                            <strong>Estudiante:</strong><br/>
                             <span className="font-mono text-xs">Email: {STUDENT_EMAIL}</span><br/>
                             <span className="font-mono text-xs">Pass: {STUDENT_PASS}</span>
                        </li>
                    </ul>
                    <p className="text-xs text-destructive">Después de inicializar, se recomienda cambiar estas contraseñas en la Consola de Firebase.</p>
                    <Button onClick={handleSeedDatabase} disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Inicializar Base de Datos
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
