'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, Sparkles, FileText, LogOut, UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth-actions'

const NAV_ITEMS = [
  { href: '/citas',         label: 'Citas',          icon: Calendar  },
  { href: '/pacientes',     label: 'Pacientes',      icon: Users     },
  { href: '/tratamientos',  label: 'Tratamientos',   icon: Sparkles  },
  { href: '/facturas',      label: 'Facturación',    icon: FileText  },
  { href: '/staff',         label: 'Staff',          icon: UserCog   },
]

interface AppSidebarProps {
  userEmail: string
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-5">
        <span className="text-base font-semibold tracking-tight">AestheticA</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <p className="truncate px-3 pb-2 text-xs text-muted-foreground">{userEmail}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
