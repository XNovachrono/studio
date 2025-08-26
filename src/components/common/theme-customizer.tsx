
"use client";

import { useState, useEffect } from "react";
import { Check, Palette } from "lucide-react";
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
import { useLanguage } from "@/context/language-context";

const themes = [
  { name: "Negro", name_en: "Black", value: "theme-dark-blue", color: "#3b82f6" },
  { name: "Blanco", name_en: "White", value: "theme-light-blue", color: "#3b82f6" },
  { name: "Menta", name_en: "Mint", value: "theme-mint-green", color: "#10b981" },
];

const bodyFonts = [
    { name: "Inter (Default)", value: "inter" },
    { name: "Lato", value: "lato" },
    { name: "Open Sans", value: "open-sans" },
];

const headlineFonts = [
    { name: "Space Grotesk (Default)", value: "space-grotesk" },
    { name: "Montserrat", value: "montserrat" },
    { name: "Roboto Slab", value: "roboto-slab" },
];

export function ThemeCustomizer() {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState("theme-dark-blue");
  const [bodyFont, setBodyFont] = useState("inter");
  const [headlineFont, setHeadlineFont] = useState("space-grotesk");
  const { language, setLanguage, translations } = useLanguage();
  const t = translations.themeCustomizer;

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("uncoverly-theme") || "theme-dark-blue";
    const storedBodyFont = localStorage.getItem("uncoverly-body-font") || "inter";
    const storedHeadlineFont = localStorage.getItem("uncoverly-headline-font") || "space-grotesk";
    
    setActiveTheme(storedTheme);
    setBodyFont(storedBodyFont);
    setHeadlineFont(storedHeadlineFont);
    
    document.documentElement.className = storedTheme;
    document.body.style.setProperty('--font-body', `var(--font-${storedBodyFont})`);
    document.body.style.setProperty('--font-headline', `var(--font-${storedHeadlineFont})`);

  }, []);

  const handleThemeChange = (themeValue: string) => {
    setActiveTheme(themeValue);
    localStorage.setItem("uncoverly-theme", themeValue);
    document.documentElement.className = themeValue;
  };

  const handleBodyFontChange = (fontValue: string) => {
    setBodyFont(fontValue);
    localStorage.setItem("uncoverly-body-font", fontValue);
    document.body.style.setProperty('--font-body', `var(--font-${fontValue})`);
  };
  
  const handleHeadlineFontChange = (fontValue: string) => {
    setHeadlineFont(fontValue);
    localStorage.setItem("uncoverly-headline-font", fontValue);
     document.body.style.setProperty('--font-headline', `var(--font-${fontValue})`);
  };

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Palette />
            {t.title}
        </DialogTitle>
        <DialogDescription>
          {t.description}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        {/* Color Themes */}
        <div className="space-y-2">
          <h3 className="font-headline text-lg text-primary">{t.colorThemes}</h3>
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
                <span className="font-medium">{language === 'es' ? theme.name : theme.name_en}</span>
                {activeTheme === theme.value && (
                  <Check className="absolute right-3 top-3 h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-2">
          <h3 className="font-headline text-lg text-primary">{t.typography}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{t.bodyFont}</Label>
              <Select value={bodyFont} onValueChange={handleBodyFontChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {bodyFonts.map(font => (
                    <SelectItem key={font.value} value={font.value}>{font.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t.headlineFont}</Label>
              <Select value={headlineFont} onValueChange={handleHeadlineFontChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {headlineFonts.map(font => (
                    <SelectItem key={font.value} value={font.value}>{font.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="space-y-2">
          <h3 className="font-headline text-lg text-primary">
            {t.languageSettings}
          </h3>
          <div className="max-w-xs">
            <Label>{t.selectLanguage}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'es' | 'en')}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
