
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";

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
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/context/language-context";
import { getUserProfile } from "@/lib/firestore";

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

  const t = translations.loginForm;
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

      // Fetch the full user profile immediately after login
      const userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        throw new Error(t.errorUserNotFound);
      }

      // Store the complete profile in localStorage
      localStorage.setItem("uncoverly-user", JSON.stringify(userProfile));
      
      toast({
        title: t.successTitle,
        description: t.successDescription.replace('{name}', userProfile.name || 'a Uncoverly'),
      });

      // Redirect based on the user's role
      switch (userProfile.role) {
        case 'admin':
          router.push("/admin/dashboard");
          break;
        case 'teacher':
          router.push("/teacher/dashboard");
          break;
        case 'student':
          router.push("/student/dashboard");
          break;
        default:
          router.push("/login");
          break;
      }
      
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      let description = t.errorUnexpected;
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = t.errorInvalidCredentials;
          break;
        case 'auth/invalid-email':
          description = t.errorInvalidEmail;
          break;
        case 'auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.signinwithpassword-are-blocked.':
          description = "El inicio de sesión con contraseña no está habilitado para este proyecto. Por favor, habilítalo en la Consola de Firebase > Authentication > Sign-in method.";
          break;
        default:
          description = error.message || description;
      }
      toast({
        variant: "destructive",
        title: t.errorTitle,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-center text-2xl">{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.emailLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.emailPlaceholder} {...field} />
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
                  <FormLabel>{t.passwordLabel}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t.passwordPlaceholder}
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
              {t.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
