"use client";

import { cn } from "@/lib/utils";
import { withBasePath } from "@/hooks/use-base-path";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src={withBasePath("/logo.png")}
        alt="Uncoverly Logo"
        width={32}
        height={32}
        className="rounded-md"
      />
      <span className="text-2xl font-bold font-headline text-foreground">
        Uncoverly
      </span>
    </div>
  );
}
