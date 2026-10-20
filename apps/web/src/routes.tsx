import type { ReactElement } from 'react'
import type { Treatment } from '@/types'
import { PATHS, type Lang } from '@/i18n'
import { LANDINGS, findLanding, landingPath, matchTreatments } from '@/content/landings'
import { localizeTreatment } from '@/content/treatments-en'
import {
  breadcrumbJsonLd, businessJsonLd, faqJsonLd, serviceJsonLd, type PageMeta,
} from '@/seo/head'
import type { Crumb } from '@/components/layout/PageLayout'
import { Home } from '@/pages/Home'
import { HOME_PAGE, HUB_PAGE, ABOUT_PAGE, CONTACT_PAGE } from '@/content/pages'
import { TreatmentsHub } from '@/pages/TreatmentsHub'
import { LandingPage } from '@/pages/LandingPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { NotFound } from '@/pages/NotFound'
import { AvisoLegal } from '@/pages/AvisoLegal'
import { Privacidad } from '@/pages/Privacidad'
import { PoliticaCookies } from '@/pages/PoliticaCookies'

/**
 * Todas las páginas de la web. De aquí salen las rutas del router, el <head>
 * de cada página (título, descripción, hreflang y JSON-LD), el HTML
 * prerenderizado y el sitemap (`scripts/prerender.mjs`).
 */
export interface AppRoute {
  path: string
  lang: Lang
  altPath?: string
  element: ReactElement
  meta: (treatments: Treatment[]) => PageMeta
  /** Se incluye en sitemap.xml. */
  sitemap: boolean
}

const CRUMB_LABELS = {
  home: { es: 'Inicio', en: 'Home' },
  treatments: { es: 'Tratamientos', en: 'Treatments' },
  about: { es: 'Sobre nosotros', en: 'About us' },
  contact: { es: 'Contacto', en: 'Contact' },
}

const other = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es')
const crumb = (key: keyof typeof CRUMB_LABELS, lang: Lang): Crumb => ({
  name: CRUMB_LABELS[key][lang],
  path: PATHS[key][lang],
})

const buildRoutes = (): AppRoute[] => {
  const routes: AppRoute[] = []

  for (const lang of ['es', 'en'] as const) {
    const alt = other(lang)

    routes.push({
      path: PATHS.home[lang],
      lang,
      altPath: PATHS.home[alt],
      element: <Home />,
      meta: () => ({
        path: PATHS.home[lang], lang, altPath: PATHS.home[alt], ...HOME_PAGE[lang],
        jsonLd: [businessJsonLd(lang)],
      }),
      sitemap: true,
    })

    const hubCrumbs = [crumb('home', lang), crumb('treatments', lang)]
    routes.push({
      path: PATHS.treatments[lang],
      lang,
      altPath: PATHS.treatments[alt],
      element: <TreatmentsHub crumbs={hubCrumbs} />,
      meta: () => ({
        path: PATHS.treatments[lang], lang, altPath: PATHS.treatments[alt],
        title: HUB_PAGE[lang].title, description: HUB_PAGE[lang].description,
        jsonLd: [breadcrumbJsonLd(hubCrumbs)],
      }),
      sitemap: true,
    })

    for (const landing of LANDINGS) {
      const path = landingPath(landing, lang)
      const parent = landing.parent ? findLanding(landing.parent) : undefined
      const crumbs: Crumb[] = [
        ...hubCrumbs,
        ...(parent ? [{ name: parent.label[lang], path: landingPath(parent, lang) }] : []),
        { name: landing.label[lang], path },
      ]
      const copy = landing.copy[lang]
      routes.push({
        path,
        lang,
        altPath: landingPath(landing, alt),
        element: <LandingPage landing={landing} crumbs={crumbs} />,
        meta: (treatments) => ({
          path, lang, altPath: landingPath(landing, alt),
          title: copy.title, description: copy.description,
          jsonLd: [
            breadcrumbJsonLd(crumbs),
            serviceJsonLd(
              copy.h1,
              copy.description,
              path,
              matchTreatments(landing, treatments).map((t) => localizeTreatment(t, lang)),
            ),
            ...(copy.faqs.length ? [faqJsonLd(copy.faqs)] : []),
          ],
        }),
        sitemap: true,
      })
    }

    const aboutCrumbs = [crumb('home', lang), crumb('about', lang)]
    routes.push({
      path: PATHS.about[lang],
      lang,
      altPath: PATHS.about[alt],
      element: <AboutPage crumbs={aboutCrumbs} />,
      meta: () => ({
        path: PATHS.about[lang], lang, altPath: PATHS.about[alt],
        title: ABOUT_PAGE[lang].title, description: ABOUT_PAGE[lang].description,
        jsonLd: [breadcrumbJsonLd(aboutCrumbs)],
      }),
      sitemap: true,
    })

    const contactCrumbs = [crumb('home', lang), crumb('contact', lang)]
    routes.push({
      path: PATHS.contact[lang],
      lang,
      altPath: PATHS.contact[alt],
      element: <ContactPage crumbs={contactCrumbs} />,
      meta: () => ({
        path: PATHS.contact[lang], lang, altPath: PATHS.contact[alt],
        title: CONTACT_PAGE[lang].title, description: CONTACT_PAGE[lang].description,
        jsonLd: [breadcrumbJsonLd(contactCrumbs), businessJsonLd(lang)],
      }),
      sitemap: true,
    })
  }

  // Páginas legales: solo en castellano y fuera del sitemap.
  const legal = [
    { path: '/aviso-legal', title: 'Aviso Legal | AestheticA', element: <AvisoLegal /> },
    { path: '/privacidad', title: 'Política de Privacidad | AestheticA', element: <Privacidad /> },
    { path: '/politica-cookies', title: 'Política de Cookies | AestheticA', element: <PoliticaCookies /> },
  ]
  for (const { path, title, element } of legal) {
    routes.push({
      path,
      lang: 'es',
      element,
      meta: () => ({ path, lang: 'es', title, description: `${title.split(' |')[0]} del Estudio AestheticA, Ruzafa, Valencia.`, jsonLd: [] }),
      sitemap: false,
    })
  }

  return routes
}

export const ROUTES = buildRoutes()

/** Ruta comodín: se prerenderiza como 404.html. */
export const NOT_FOUND_ROUTE: AppRoute = {
  path: '*',
  lang: 'es',
  element: <NotFound />,
  meta: () => ({
    path: '/404', lang: 'es', noindex: true,
    title: 'Página no encontrada | AestheticA',
    description: 'La página que buscas no existe.',
    jsonLd: [],
  }),
  sitemap: false,
}
