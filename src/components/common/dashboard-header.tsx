
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Palette, User as UserIcon } from "lucide-react";
import { Logo } from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ThemeCustomizer } from "./theme-customizer";
import { useLanguage } from "@/context/language-context";

interface DashboardHeaderProps {
  user: User | null;
  title: string;
}

export function DashboardHeader({ user, title }: DashboardHeaderProps) {
  const router = useRouter();
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const { translations } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("uncoverly-user");
    router.push("/login");
  };

  return (
    <Dialog open={isThemeCustomizerOpen} onOpenChange={setIsThemeCustomizerOpen}>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
              <Logo />
          </div>
          <h1 className="text-xl font-semibold text-foreground md:hidden">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-muted-foreground md:block">{title}</p>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer bg-secondary">
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {user.plan && (
                       <p className="text-xs font-medium capitalize leading-none text-primary pt-1">
                        {user.plan}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer">
                    <Palette className="mr-2 h-4 w-4" />
                    <span>{translations.dashboardHeader.themes}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{translations.dashboardHeader.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <ThemeCustomizer />
    </Dialog>
  );
}
