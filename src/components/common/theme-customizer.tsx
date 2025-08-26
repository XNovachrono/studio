
"use client";

import { useState, useEffect } from "react";
import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

const themes = [
  { name: "Negro", value: "theme-dark-blue", color: "#3b82f6" },
  { name: "Blanco", value: "theme-light-blue", color: "#3b82f6" },
  { name: "Menta", value: "theme-mint-green", color: "#10b981" },
];

export function ThemeCustomizer() {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState("theme-dark-blue");
  
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("uncoverly-theme") || "theme-dark-blue";
    setActiveTheme(storedTheme);
    document.documentElement.className = storedTheme;
  }, []);

  const handleThemeChange = (themeValue: string) => {
    setActiveTheme(themeValue);
    localStorage.setItem("uncoverly-theme", themeValue);
    document.documentElement.className = themeValue;
  };

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Palette />
            Personaliza tu Experiencia
        </DialogTitle>
        <DialogDescription>
          Modifica la apariencia de Uncoverly. Los cambios se aplican en tiempo real.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        {/* Color Themes */}
        <div className="space-y-2">
          <h3 className="font-headline text-lg text-primary">Temas de Color</h3>
          <div className="grid grid-cols-3 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg border-2 p-3 transition-colors",
                  activeTheme === theme.value
                    ? "border-primary"
                    : "border-muted hover:border-muted-foreground"
                )}
              >
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="font-medium">{theme.name}</span>
                {activeTheme === theme.value && (
                  <Check className="absolute right-3 top-3 h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-2">
          <h3 className="font-headline text-lg text-primary">Tipografía</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Fuente de Texto</Label>
              <Select defaultValue="inter">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter (Default)</SelectItem>
                  {/* Add other fonts here */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fuente de Títulos</Label>
              <Select defaultValue="space-grotesk">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="space-grotesk">
                    Space Grotesk (Default)
                  </SelectItem>
                  {/* Add other fonts here */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="space-y-2">
          <h3 className="font-headline text-lg text-primary">
            Configuración de Idioma
          </h3>
          <div className="max-w-xs">
            <Label>Seleccionar Idioma de la Aplicación</Label>
            <Select defaultValue="es">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">Inglés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
