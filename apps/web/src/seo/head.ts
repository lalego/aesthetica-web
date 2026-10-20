import { CLINIC } from '@/config/clinic'
import { LANGS, type Lang } from '@/i18n'
import type { Treatment } from '@/types'

export const SITE_URL = CLINIC.website
export const SITE_NAME = 'AestheticA — Estética Avanzada'
const OG_IMAGE = `${SITE_URL}/img/og-aesthetica.jpg`
const BUSINESS_ID = `${SITE_URL}/#business`
const OG_LOCALES: Record<Lang, string> = { es: 'es_ES', en: 'en_GB', uk: 'uk_UA' }

export interface PageMeta {
  path: string
  lang: Lang
  title: string
  description: string
  /** La misma página en cada idioma (hreflang). */
  alternates?: Record<Lang, string>
  noindex?: boolean
  jsonLd: object[]
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const abs = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`)

/**
 * Etiquetas del <head> de cada página. Las usan el prerender (HTML estático)
 * y el cliente al navegar (`HeadSync`), así que son una sola fuente.
 * Todas llevan `data-head` para poder sustituirlas al cambiar de ruta.
 */
export const headTags = (meta: PageMeta) => {
  const url = abs(meta.path)
  const tags = [
    `<meta name="description" content="${esc(meta.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:locale" content="${OG_LOCALES[meta.lang]}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ]
  if (meta.noindex) tags.push(`<meta name="robots" content="noindex">`)
  if (meta.alternates) {
    for (const l of LANGS) tags.push(`<link rel="alternate" hreflang="${l}" href="${abs(meta.alternates[l])}">`)
    tags.push(`<link rel="alternate" hreflang="x-default" href="${abs(meta.alternates.es)}">`)
  }
  for (const data of meta.jsonLd) {
    // `<` escapado para que un texto no pueda cerrar el <script>.
    tags.push(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  }
  return tags.map((t) => t.replace(/^<(\w+)/, '<$1 data-head')).join('\n    ')
}

// ── JSON-LD (schema.org) ──────────────────────────────────────────

/**
 * Ficha del negocio. `BeautySalon` y no `MedicalBusiness`: es un estudio de
 * estética sin personal sanitario. No incluye `aggregateRating`: Google no
 * muestra estrellas de reseñas publicadas por el propio negocio, y copiar las
 * de Google Business Profile va contra sus directrices.
 */
export const businessJsonLd = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  '@id': BUSINESS_ID,
  name: 'AestheticA',
  alternateName: [SITE_NAME, 'Estudio AestheticA'],
  description: {
    es: 'Estudio de estética avanzada en Ruzafa, Valencia: tratamientos faciales, depilación láser diodo, tratamientos corporales y masajes.',
    en: 'Advanced aesthetics studio in Ruzafa, Valencia: facials, diode laser hair removal, body treatments and massage.',
    uk: 'Студія естетичної косметології в районі Руссафа, Валенсія: догляд за обличчям, діодна лазерна епіляція, процедури для тіла та масаж.',
  }[lang],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/aesthetica.png`,
  image: [OG_IMAGE, `${SITE_URL}/hero-clinic.jpeg`],
  telephone: CLINIC.contact.phone.replace(/\s/g, ''),
  email: CLINIC.contact.email,
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: CLINIC.address.street,
    addressLocality: CLINIC.address.city,
    addressRegion: CLINIC.address.province,
    postalCode: CLINIC.address.zip,
    addressCountry: 'ES',
  },
  geo: { '@type': 'GeoCoordinates', ...CLINIC.geo },
  hasMap: CLINIC.maps.href,
  areaServed: [
    { '@type': 'Place', name: 'Ruzafa, València' },
    { '@type': 'City', name: 'València' },
  ],
  openingHoursSpecification: CLINIC.opening_hours.map(({ days, opens, closes }) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: days,
    opens,
    closes,
  })),
  founder: { '@type': 'Person', name: 'Alena Martseniuk' },
  knowsLanguage: ['es', 'en', 'it', 'uk', 'ru'],
  sameAs: [CLINIC.contact.instagram_href, CLINIC.contact.facebook_href, CLINIC.maps.href],
})

/** Referencia corta al negocio para las páginas que no son la portada. */
const businessRef = { '@id': BUSINESS_ID }

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: abs(item.path),
  })),
})

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})

export const serviceJsonLd = (
  name: string,
  description: string,
  path: string,
  treatments: Treatment[],
) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  url: abs(path),
  provider: businessRef,
  areaServed: { '@type': 'City', name: 'València' },
  ...(treatments.some((t) => t.price_eur) && {
    offers: treatments
      .filter((t) => t.price_eur)
      .map((t) => ({
        '@type': 'Offer',
        name: t.name,
        price: t.price_eur,
        priceCurrency: 'EUR',
      })),
  }),
})
