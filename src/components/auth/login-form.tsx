
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

const loginSchemaEs = z.object({
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

const loginSchemaEn = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});


export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { language, translations } = useLanguage();

  const loginSchema = language === 'es' ? loginSchemaEs : loginSchemaEn;
  type LoginFormValues = z.infer<typeof loginSchema>;


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfile = userDocSnap.data() as User;
        
        localStorage.setItem("uncoverly-user", JSON.stringify({ ...userProfile, id: firebaseUser.uid }));
        
        toast({
          title: translations.loginForm.successTitle,
          description: translations.loginForm.successDescription.replace('{name}', userProfile.name),
        });

        if (userProfile.role === "teacher") {
          router.push("/teacher/dashboard");
        } else {
          if (userProfile.hasOnboarded) {
            router.push("/student/dashboard");
          } else {
            router.push("/student/onboarding");
          }
        }
      } else {
         throw new Error(translations.loginForm.errorUserNotFound);
      }

    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      let description = translations.loginForm.errorUnexpected;
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = translations.loginForm.errorInvalidCredentials;
          break;
        case 'auth/invalid-email':
          description = translations.loginForm.errorInvalidEmail;
          break;
        default:
          description = error.message;
      }
      toast({
        variant: "destructive",
        title: translations.loginForm.errorTitle,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-center text-2xl">{translations.loginForm.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.loginForm.emailLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={translations.loginForm.emailPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.loginForm.passwordLabel}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={translations.loginForm.passwordPlaceholder}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {translations.loginForm.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
