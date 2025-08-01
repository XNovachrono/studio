
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { User, StudentProfile } from "@/lib/types";
import { INTEREST_CATEGORIES, LEARNING_OBJECTIVES } from "@/lib/data";
import { updateUserProfile } from "@/lib/firestore";

const steps = ["welcome", "email", "age", "interests", "availability", "objective", "finish"];

type OnboardingFormData = Omit<StudentProfile, 'id' | 'username' | 'name' | 'role' | 'plan' | 'hasOnboarded'>;

export function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    email: "",
    age: 30,
    interests: [] as string[],
    availability: "",
    objective: "",
    objective_details: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("uncoverly-user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(prev => ({...prev, email: parsedUser.email || ''}));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleNext = () => {
    if (currentStep === 3 && formData.interests.length === 0) {
      toast({ variant: "destructive", description: "Por favor, selecciona al menos un interés." });
      return;
    }
     if (currentStep === 3 && formData.interests.length > 3) {
      toast({ variant: "destructive", description: "Puedes seleccionar hasta 3 intereses." });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleInterestChange = (interest: string, checked: boolean | "indeterminate") => {
    setFormData((prev) => {
      const newInterests = checked
        ? [...prev.interests, interest]
        : prev.interests.filter((i) => i !== interest);
      if (newInterests.length > 3) {
        toast({ variant: "destructive", description: "Solo puedes seleccionar un máximo de 3 intereses." });
        return { ...prev, interests: prev.interests };
      }
      return { ...prev, interests: newInterests };
    });
  };

  const handleFinish = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const profileData: StudentProfile = {
        ...user,
        ...formData,
        hasOnboarded: true,
      };

      await updateUserProfile(user.id, profileData);
      
      localStorage.setItem("uncoverly-user", JSON.stringify(profileData));
      toast({
        title: "¡Perfil completado!",
        description: "Tu configuración ha sido guardada.",
      });
      router.push("/student/dashboard");

    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar tu perfil. Inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (steps[currentStep]) {
      case "welcome":
        return (
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Bienvenido/a a Uncoverly</CardTitle>
            <CardDescription className="pt-4 text-base">
              Tienes el <span className="font-bold text-primary">{user?.plan}</span>.
              <br/>
              Vamos a configurar tu perfil para personalizar tu aprendizaje.
            </CardDescription>
          </CardHeader>
        );
      case "email":
        return (
          <>
            <CardHeader><CardTitle className="font-headline">Tu correo electrónico</CardTitle></CardHeader>
            <CardContent>
              <Input type="email" placeholder="email@ejemplo.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </CardContent>
          </>
        );
      case "age":
        return (
          <>
            <CardHeader><CardTitle className="font-headline">¿Cuál es tu edad?</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center text-2xl font-bold text-primary">{formData.age}</div>
                <Slider defaultValue={[30]} min={1} max={100} step={1} value={[formData.age || 30]} onValueChange={(val) => setFormData({...formData, age: val[0]})} />
            </CardContent>
          </>
        );
      case "interests":
        return (
            <>
              <CardHeader>
                  <CardTitle className="font-headline">Tus intereses</CardTitle>
                  <CardDescription>Selecciona de 1 a 3 categorías.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                      {INTEREST_CATEGORIES.map(interest => (
                          <div key={interest} className="flex items-center space-x-2">
                              <Checkbox id={interest} checked={formData.interests?.includes(interest)} onCheckedChange={(c) => handleInterestChange(interest, c)} />
                              <label htmlFor={interest} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{interest}</label>
                          </div>
                      ))}
                  </div>
              </CardContent>
            </>
        );
      case "availability":
        return (
            <>
                <CardHeader><CardTitle className="font-headline">Disponibilidad horaria</CardTitle><CardDescription>Ej: Lunes a Viernes, 18:00 - 21:00</CardDescription></CardHeader>
                <CardContent><Input placeholder="Tu disponibilidad" value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} /></CardContent>
            </>
        );
      case "objective":
        return (
            <>
                <CardHeader><CardTitle className="font-headline">Tu objetivo al aprender inglés</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={formData.objective} onValueChange={val => setFormData({...formData, objective: val})}>
                      {LEARNING_OBJECTIVES.map(obj => (
                          <div key={obj} className="flex items-center space-x-2">
                              <RadioGroupItem value={obj} id={obj} />
                              <Label htmlFor={obj}>{obj}</Label>
                          </div>
                      ))}
                  </RadioGroup>
                  {formData.objective === 'Otro' && (
                      <Textarea placeholder="Describe tu objetivo" value={formData.objective_details} onChange={e => setFormData({...formData, objective_details: e.target.value})} />
                  )}
                </CardContent>
            </>
        );
      case "finish":
        return (
            <CardHeader className="items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-8 w-8 text-green-500"/>
                </div>
                <CardTitle className="font-headline text-3xl">¡Todo listo!</CardTitle>
                <CardDescription>Estás a un paso de comenzar tu aventura con Uncoverly.</CardDescription>
            </CardHeader>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <Card className="w-full max-w-2xl border-0 shadow-none bg-transparent md:border md:shadow-lg md:bg-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
      <CardFooter className="flex justify-between">
        {currentStep > 0 ? (
          <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
        ) : <div/>}
        {steps[currentStep] !== "finish" ? (
          <Button onClick={handleNext}>Continuar</Button>
        ) : (
          <Button onClick={handleFinish} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finalizar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
