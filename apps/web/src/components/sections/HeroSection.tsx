import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PATHS, useLang } from '@/i18n'

interface HeroSectionProps {
  onBookingClick?: () => void
}

const HERO = {
  es: {
    // El H1 es la etiqueta pequeña: lleva las palabras clave sin cambiar el diseño.
    h1: 'Estudio de Estética Avanzada en Ruzafa, València',
    slogan: ['Realza tu', 'belleza natural', 'con confianza'],
    text: 'Tratamientos personalizados con tecnología de vanguardia y una especialista dedicada a tu bienestar y resultados naturales.',
    book: 'Agendar cita',
    see: 'Ver tratamientos',
    stats: [
      { value: '+25', label: 'Años de experiencia' },
      { value: '+1.200', label: 'Clientes satisfechos' },
      { value: '31', label: 'Tratamientos' },
    ],
    imgAlt: 'Estudio AestheticA en la calle Centelles, Ruzafa, València',
    badge: ['Próxima disponibilidad', 'Esta semana · Ruzafa'],
  },
  en: {
    h1: 'Advanced Aesthetics Studio in Ruzafa, Valencia',
    slogan: ['Enhance your', 'natural beauty', 'with confidence'],
    text: 'Personalised treatments with cutting-edge technology and a specialist devoted to your wellbeing and natural-looking results.',
    book: 'Book now',
    see: 'See treatments',
    stats: [
      { value: '25+', label: 'Years of experience' },
      { value: '1,200+', label: 'Happy clients' },
      { value: '31', label: 'Treatments' },
    ],
    imgAlt: 'AestheticA studio on Carrer de Centelles, Ruzafa, Valencia',
    badge: ['Next availability', 'This week · Ruzafa'],
  },
}

export const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  const lang = useLang()
  const t = HERO[lang]

  return (
    <section className="relative bg-stone-50 min-h-screen flex items-start lg:items-center overflow-hidden">
      {/* Sutil degradado decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-50 via-stone-50 to-stone-100 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-52 pb-16 lg:py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="flex justify-center lg:justify-start">
            <h1 className="inline-block text-gold-500 font-medium tracking-widest text-xs uppercase border border-gold-200 bg-gold-50 px-4 py-1.5 rounded-full">
              {t.h1}
            </h1>
          </div>

          <p className="text-4xl lg:text-6xl font-light text-neutral-800 leading-tight">
            {t.slogan[0]}{' '}
            <span className="font-serif italic text-gold-400">{t.slogan[1]}</span>
            <br />{t.slogan[2]}
          </p>

          <p className="text-lg text-neutral-500 leading-relaxed max-w-md">{t.text}</p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onBookingClick}
              className="bg-gold-400 text-white px-8 py-3.5 rounded-full hover:bg-gold-500 transition-all duration-300 flex items-center gap-2 group shadow-md shadow-gold-200"
            >
              {t.book}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to={PATHS.treatments[lang]}
              className="border border-neutral-300 text-neutral-600 px-8 py-3.5 rounded-full hover:border-gold-300 hover:text-gold-500 transition-colors"
            >
              {t.see}
            </Link>
          </div>

          {/* Sellos de confianza */}
          <div className="flex items-center gap-6 pt-4 border-t border-neutral-200">
            {t.stats.map(({ value, label }, i) => (
              <div key={label} className="contents">
                {i > 0 && <div className="w-px h-8 bg-neutral-200" />}
                <div className="text-center">
                  <p className="text-2xl font-light text-neutral-800">{value}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen hero: es el LCP, así que se carga con prioridad y sin lazy */}
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/img/hero-clinic-1200.webp"
              srcSet="/img/hero-clinic-700.webp 700w, /img/hero-clinic-1200.webp 1200w"
              sizes="(min-width: 1024px) 540px, 100vw"
              width={1200}
              height={881}
              alt={t.imgAlt}
              {...{ fetchpriority: 'high' }}
              className="w-full h-full object-cover"
            />
            {/* Overlay dorado sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-gold-900/20 to-transparent" />
          </div>

          {/* Badge flotante */}
          <div className="absolute -bottom-5 -left-5 bg-white px-6 py-4 rounded-2xl shadow-xl border border-neutral-100">
            <p className="text-xs text-neutral-400 mb-0.5">{t.badge[0]}</p>
            <p className="text-sm font-medium text-neutral-800">{t.badge[1]}</p>
          </div>

          {/* Decoración circular */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gold-100 opacity-60 blur-xl pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
