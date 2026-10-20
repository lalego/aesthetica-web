import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CLINIC } from '@/config/clinic'
import { useLang } from '@/i18n'
import { useTreatments } from '@/hooks/useTreatments'
import { LANDINGS, findLanding, landingPath, matchTreatments, type Landing } from '@/content/landings'
import { PageLayout, PageHeader, type Crumb } from '@/components/layout/PageLayout'
import { TreatmentCard } from '@/components/TreatmentCard'
import { BookingSection } from '@/components/sections/BookingSection'
import { ContactSection } from '@/components/sections/ContactSection'

const COPY = {
  es: {
    book: 'Reservar cita',
    whatsapp: 'Consultar por WhatsApp',
    prices: 'Precios y duración',
    related: 'Tratamientos relacionados',
    seeAll: 'Ver todos los tratamientos de',
    faq: 'Preguntas frecuentes',
  },
  en: {
    book: 'Book an appointment',
    whatsapp: 'Ask on WhatsApp',
    prices: 'Prices and duration',
    related: 'Related treatments',
    seeAll: 'See all treatments in',
    faq: 'Frequently asked questions',
  },
  uk: {
    book: 'Записатися',
    whatsapp: 'Запитати у WhatsApp',
    prices: 'Ціни та тривалість',
    related: 'Схожі процедури',
    seeAll: 'Усі процедури в категорії',
    faq: 'Часті запитання',
  },
}

interface LandingPageProps {
  landing: Landing
  crumbs: Crumb[]
}

export const LandingPage = ({ landing, crumbs }: LandingPageProps) => {
  const lang = useLang()
  const t = COPY[lang]
  const copy = landing.copy[lang]
  const { data: treatments = [] } = useTreatments()
  const matched = matchTreatments(landing, treatments)

  const parent = landing.parent ? findLanding(landing.parent) : undefined
  const children = LANDINGS.filter((l) => l.parent === landing.key)

  return (
    <PageLayout>
      <PageHeader crumbs={crumbs} h1={copy.h1} intro={copy.intro}>
        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="#agendar"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-gold-400 text-white px-8 py-3.5 rounded-full hover:bg-gold-500 transition-colors flex items-center gap-2 group shadow-md shadow-gold-200"
          >
            {t.book}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href={CLINIC.contact.whatsapp_href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-neutral-300 text-neutral-700 px-8 py-3.5 rounded-full hover:border-gold-300 hover:text-gold-500 transition-colors"
          >
            {t.whatsapp}
          </a>
        </div>
      </PageHeader>

      {/* Tratamientos con precio (de Supabase) */}
      {matched.length > 0 && (
        <section className="bg-cream-100 py-16">
          <div className="max-w-6xl mx-auto px-6 space-y-8">
            <h2 className="text-3xl font-normal text-neutral-900 text-center">{t.prices}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matched.map((tr) => (
                <TreatmentCard key={tr.id} treatment={tr} linkToLanding={landing.kind === 'category'} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Texto */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          {copy.sections.map(({ h2, paragraphs }) => (
            <div key={h2} className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-normal text-neutral-900">{h2}</h2>
              {paragraphs.map((p, i) => (
                <p key={i} className="text-neutral-700 leading-relaxed">{p}</p>
              ))}
            </div>
          ))}

          {/* Enlaces internos: subpáginas o categoría padre */}
          {(children.length > 0 || parent) && (
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-normal text-neutral-900">{t.related}</h2>
              <ul className="flex flex-wrap gap-2">
                {children.map((l) => (
                  <li key={l.key}>
                    <Link
                      to={landingPath(l, lang)}
                      className="inline-block px-5 py-2.5 rounded-full border border-neutral-200 text-neutral-700 hover:border-gold-300 hover:text-gold-500 transition-colors"
                    >
                      {l.label[lang]}
                    </Link>
                  </li>
                ))}
                {parent && (
                  <li>
                    <Link
                      to={landingPath(parent, lang)}
                      className="inline-block px-5 py-2.5 rounded-full border border-neutral-200 text-neutral-700 hover:border-gold-300 hover:text-gold-500 transition-colors"
                    >
                      {t.seeAll} {parent.label[lang].toLowerCase()}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Preguntas frecuentes (también van en el JSON-LD FAQPage) */}
          {copy.faqs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-normal text-neutral-900">{t.faq}</h2>
              <div className="divide-y divide-neutral-100 border-y border-neutral-100">
                {copy.faqs.map(({ q, a }) => (
                  <details key={q} className="group py-4">
                    <summary className="cursor-pointer list-none flex justify-between gap-4 font-medium text-neutral-800">
                      <h3>{q}</h3>
                      <span className="text-gold-400 group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="pt-3 text-neutral-700 leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <BookingSection />
      <ContactSection />
    </PageLayout>
  )
}
