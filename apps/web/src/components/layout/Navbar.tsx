import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CLINIC } from '@/config/clinic'
import { LANGS, LANG_NAMES, PATHS, bookingHref, usePage, type Lang } from '@/i18n'
import { LangFlag } from '@/components/LangFlag'

const NAV = {
  es: {
    links: [
      { label: 'Tratamientos', to: PATHS.treatments.es },
      { label: 'Quiénes somos', to: PATHS.about.es },
      { label: 'Contacto', to: PATHS.contact.es },
    ],
    book: 'Agendar cita',
    open: 'Abrir menú',
    close: 'Cerrar menú',
  },
  en: {
    links: [
      { label: 'Treatments', to: PATHS.treatments.en },
      { label: 'About us', to: PATHS.about.en },
      { label: 'Contact', to: PATHS.contact.en },
    ],
    book: 'Book now',
    open: 'Open menu',
    close: 'Close menu',
  },
  uk: {
    links: [
      { label: 'Процедури', to: PATHS.treatments.uk },
      { label: 'Про нас', to: PATHS.about.uk },
      { label: 'Контакти', to: PATHS.contact.uk },
    ],
    book: 'Записатися',
    open: 'Відкрити меню',
    close: 'Закрити меню',
  },
}

/** Botón de reserva: baja al formulario si está en la página; si no, va a la portada. */
const useBookingClick = (lang: Lang) => {
  const navigate = useNavigate()
  return (e: React.MouseEvent) => {
    e.preventDefault()
    const form = document.getElementById('agendar')
    if (form) form.scrollIntoView({ behavior: 'smooth' })
    else navigate(bookingHref(lang))
  }
}

export const Navbar = () => {
  const { lang, alternates } = usePage()
  const t = NAV[lang]
  const others = LANGS.filter((l) => l !== lang)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const onBook = useBookingClick(lang)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Una bandera por cada otro idioma; lleva a la misma página en ese idioma
  // (o a su portada si la página solo existe en castellano, como las legales).
  const langSwitch = (
    <div className="flex items-center gap-2">
      {others.map((other: Lang) => (
        <Link
          key={other}
          to={alternates?.[other] ?? PATHS.home[other]}
          hrefLang={other}
          lang={other}
          aria-label={LANG_NAMES[other]}
          title={LANG_NAMES[other]}
          className="inline-flex rounded-sm ring-1 ring-neutral-200 opacity-80 hover:opacity-100 hover:ring-gold-300 transition"
        >
          <LangFlag lang={other} className="block h-4 w-6 rounded-sm" />
        </Link>
      ))}
    </div>
  )

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
          aria-label={menuOpen ? t.close : t.open}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo — centrado en móvil (absolute), izquierda en desktop (static) */}
        <Link
          to={PATHS.home[lang]}
          className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center"
        >
          <img
            src="/aesthetica.png"
            alt="AestheticA — Estética Avanzada"
            width={545}
            height={313}
            className="h-28 w-auto mix-blend-multiply"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-5 lg:gap-8">
          {t.links.map(({ label, to }) => (
            <li key={to}>
              <Link to={to} className="whitespace-nowrap text-lg text-neutral-600 hover:text-gold-500 transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs — en tablet el teléfono es solo el icono para que quepa todo en una línea */}
        <div className="hidden md:flex items-center gap-3 pl-4">
          {langSwitch}
          <a
            href={CLINIC.contact.phone_href}
            aria-label={CLINIC.contact.phone}
            className="inline-flex items-center gap-2 whitespace-nowrap border border-gold-300 text-gold-500 text-lg px-3.5 lg:px-5 py-3 rounded-full hover:bg-gold-50 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden lg:inline">{CLINIC.contact.phone.replace('+34 ', '')}</span>
          </a>
          <a
            href={bookingHref(lang)}
            onClick={onBook}
            className="inline-flex items-center whitespace-nowrap bg-gold-400 text-white text-lg px-6 py-3 rounded-full hover:bg-gold-500 transition-colors"
          >
            {t.book}
          </a>
        </div>

        {/* En móvil los idiomas aparecen junto a las acciones, bajo el logo. */}
      </nav>

      {/* Botones fijos bajo el logo — móvil, siempre visibles */}
      <div className="md:hidden flex items-center gap-1.5 px-2 py-4 justify-center">
        <a
          href={CLINIC.contact.phone_href}
          className="inline-flex items-center gap-1.5 whitespace-nowrap border border-gold-300 text-gold-500 text-xs px-2.5 py-2 rounded-full hover:bg-gold-50 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          {CLINIC.contact.phone.replace('+34 ', '')}
        </a>
        <a
          href={bookingHref(lang)}
          onClick={onBook}
          className="whitespace-nowrap bg-gold-400 text-white text-xs px-3 py-2 rounded-full hover:bg-gold-500 transition-colors"
        >
          {t.book}
        </a>
        {langSwitch}
      </div>

      {/* Mobile menu — solo links de navegación */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-4 flex flex-col gap-1">
          {t.links.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="text-left text-base text-neutral-700 hover:text-gold-500 py-3 border-b border-neutral-100 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
