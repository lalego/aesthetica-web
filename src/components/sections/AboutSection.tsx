import { Microscope, Heart, ShieldCheck } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────
//  EDITA AQUÍ — todo el contenido de la sección en un solo lugar
// ─────────────────────────────────────────────────────────────────
const ABOUT = {
  headline: 'Medicina estética con propósito',
  intro: [
    'AestheticA nació de la pasión y la visión de Alena Martseniuk, su fundadora. Una clínica con alma propia, donde cada tratamiento se diseña de forma personalizada para potenciar tu belleza natural con seguridad y rigor.',
    'Con tecnología de vanguardia y un trato cercano y honesto, Alena acompaña a cada paciente en su proceso, desde la primera consulta hasta el resultado final.',
  ],
  stats: [
    { value: '+25', label: 'Años de experiencia' },
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
      name: 'Alena Martseniuk',
      role: 'Fundadora · Especialista en Estética Avanzada',
      bio: 'Alena es la fundadora y alma de Clínica AestheticA. Con una profunda formación en estética avanzada y una visión centrada en resultados naturales, ha creado un espacio donde la confianza y el bienestar de cada paciente son la prioridad.',
      avatar: '/alena_bio.jpeg',
      languages: [
        { code: 'es', label: 'Español' },
        { code: 'gb', label: 'English' },
        { code: 'it', label: 'Italiano' },
        { code: 'ua', label: 'Українська' },
        { code: 'ru', label: 'Русский' },
      ],
    },
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

          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            <img src="/alena_laser.jpeg" alt="Alena Martseniuk — Clínica AestheticA" className="w-full h-full object-cover object-top" />
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
            <h3 className="text-3xl font-light text-neutral-800 text-center">
              Tu especialista
            </h3>
            <div className="flex flex-wrap justify-center gap-8">
              {ABOUT.team.map(({ name, role, bio, avatar, languages }) => (
                <div
                  key={name}
                  className="flex flex-col items-center text-center max-w-lg space-y-5"
                >
                  <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-gold-100 shadow-lg">
                    <img src={avatar} alt={name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-neutral-800">{name}</p>
                    <p className="text-base text-gold-400 mt-1">{role}</p>
                  </div>
                  <p className="text-base text-neutral-500 leading-relaxed">{bio}</p>
                  {languages && (
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      {languages.map(({ code, label }) => (
                        <span key={code} className="inline-flex items-center gap-1.5 text-sm bg-neutral-50 border border-neutral-100 text-neutral-500 px-3 py-1.5 rounded-full">
                          <img
                            src={`https://flagcdn.com/20x15/${code}.png`}
                            alt={label}
                            className="w-4 h-auto rounded-sm"
                          />
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
