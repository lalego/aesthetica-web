import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLINIC } from '@/config/clinic'

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
      <nav className="relative max-w-6xl mx-auto px-6 h-32 flex items-center justify-between">
        {/* Mobile: hamburger izquierda | Desktop: oculto */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 text-neutral-700 z-10"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo — centrado en móvil (absolute), izquierda en desktop (static) */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center"
        >
          <img
            src="/aesthetica.png"
            alt="Centro AestheticA"
            className="h-28 w-auto mix-blend-multiply"
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <button
                onClick={() => handleNavClick(href)}
                className="text-lg text-neutral-600 hover:text-gold-500 transition-colors"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={CLINIC.contact.phone_href}
            className="inline-flex items-center gap-2 border border-gold-300 text-gold-500 text-lg px-5 py-3 rounded-full hover:bg-gold-50 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {CLINIC.contact.phone.replace('+34 ', '')}
          </a>
          <button
            onClick={() => handleNavClick(BOOKING_HREF)}
            className="inline-flex items-center bg-gold-400 text-white text-lg px-6 py-3 rounded-full hover:bg-gold-500 transition-colors"
          >
            Agendar cita
          </button>
        </div>

        {/* Espaciador móvil derecha para equilibrar el hamburger izquierdo */}
        <div className="md:hidden w-10 h-10" aria-hidden="true" />
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-6 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className="text-left text-base text-neutral-700 hover:text-gold-500 py-3 border-b border-neutral-100 transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={CLINIC.contact.phone_href}
              className="inline-flex items-center justify-center gap-2 border border-gold-300 text-gold-500 text-base px-5 py-3 rounded-full hover:bg-gold-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {CLINIC.contact.phone.replace('+34 ', '')}
            </a>
            <button
              onClick={() => handleNavClick(BOOKING_HREF)}
              className="bg-gold-400 text-white text-base px-5 py-3 rounded-full hover:bg-gold-500 transition-colors"
            >
              Agendar cita
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
