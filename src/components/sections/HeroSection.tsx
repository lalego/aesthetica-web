import { ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  onBookingClick?: () => void
}

export const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  return (
    <section className="relative bg-stone-50 min-h-screen flex items-center overflow-hidden">
      {/* Sutil degradado decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-50 via-stone-50 to-stone-100 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <span className="inline-block text-gold-500 font-medium tracking-widest text-xs uppercase border border-gold-200 bg-gold-50 px-4 py-1.5 rounded-full">
            Centro de Estética Avanzada · Ruzafa, València
          </span>

          <h1 className="text-4xl lg:text-6xl font-light text-neutral-800 leading-tight">
            Realza tu{' '}
            <span className="font-serif italic text-gold-400">belleza natural</span>
            <br />con confianza
          </h1>

          <p className="text-lg text-neutral-500 leading-relaxed max-w-md">
            Tratamientos personalizados con tecnología de vanguardia y un equipo
            comprometido con tu bienestar y resultados naturales.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onBookingClick}
              className="bg-gold-400 text-white px-8 py-3.5 rounded-full hover:bg-gold-500 transition-all duration-300 flex items-center gap-2 group shadow-md shadow-gold-200"
            >
              Agendar consulta
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('tratamientos')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-neutral-300 text-neutral-600 px-8 py-3.5 rounded-full hover:border-gold-300 hover:text-gold-500 transition-colors"
            >
              Ver tratamientos
            </button>
          </div>

          {/* Sellos de confianza */}
          <div className="flex items-center gap-6 pt-4 border-t border-neutral-200">
            <div className="text-center">
              <p className="text-2xl font-light text-neutral-800">+5</p>
              <p className="text-xs text-neutral-400 mt-0.5">Años de experiencia</p>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <p className="text-2xl font-light text-neutral-800">+1.200</p>
              <p className="text-xs text-neutral-400 mt-0.5">Pacientes satisfechos</p>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <p className="text-2xl font-light text-neutral-800">31</p>
              <p className="text-xs text-neutral-400 mt-0.5">Tratamientos</p>
            </div>
          </div>
        </div>

        {/* Imagen hero */}
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/hero-clinic.jpeg"
              alt="Clínica AestheticA — C/ dels Centelles, Ruzafa, València"
              className="w-full h-full object-cover"
            />
            {/* Overlay dorado sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-gold-900/20 to-transparent" />
          </div>

          {/* Badge flotante */}
          <div className="absolute -bottom-5 -left-5 bg-white px-6 py-4 rounded-2xl shadow-xl border border-neutral-100">
            <p className="text-xs text-neutral-400 mb-0.5">Próxima disponibilidad</p>
            <p className="text-sm font-medium text-neutral-800">Esta semana · Ruzafa</p>
          </div>

          {/* Decoración circular */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gold-100 opacity-60 blur-xl pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
