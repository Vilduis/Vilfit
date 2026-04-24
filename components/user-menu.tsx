"use client"

import Link from "next/link"
import {
  Briefcase,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
  CreditCard,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { handleSignOut } from "@/app/actions/auth"

interface UserMenuProps {
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
  role: "candidate" | "recruiter" | null | undefined
}

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  return email?.[0]?.toUpperCase() ?? "U"
}

export function UserMenu({ name, email, image, role }: UserMenuProps) {
  const initials = getInitials(name, email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar>
            <AvatarImage src={image ?? undefined} alt={name ?? "Usuario"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Info del usuario */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground leading-none">
              {name ?? "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {role === "candidate" && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/jobs">
                  <Search className="size-4" />
                  Buscar trabajo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <FileText className="size-4" />
                  Mis postulaciones
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="size-4" />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        {role === "recruiter" && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/dashboard">
                  <LayoutDashboard className="size-4" />
                  Panel de control
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/jobs">
                  <Briefcase className="size-4" />
                  Mis ofertas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/jobs/new">
                  <Plus className="size-4" />
                  Publicar oferta
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/billing">
                  <CreditCard className="size-4" />
                  Facturación
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recruiter/profile">
                  <Settings className="size-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        {!role && (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/onboarding">
                <User className="size-4" />
                Completar perfil
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => handleSignOut()}
          className="cursor-pointer"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
