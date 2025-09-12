
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Palette, User as UserIcon, Settings, Library, Home } from "lucide-react";
import Link from 'next/link';
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
import { Dialog } from "@/components/ui/dialog";
import { ThemeCustomizer } from "./theme-customizer";
import { StudentDataSettings } from "@/components/student/student-data-settings";
import { TeacherDataSettings } from "@/components/teacher/teacher-data-settings";
import { useLanguage } from "@/context/language-context";
import { Button } from "../ui/button";

interface DashboardHeaderProps {
  user: User | null;
  title: string;
}

export function DashboardHeader({ user, title }: DashboardHeaderProps) {
  const router = useRouter();
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [isDataSettingsOpen, setIsDataSettingsOpen] = useState(false);
  const { translations } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("uncoverly-user");
    router.push("/login");
  };
  
  const getDashboardUrl = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/login';
    }
  }


  return (
    <Dialog open={isThemeCustomizerOpen} onOpenChange={setIsThemeCustomizerOpen}>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
              <Logo />
          </div>
          <h1 className="text-xl font-semibold text-foreground md:hidden">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
           <Link href={getDashboardUrl()} passHref>
              <Button variant="ghost" className="text-sm font-medium">
                  <Home className="mr-2 h-4 w-4"/>
                  {translations.dashboardHeader.dashboard}
              </Button>
          </Link>
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
                {(user.role === 'student' || user.role === 'teacher') && (
                  <DropdownMenuItem onSelect={() => setIsDataSettingsOpen(true)} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{translations.dashboardHeader.dataSettings}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => setIsThemeCustomizerOpen(true)} className="cursor-pointer">
                  <Palette className="mr-2 h-4 w-4" />
                  <span>{translations.dashboardHeader.themes}</span>
                </DropdownMenuItem>
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
      {user?.role === 'student' && <StudentDataSettings user={user} isOpen={isDataSettingsOpen} onOpenChange={setIsDataSettingsOpen} />}
      {user?.role === 'teacher' && <TeacherDataSettings user={user} isOpen={isDataSettingsOpen} onOpenChange={setIsDataSettingsOpen} />}
    </Dialog>
  );
}
