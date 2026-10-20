import { Link } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import type { Treatment, TreatmentCategory } from '@/types'
import { cn } from '@/lib/utils'
import { useLang } from '@/i18n'
import { localizeTreatment } from '@/content/treatments-en'
import { landingForTreatment, landingPath } from '@/content/landings'
import { CATEGORY_LABELS } from '@/content/pages'

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

  return (
    <article className="bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
      {/* Badge de categoría */}
      <span className={cn(
        'self-start text-sm font-medium px-4 py-1.5 rounded-full mb-4',
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

      {treatment.description && (
        <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-4">
          {treatment.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-50 mt-auto">
        <div className="flex items-center gap-1.5 text-neutral-400 text-base">
          <Clock className="w-4 h-4" />
          <span>{treatment.duration_min} min</span>
        </div>

        <div className="flex items-center gap-3">
          {treatment.price_eur && (
            <span className="text-neutral-800 font-medium text-base">
              {treatment.price_eur.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', {
                style: 'currency',
                currency: 'EUR',
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
    </article>
  )
}
