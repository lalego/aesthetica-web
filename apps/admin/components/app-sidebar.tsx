'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, Sparkles, FileText, LogOut, UserCog, ChevronsUpDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth-actions'
import { APP_VERSION, CHANGELOG_URL } from '@/lib/version'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/inicio',        label: 'Inicio',         icon: LayoutDashboard },
  { href: '/citas',         label: 'Citas',          icon: Calendar  },
  { href: '/pacientes',     label: 'Pacientes',      icon: Users     },
  { href: '/tratamientos',  label: 'Tratamientos',   icon: Sparkles  },
  { href: '/facturas',      label: 'Facturación',    icon: FileText  },
  { href: '/usuarios',      label: 'Usuarios',       icon: UserCog   },
]

interface AppSidebarProps {
  userEmail: string
  // Para cerrar el menú móvil al navegar.
  onNavigate?: () => void
  className?: string
}

export function AppSidebar({ userEmail, onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn('flex h-full w-60 flex-col bg-sidebar text-sidebar-foreground', className)}>
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-brand text-base font-semibold">AestheticA</span>
          <span className="text-xs text-muted-foreground">Panel de gestión</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">Gestión</p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-9 items-center gap-3 rounded-md px-2 text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('size-4 shrink-0', active && 'text-sidebar-primary')} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3">
        <NavUser email={userEmail} />
        <a
          href={CHANGELOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-2 pt-2 text-xs text-muted-foreground hover:text-sidebar-foreground"
        >
          v{APP_VERSION} · Novedades
        </a>
      </div>
    </aside>
  )
}

function NavUser({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-sidebar-accent">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground">
          {initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate font-medium">Staff</span>
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut />
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
