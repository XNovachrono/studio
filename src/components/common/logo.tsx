import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image 
        src="/logo.png"
        alt="Uncoverly Logo"
        width={32}
        height={32}
        className="rounded-md"
      />
      <span className="text-2xl font-bold font-headline text-primary-foreground">
        Uncoverly
      </span>
    </div>
  );
}
