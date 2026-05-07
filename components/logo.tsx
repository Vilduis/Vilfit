import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "on-primary" | "on-light"
  className?: string
}

export function Logo({ variant = "on-primary", className }: LogoProps) {
  const isOnPrimary = variant === "on-primary"

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isOnPrimary ? "bg-white/20" : "bg-primary"
        )}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M3 5L9 14L15 5"
            stroke="white"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          isOnPrimary ? "text-primary-foreground" : "text-foreground"
        )}
      >
        vilfit
      </span>
    </div>
  )
}
