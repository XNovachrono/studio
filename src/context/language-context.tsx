
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from '@/lib/translations';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: typeof translations.es; 
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const storedLang = localStorage.getItem('uncoverly-language') as Language;
    if (storedLang && (storedLang === 'es' || storedLang === 'en')) {
      setLanguageState(storedLang);
      document.documentElement.lang = storedLang;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('uncoverly-language', lang);
    document.documentElement.lang = lang;
  };

  const value = {
    language,
    setLanguage,
    translations: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
