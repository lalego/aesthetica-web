import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface PageLayoutProps {
  children: React.ReactNode
}

export const PageLayout = ({ children }: PageLayoutProps) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
)

export interface Crumb {
  name: string
  path: string
}

interface PageHeaderProps {
  /** Migas de pan; la última es la página actual. Deben coincidir con el JSON-LD. */
  crumbs: Crumb[]
  h1: string
  intro?: string[]
  children?: React.ReactNode
}

/** Cabecera de las páginas internas. El padding superior deja sitio al Navbar fijo. */
export const PageHeader = ({ crumbs, h1, intro, children }: PageHeaderProps) => (
  <section className="relative bg-cream-100 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200 pointer-events-none" />
    <div className="relative max-w-4xl mx-auto px-6 pt-56 md:pt-40 pb-16 space-y-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          {crumbs.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              {i < crumbs.length - 1 ? (
                <Link to={c.path} className="hover:text-gold-500 transition-colors">{c.name}</Link>
              ) : (
                <span aria-current="page" className="text-neutral-700">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="text-4xl lg:text-5xl font-normal text-neutral-900 leading-tight">{h1}</h1>
      {intro?.map((p, i) => (
        <p key={i} className="text-lg text-neutral-700 leading-relaxed">{p}</p>
      ))}
      {children}
    </div>
  </section>
)
