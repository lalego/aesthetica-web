import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Tratamientos', href: '#tratamientos' },
  { label: 'Quiénes somos', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
]

const BOOKING_HREF = '#agendar'

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-100'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="flex items-center"
        >
          <img
            src="/aesthetica.png"
            alt="Clínica AestheticA"
            className="h-10 w-auto mix-blend-multiply"
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <button
                onClick={() => handleNavClick(href)}
                className="text-sm text-neutral-600 hover:text-gold-500 transition-colors"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <button
          onClick={() => handleNavClick(BOOKING_HREF)}
          className="hidden md:inline-flex items-center bg-gold-400 text-white text-sm px-5 py-2.5 rounded-full hover:bg-gold-500 transition-colors"
        >
          Agendar cita
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 text-neutral-700"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className="text-left text-sm text-neutral-700 hover:text-gold-500 py-1"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick(BOOKING_HREF)}
            className="mt-2 bg-gold-400 text-white text-sm px-5 py-2.5 rounded-full hover:bg-gold-500 transition-colors w-full"
          >
            Agendar cita
          </button>
        </div>
      )}
    </header>
  )
}
