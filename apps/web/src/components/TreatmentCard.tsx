import { Link } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import type { Treatment, TreatmentCategory } from '@/types'
import { cn } from '@/lib/utils'
import { LOCALES, useLang, type Lang } from '@/i18n'
import { localizeTreatment } from '@/content/treatments-i18n'
import { landingForTreatment, landingPath } from '@/content/landings'
import { CATEGORY_LABELS } from '@/content/pages'

const MINUTES: Record<Lang, string> = { es: 'min', en: 'min', uk: 'хв' }
const READ_MORE: Record<Lang, string> = { es: 'Leer descripción completa', en: 'Read full description', uk: 'Читати повний опис' }

const CATEGORY_COLORS: Record<TreatmentCategory, string> = {
  facial:    'bg-gold-100 text-gold-600',
  corporal:  'bg-stone-100 text-stone-600',
  laser:     'bg-violet-50 text-violet-600',
  capilar:   'bg-teal-50 text-teal-600',
  bienestar: 'bg-amber-50 text-amber-700',
}

interface TreatmentCardProps {
  treatment: Treatment
  /** En la propia página del tratamiento no se enlaza a sí misma. */
  linkToLanding?: boolean
}

export const TreatmentCard = ({ treatment: raw, linkToLanding = true }: TreatmentCardProps) => {
  const lang = useLang()
  const treatment = localizeTreatment(raw, lang)
  const landing = linkToLanding ? landingForTreatment(raw) : undefined
  const href = landing ? landingPath(landing, lang) : undefined
  const images = treatment.image_urls?.length ? treatment.image_urls : treatment.image_url ? [treatment.image_url] : []

  return (
    <article className="bg-white rounded-2xl border border-neutral-100 hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden">
      {images.length > 0 && <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto">{images.map((src) => <img key={src} src={src} alt={treatment.name} loading="lazy" className="h-48 w-full shrink-0 snap-start object-cover sm:w-[calc(50%-0.125rem)]" />)}</div>}
      <div className="flex flex-1 flex-col p-6">
      {/* Badge de categoría */}
      <span className={cn(
        'self-start text-sm font-medium px-4 py-1.5 rounded-[15px] mb-4',
        CATEGORY_COLORS[treatment.category]
      )}>
        {CATEGORY_LABELS[treatment.category][lang]}
      </span>

      <h3 className="text-xl font-medium text-neutral-800 mb-2">
        {href ? (
          <Link to={href} className="hover:text-gold-500 transition-colors">{treatment.name}</Link>
        ) : (
          treatment.name
        )}
      </h3>

      {treatment.description && <div className="mb-4 flex-1">
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-500">{treatment.description.length > 220 ? `${treatment.description.slice(0, 220).trimEnd()}…` : treatment.description}</p>
        {treatment.description.length > 220 && <details className="mt-2"><summary className="cursor-pointer text-sm font-medium text-gold-600">{READ_MORE[lang]}</summary><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-500">{treatment.description}</p></details>}
      </div>}

      {treatment.variants?.some((variant) => variant.is_active) && <ul className="mb-4 space-y-1 border-t border-neutral-100 pt-3 text-sm">{treatment.variants.filter((variant) => variant.is_active).map((variant) => <li key={variant.id} className="flex justify-between gap-3 text-neutral-600"><span>{variant.name} · {variant.duration_min} {MINUTES[lang]}</span><strong className="shrink-0 text-neutral-800">{variant.price_eur.toLocaleString(LOCALES[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</strong></li>)}</ul>}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-50 mt-auto">
        <div className="flex items-center gap-1.5 text-neutral-400 text-base">
          <Clock className="w-4 h-4" />
          <span>{treatment.duration_min} {MINUTES[lang]}</span>
        </div>

        <div className="flex items-center gap-3">
          {treatment.price_eur && (
            <span className="text-neutral-800 font-medium text-base">
              {treatment.price_eur.toLocaleString(LOCALES[lang], {
                style: 'currency',
                currency: 'EUR',
                currencyDisplay: 'narrowSymbol',
                maximumFractionDigits: 0,
              })}
            </span>
          )}
          {href && (
            <Link
              to={href}
              className="text-gold-400 hover:text-gold-600 transition-colors"
              aria-label={treatment.name}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
      </div>
    </article>
  )
}
