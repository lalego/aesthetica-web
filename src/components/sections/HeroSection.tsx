import { ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  onBookingClick?: () => void
}

export const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  return (
    <section className="relative bg-neutral-50 min-h- flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-rose-400 font-medium tracking-wide text-sm uppercase">
            Clínica Aesthetica
          </span>
          <h1 className="text-4xl lg:text-6xl font-light text-neutral-800 leading-tight">
            Realza tu <span className="font-serif italic text-rose-500">belleza natural</span>
            <br />con confianza
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-md">
            Tratamientos personalizados con tecnología de vanguardia y un equipo médico
            comprometido con tu bienestar y resultados naturales.
          </p>
          <div className="flex gap-4 pt-4">
            <button
              onClick={onBookingClick}
              className="bg-neutral-900 text-white px-8 py-3 rounded-full hover:bg-neutral-800 transition-all duration-300 flex items-center gap-2 group"
            >
              Agendar consulta
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border border-neutral-300 text-neutral-700 px-8 py-3 rounded-full hover:bg-neutral-100 transition-colors">
              Ver tratamientos
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-rose-100 to-neutral-100 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"
              alt="Clínica estética"
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
            <p className="text-3xl font-light text-neutral-900">+1200</p>
            <p className="text-sm text-neutral-500">Pacientes satisfechos</p>
          </div>
        </div>
      </div>
    </section>
  )
}