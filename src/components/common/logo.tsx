import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 31.5C24.5604 31.5 31.5 24.5604 31.5 16C31.5 7.43959 24.5604 0.5 16 0.5C7.43959 0.5 0.5 7.43959 0.5 16C0.5 24.5604 7.43959 31.5 16 31.5Z"
          className="fill-primary"
          stroke="hsl(var(--primary-foreground))"
          strokeOpacity="0.5"
        />
        <path
          d="M16.0002 11.1667C18.6668 11.1667 20.8335 13.3333 20.8335 16C20.8335 18.6667 18.6668 20.8333 16.0002 20.8333C13.3335 20.8333 11.1668 18.6667 11.1668 16C11.1668 13.3333 13.3335 11.1667 16.0002 11.1667Z"
          fill="hsl(var(--background))"
        />
      </svg>
      <span className="text-2xl font-bold font-headline text-primary-foreground">
        Uncoverly Hub
      </span>
    </div>
  );
}
