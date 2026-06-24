import { useState } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { useTreatments } from '@/hooks/useTreatments'
import type { TreatmentCategory } from '@/types'
import { cn } from '@/lib/utils'

type FilterOption = TreatmentCategory | 'todos'

const FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'Todos',      value: 'todos' },
  { label: 'Facial',     value: 'facial' },
  { label: 'Corporal',   value: 'corporal' },
  { label: 'Bienestar',  value: 'bienestar' },
  { label: 'Capilar',    value: 'capilar' },
]

const CATEGORY_COLORS: Record<TreatmentCategory, string> = {
  facial:    'bg-rose-100 text-rose-600',
  corporal:  'bg-neutral-100 text-neutral-600',
  bienestar: 'bg-amber-50 text-amber-600',
  capilar:   'bg-teal-50 text-teal-600',
}

export const TreatmentsSection = () => {
  const [active, setActive] = useState<FilterOption>('todos')
  const { data: treatments = [], isLoading, isError } = useTreatments()

  const filtered = active === 'todos'
    ? treatments
    : treatments.filter((t) => t.category === active)

  return (
    <section id="tratamientos" className="bg-neutral-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-light text-neutral-800 mb-4">
            Nuestros <span className="font-serif italic text-rose-500">tratamientos</span>
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Protocolos personalizados diseñados por nuestro equipo médico para resultados
            naturales y duraderos.
          </p>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActive(value)}
              className={cn(
                'px-5 py-2 rounded-full text-sm transition-all duration-200',
                active === value
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Estados de carga / error */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse space-y-3">
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-6 bg-neutral-100 rounded w-2/3" />
                <div className="h-16 bg-neutral-100 rounded" />
                <div className="h-4 bg-neutral-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-neutral-500 py-12">
            No se pudieron cargar los tratamientos. Inténtalo más tarde.
          </p>
        )}

        {/* Grid de tarjetas */}
        {!isLoading && !isError && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((treatment) => (
              <article
                key={treatment.id}
                className="bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                {/* Badge de categoría */}
                <span className={cn(
                  'self-start text-xs font-medium px-3 py-1 rounded-full capitalize mb-4',
                  CATEGORY_COLORS[treatment.category]
                )}>
                  {treatment.category}
                </span>

                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  {treatment.name}
                </h3>

                {treatment.description && (
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-4">
                    {treatment.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{treatment.duration_min} min</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {treatment.price_eur && (
                      <span className="text-neutral-800 font-medium">
                        {treatment.price_eur.toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    )}
                    <button
                      onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-rose-400 hover:text-rose-600 transition-colors"
                      aria-label={`Agendar ${treatment.name}`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="text-center text-neutral-400 py-12">
            No hay tratamientos en esta categoría todavía.
          </p>
        )}
      </div>
    </section>
  )
}
