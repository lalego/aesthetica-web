import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTreatments } from '@/hooks/useTreatments'
import type { TreatmentCategory } from '@/types'
import { cn } from '@/lib/utils'
import { PATHS, useLang } from '@/i18n'
import { TreatmentCard } from '@/components/TreatmentCard'
import { CATEGORY_LABELS, FEATURED_TREATMENTS } from '@/content/pages'

type FilterOption = TreatmentCategory | 'todos'

const FILTERS: FilterOption[] = ['todos', 'facial', 'corporal', 'laser', 'capilar', 'bienestar']

const COPY = {
  es: {
    title: ['Nuestros', 'tratamientos'],
    intro: 'Protocolos personalizados diseñados para resultados naturales y duraderos.',
    all: 'Todos',
    error: 'No se pudieron cargar los tratamientos. Inténtalo más tarde.',
    empty: 'No hay tratamientos en esta categoría todavía.',
    seeAll: 'Ver todos los tratamientos',
  },
  en: {
    title: ['Our', 'treatments'],
    intro: 'Personalised protocols designed for natural, long-lasting results.',
    all: 'All',
    error: 'Treatments could not be loaded. Please try again later.',
    empty: 'There are no treatments in this category yet.',
    seeAll: 'See all treatments',
  },
  uk: {
    title: ['Наші', 'процедури'],
    intro: 'Індивідуальні протоколи для природного та тривалого результату.',
    all: 'Усі',
    error: 'Не вдалося завантажити процедури. Спробуйте пізніше.',
    empty: 'У цій категорії поки немає процедур.',
    seeAll: 'Усі процедури',
  },
}

interface TreatmentsSectionProps {
  /** Portada: solo los destacados (FEATURED_TREATMENTS), sin filtros y con enlace al catálogo completo. */
  featured?: boolean
}

export const TreatmentsSection = ({ featured = false }: TreatmentsSectionProps) => {
  const lang = useLang()
  const t = COPY[lang]
  const [active, setActive] = useState<FilterOption>('todos')
  const { data: treatments = [], isLoading, isError } = useTreatments()

  const filtered = featured
    ? FEATURED_TREATMENTS.flatMap((id) => treatments.filter((tr) => tr.id === id))
    : active === 'todos'
      ? treatments
      : treatments.filter((tr) => tr.category === active)

  return (
    <section id="tratamientos" className="bg-cream-100 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t.title[0]} <span className="font-serif italic text-gold-500">{t.title[1]}</span>
          </h2>
          <p className="text-neutral-700 max-w-xl mx-auto">{t.intro}</p>
        </div>

        {/* Filtros de categoría (no en la portada) */}
        {!featured && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map((value) => (
            <button
              key={value}
              onClick={() => setActive(value)}
              className={cn(
                'px-7 py-3 rounded-full text-base transition-all duration-200',
                active === value
                  ? 'bg-gold-400 text-white shadow-sm'
                  : 'bg-white text-neutral-700 border border-cream-300 hover:border-gold-400 hover:text-gold-600'
              )}
            >
              {value === 'todos' ? t.all : CATEGORY_LABELS[value][lang]}
            </button>
          ))}
        </div>
        )}

        {/* Estados de carga / error */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-cream-200 animate-pulse space-y-3">
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-6 bg-neutral-100 rounded w-2/3" />
                <div className="h-16 bg-neutral-100 rounded" />
                <div className="h-4 bg-neutral-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-neutral-600 py-12">{t.error}</p>
        )}

        {/* Grid de tarjetas */}
        {!isLoading && !isError && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="text-center text-neutral-500 py-12">{t.empty}</p>
        )}

        {featured && (
          <div className="text-center mt-12">
            <Link
              to={PATHS.treatments[lang]}
              className="inline-flex items-center gap-2 bg-espresso-900 text-gold-200 px-8 py-3.5 rounded-full hover:bg-espresso-800 transition-colors group"
            >
              {t.seeAll}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
