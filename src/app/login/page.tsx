
"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/common/logo";
import { useLanguage } from "@/context/language-context";

export default function LoginPage() {
  const { language } = useLanguage(); // This triggers the context
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col items-center space-y-8">
        <Logo />
        <LoginForm />
      </div>
    </main>
  );
}
