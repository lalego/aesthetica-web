import { createContext, useContext } from 'react'

/** Idiomas de la web. El primero es el principal (x-default y rutas sin prefijo). */
export const LANGS = ['es', 'en', 'uk'] as const
export type Lang = (typeof LANGS)[number]

/** Para fechas, horas y precios (toLocaleString). */
export const LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-GB', uk: 'uk-UA' }

/** Nombre de cada idioma en sí mismo, para el selector. */
export const LANG_NAMES: Record<Lang, string> = { es: 'Español', en: 'English', uk: 'Українська' }

export interface PageContextValue {
  lang: Lang
  /** Ruta equivalente en cada idioma, si existe (selector de idioma y hreflang). */
  alternates?: Partial<Record<Lang, string>>
}

export const PageContext = createContext<PageContextValue>({ lang: 'es' })

export const usePage = () => useContext(PageContext)
export const useLang = () => useContext(PageContext).lang

/** Rutas fijas por idioma. Las de tratamientos están en `content/landings.ts`. */
export const PATHS = {
  home:       { es: '/',               en: '/en',            uk: '/uk' },
  treatments: { es: '/tratamientos',   en: '/en/treatments', uk: '/uk/treatments' },
  about:      { es: '/sobre-nosotros', en: '/en/about',      uk: '/uk/about' },
  contact:    { es: '/contacto',       en: '/en/contact',    uk: '/uk/contact' },
} as const satisfies Record<string, Record<Lang, string>>

/** Enlace al formulario de reserva, que está en la portada de cada idioma. */
export const bookingHref = (lang: Lang) => `${PATHS.home[lang]}#agendar`

const HOURS: Record<Exclude<Lang, 'es'>, Record<string, string>> = {
  en: { 'Lun – Vie': 'Mon – Fri', 'Sábado': 'Saturday', 'Domingo': 'Sunday', 'Cerrado': 'Closed' },
  uk: { 'Lun – Vie': 'Пн – Пт', 'Sábado': 'Субота', 'Domingo': 'Неділя', 'Cerrado': 'Зачинено' },
}

/** Traduce las etiquetas de `CLINIC.hours`, que están en castellano. */
export const hoursLabel = (text: string, lang: Lang) => (lang === 'es' ? text : HOURS[lang][text] ?? text)
