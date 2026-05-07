"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogIn, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface NavbarProps {
  userName: string | null
  userEmail: string | null
  userImage: string | null
  role: "candidate" | "recruiter" | null
}

export function Navbar({ userName, userEmail, userImage, role }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const isLoggedIn = userEmail !== null

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-md bg-background/80 transition-all duration-300",
        scrolled ? "shadow-sm border-b border-border/60" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" aria-label="Vilfit">
          <Logo variant="on-light" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/jobs">Ofertas</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="#como-funciona">Cómo funciona</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          {role === "recruiter" && (
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground hover:text-foreground">
              <Link href="/recruiter/jobs/new">
                <Plus data-icon="inline-start" />
                Nueva oferta
              </Link>
            </Button>
          )}

          {isLoggedIn ? (
            <UserMenu name={userName} email={userEmail} image={userImage} role={role} />
          ) : (
            <Button asChild size="sm" className="ml-1">
              <Link href="/login">
                <LogIn data-icon="inline-start" />
                Ingresar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
