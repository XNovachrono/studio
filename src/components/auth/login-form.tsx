
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
import { useLanguage } from "@/context/language-context";
import { MOCK_USERS } from "@/lib/mock-data";

const loginSchema = z.object({
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { translations } = useLanguage();
  const t = translations.loginForm;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "123456789",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    // SIMULATED AUTH FOR PRESENTATION
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email?.toLowerCase() === data.email.toLowerCase());
      
      if (user && data.password === "123456789") {
        localStorage.setItem("uncoverly-user", JSON.stringify(user));
        toast({ title: t.successTitle, description: t.successDescription.replace('{name}', user.name) });
        
        switch (user.role) {
          case 'admin': router.push("/admin/dashboard"); break;
          case 'teacher': router.push("/teacher/dashboard"); break;
          case 'student': router.push("/student/dashboard"); break;
          default: router.push("/login");
        }
      } else {
        toast({ variant: "destructive", title: t.errorTitle, description: t.errorInvalidCredentials });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-center text-2xl">{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-md text-xs space-y-1">
            <p><strong>Credenciales de Presentación (Pass: 123456789):</strong></p>
            <p>• Admin@gmail.com</p>
            <p>• docente@gmail.com</p>
            <p>• estudiante@gmail.com</p>
        </div>
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
