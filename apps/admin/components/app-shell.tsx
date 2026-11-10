'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppSidebar, NAV_ITEMS } from '@/components/app-sidebar'

interface AppShellProps {
  userEmail: string
  children: React.ReactNode
}

// Layout "inset": barra lateral sobre el fondo gris y el contenido en una
// tarjeta. En móvil la barra se abre como panel deslizante.
export function AppShell({ userEmail, children }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const section = NAV_ITEMS.find(({ href }) => pathname.startsWith(href))

  return (
    <div className="flex h-screen overflow-hidden bg-sidebar">
      <AppSidebar userEmail={userEmail} className="hidden md:flex" />

      {/* Panel móvil */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <AppSidebar
        userEmail={userEmail}
        onNavigate={() => setMobileOpen(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-50 shadow-lg transition-transform md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pr-2">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-xl md:border md:shadow-sm">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
            >
              <Menu className="size-4" />
              <span className="sr-only">Abrir menú</span>
            </button>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>AestheticA</span>
              {section && (
                <>
                  <span>/</span>
                  <span className="font-medium text-foreground">{section.label}</span>
                </>
              )}
            </nav>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
