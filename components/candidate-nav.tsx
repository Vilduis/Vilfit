"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/applications", label: "Mis postulaciones", icon: FileText },
  { href: "/profile", label: "Mi perfil", icon: User },
]

export function CandidateNav() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-card/60 px-6 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl gap-1">
        {tabs.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              pathname === href
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
