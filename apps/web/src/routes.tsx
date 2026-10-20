import type { ReactElement } from 'react'
import type { Treatment } from '@/types'
import { LANGS, PATHS, type Lang } from '@/i18n'
import { LANDINGS, findLanding, landingPath, matchTreatments } from '@/content/landings'
import { localizeTreatment } from '@/content/treatments-i18n'
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
  /** La misma página en cada idioma (incluido el propio). Vacío si solo existe en uno. */
  alternates?: Record<Lang, string>
  element: ReactElement
  meta: (treatments: Treatment[]) => PageMeta
  /** Se incluye en sitemap.xml. */
  sitemap: boolean
}

const CRUMB_LABELS = {
  home: { es: 'Inicio', en: 'Home', uk: 'Головна' },
  treatments: { es: 'Tratamientos', en: 'Treatments', uk: 'Процедури' },
  about: { es: 'Sobre nosotros', en: 'About us', uk: 'Про нас' },
  contact: { es: 'Contacto', en: 'Contact', uk: 'Контакти' },
} satisfies Record<string, Record<Lang, string>>

const crumb = (key: keyof typeof CRUMB_LABELS, lang: Lang): Crumb => ({
  name: CRUMB_LABELS[key][lang],
  path: PATHS[key][lang],
})

/** La ruta de una página en los tres idiomas, a partir de una función por idioma. */
const allLangs = (pathFor: (lang: Lang) => string) =>
  Object.fromEntries(LANGS.map((l) => [l, pathFor(l)])) as Record<Lang, string>

const buildRoutes = (): AppRoute[] => {
  const routes: AppRoute[] = []

  for (const lang of LANGS) {
    const home = allLangs((l) => PATHS.home[l])
    routes.push({
      path: home[lang],
      lang,
      alternates: home,
      element: <Home />,
      meta: () => ({
        path: home[lang], lang, alternates: home, ...HOME_PAGE[lang],
        jsonLd: [businessJsonLd(lang)],
      }),
      sitemap: true,
    })

    const hub = allLangs((l) => PATHS.treatments[l])
    const hubCrumbs = [crumb('home', lang), crumb('treatments', lang)]
    routes.push({
      path: hub[lang],
      lang,
      alternates: hub,
      element: <TreatmentsHub crumbs={hubCrumbs} />,
      meta: () => ({
        path: hub[lang], lang, alternates: hub,
        title: HUB_PAGE[lang].title, description: HUB_PAGE[lang].description,
        jsonLd: [breadcrumbJsonLd(hubCrumbs)],
      }),
      sitemap: true,
    })

    for (const landing of LANDINGS) {
      const alternates = allLangs((l) => landingPath(landing, l))
      const path = alternates[lang]
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
        alternates,
        element: <LandingPage landing={landing} crumbs={crumbs} />,
        meta: (treatments) => ({
          path, lang, alternates,
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

    const about = allLangs((l) => PATHS.about[l])
    const aboutCrumbs = [crumb('home', lang), crumb('about', lang)]
    routes.push({
      path: about[lang],
      lang,
      alternates: about,
      element: <AboutPage crumbs={aboutCrumbs} />,
      meta: () => ({
        path: about[lang], lang, alternates: about,
        title: ABOUT_PAGE[lang].title, description: ABOUT_PAGE[lang].description,
        jsonLd: [breadcrumbJsonLd(aboutCrumbs)],
      }),
      sitemap: true,
    })

    const contact = allLangs((l) => PATHS.contact[l])
    const contactCrumbs = [crumb('home', lang), crumb('contact', lang)]
    routes.push({
      path: contact[lang],
      lang,
      alternates: contact,
      element: <ContactPage crumbs={contactCrumbs} />,
      meta: () => ({
        path: contact[lang], lang, alternates: contact,
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
