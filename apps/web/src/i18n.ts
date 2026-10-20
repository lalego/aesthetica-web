import { createContext, useContext } from 'react'

export type Lang = 'es' | 'en'

export interface PageContextValue {
  lang: Lang
  /** Ruta equivalente en el otro idioma, si existe (para el selector de idioma). */
  altPath?: string
}

export const PageContext = createContext<PageContextValue>({ lang: 'es' })

export const usePage = () => useContext(PageContext)
export const useLang = () => useContext(PageContext).lang

/** Rutas fijas por idioma. Las de tratamientos están en `content/landings.ts`. */
export const PATHS = {
  home:       { es: '/',               en: '/en' },
  treatments: { es: '/tratamientos',   en: '/en/treatments' },
  about:      { es: '/sobre-nosotros', en: '/en/about' },
  contact:    { es: '/contacto',       en: '/en/contact' },
} as const

/** Enlace al formulario de reserva, que está en la portada de cada idioma. */
export const bookingHref = (lang: Lang) => `${PATHS.home[lang]}#agendar`

const HOURS_EN: Record<string, string> = {
  'Lun – Vie': 'Mon – Fri',
  'Sábado': 'Saturday',
  'Domingo': 'Sunday',
  'Cerrado': 'Closed',
}

/** Traduce las etiquetas de `CLINIC.hours`, que están en castellano. */
export const hoursLabel = (text: string, lang: Lang) => (lang === 'en' ? HOURS_EN[text] ?? text : text)
