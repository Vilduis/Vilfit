import { cn } from "@/lib/utils"

function getAvatarColors(name: string): { from: string; to: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  }
  const hue = Math.abs(hash) % 360
  return {
    from: `oklch(0.55 0.20 ${hue})`,
    to: `oklch(0.44 0.22 ${(hue + 45) % 360})`,
  }
}

interface CompanyAvatarProps {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function CompanyAvatar({ name, className, size = "md" }: CompanyAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const { from, to } = getAvatarColors(name)

  const sizeClass = {
    sm: "size-8 rounded-lg text-xs",
    md: "size-10 rounded-lg text-sm",
    lg: "size-12 rounded-xl text-base",
  }[size]

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-white",
        sizeClass,
        className
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
