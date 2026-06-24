import { Microscope, Heart, ShieldCheck } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────
//  EDITA AQUÍ — todo el contenido de la sección en un solo lugar
// ─────────────────────────────────────────────────────────────────
const ABOUT = {
  headline: 'Medicina estética con propósito',
  intro: [
    'En AestheticA creemos que la belleza auténtica nace del bienestar interior. Nuestra clínica nació con una misión clara: ofrecer tratamientos médico-estéticos personalizados, seguros y con resultados naturales que potencien tu confianza.',
    'Contamos con un equipo de profesionales especializados y tecnología de vanguardia para acompañarte en cada etapa de tu proceso, siempre con transparencia y rigor clínico.',
  ],
  stats: [
    { value: '+5', label: 'Años de experiencia' },
    { value: '+800', label: 'Pacientes satisfechos' },
    { value: '15+', label: 'Tratamientos disponibles' },
  ],
  values: [
    {
      icon: Microscope,
      title: 'Rigor médico',
      description:
        'Todos nuestros tratamientos están respaldados por evidencia científica y aplicados por profesionales sanitarios cualificados.',
    },
    {
      icon: Heart,
      title: 'Trato cercano',
      description:
        'Cada paciente es único. Dedicamos el tiempo necesario para entender tus objetivos y diseñar un protocolo a tu medida.',
    },
    {
      icon: ShieldCheck,
      title: 'Seguridad ante todo',
      description:
        'Trabajamos exclusivamente con productos certificados y seguimos los más altos estándares de higiene y seguridad clínica.',
    },
  ],
  team: [
    {
      name: 'Dra. [Nombre Apellido]',
      role: 'Médica estética — Directora clínica',
      bio: 'Especialista en medicina estética con más de 8 años de experiencia. Formada en [Universidad/Centro]. Experta en tratamientos faciales y corporales mínimamente invasivos.',
      // avatar: '/team/doctora.webp',  // descomenta cuando tengas la foto
    },
    // Añade más especialistas aquí
  ],
}
// ─────────────────────────────────────────────────────────────────

export const AboutSection = () => {
  return (
    <section id="nosotros" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 space-y-20">

        {/* Intro */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-light text-neutral-800">
              <span className="font-serif italic text-gold-400">Quiénes</span> somos
            </h2>
            {ABOUT.intro.map((p, i) => (
              <p key={i} className="text-neutral-600 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Imagen placeholder — reemplaza src cuando tengas foto */}
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-gold-50 to-neutral-100 overflow-hidden flex items-center justify-center">
            <p className="text-neutral-300 text-sm">Foto de clínica / equipo</p>
            {/* <img src="/about-clinic.webp" alt="Clínica AestheticA" className="w-full h-full object-cover" /> */}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 border-y border-neutral-100 py-12">
          {ABOUT.stats.map(({ value, label }) => (
            <div key={label} className="text-center space-y-1">
              <p className="text-4xl font-light text-neutral-900">{value}</p>
              <p className="text-sm text-neutral-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Valores */}
        <div className="space-y-8">
          <h3 className="text-2xl font-light text-neutral-800 text-center">
            Nuestra filosofía
          </h3>
          <div className="grid sm:grid-cols-3 gap-8">
            {ABOUT.values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <h4 className="font-medium text-neutral-800">{title}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Equipo */}
        {ABOUT.team.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-light text-neutral-800 text-center">
              Nuestro equipo
            </h3>
            <div className="flex flex-wrap justify-center gap-8">
              {ABOUT.team.map(({ name, role, bio }) => (
                <div
                  key={name}
                  className="flex flex-col items-center text-center max-w-xs space-y-4"
                >
                  {/* Avatar placeholder */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gold-100 to-neutral-100 flex items-center justify-center text-neutral-300 text-xs">
                    Foto
                    {/* <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" /> */}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{name}</p>
                    <p className="text-xs text-gold-400 mt-0.5">{role}</p>
                  </div>
                  <p className="text-sm text-neutral-500 leading-relaxed">{bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
