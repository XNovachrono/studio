
"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/language-context";
import { useEffect } from "react";

// export const metadata: Metadata = {
//   title: "Uncoverly",
//   description: "Plataforma para la academia Uncoverly.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const storedTheme = localStorage.getItem("uncoverly-theme") || "theme-dark-blue";
    document.documentElement.className = storedTheme;
    if (storedTheme === 'theme-dark-blue') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    // The className will be managed by the ThemeCustomizer component
    <html lang="es"> 
      <head>
        <title>Uncoverly</title>
        <meta name="description" content="Plataforma para la academia Uncoverly." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;700&family=Montserrat:wght@500;700&family=Roboto+Slab:wght@500;700&family=Poppins:wght@400;500;700&family=Merriweather:wght@400;700&family=Oswald:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}

    