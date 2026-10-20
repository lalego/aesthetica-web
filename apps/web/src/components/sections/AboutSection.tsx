import { Sparkles, UserCheck, BadgeCheck } from 'lucide-react'
import { useLang } from '@/i18n'
import { statsFor } from '@/content/pages'

const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'gb', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'ua', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
]

// ─────────────────────────────────────────────────────────────────
//  EDITA AQUÍ — todo el contenido de la sección en un solo lugar
// ─────────────────────────────────────────────────────────────────
const ABOUT = {
  es: {
    title: ['Quiénes', 'somos'],
    intro: [
      'AestheticA nació de la pasión y la visión de Alena Martseniuk, su fundadora. Un estudio con alma propia, donde cada tratamiento se diseña de forma personalizada para potenciar tu belleza natural con seguridad y rigor.',
      'Con tecnología de vanguardia y un trato cercano y honesto, Alena acompaña a cada cliente en su proceso, desde la primera consulta hasta el resultado final.',
    ],
    imgAlt: 'Alena Martseniuk durante un tratamiento láser en el estudio AestheticA',
    stats: statsFor('es', ['Años de experiencia', 'Clientes satisfechos', 'Tratamientos disponibles']),
    valuesTitle: 'Nuestra filosofía',
    values: [
      {
        icon: Sparkles,
        title: 'Tecnología de vanguardia',
        description:
          'Equipos de última generación y protocolos actualizados para ofrecerte resultados reales y duraderos.',
      },
      {
        icon: UserCheck,
        title: 'Atención completamente personalizada',
        description:
          'Tu piel, tu historia, tus objetivos. Cada visita comienza con una valoración para adaptar cada paso a ti.',
      },
      {
        icon: BadgeCheck,
        title: 'Productos y equipos de referencia profesional',
        description:
          'Solo trabajamos con marcas y dispositivos certificados, garantizando tu seguridad y la eficacia de cada sesión.',
      },
    ],
    teamTitle: 'Tu especialista',
    team: [
      {
        name: 'Alena Martseniuk',
        role: 'Fundadora · Especialista en Estética Avanzada',
        bio: 'Alena es la fundadora y alma del Estudio AestheticA. Con una profunda formación en estética avanzada y una visión centrada en resultados naturales, ha creado un espacio donde la confianza y el bienestar de cada cliente son la prioridad.',
        avatar: '/img/alena_bio-400.webp',
        languages: LANGUAGES,
      },
    ],
  },
  en: {
    title: ['About', 'us'],
    intro: [
      'AestheticA was born from the passion and vision of its founder, Alena Martseniuk. A studio with its own soul, where every treatment is tailored to enhance your natural beauty safely and rigorously.',
      'With cutting-edge technology and a warm, honest approach, Alena guides every client through the process, from the first consultation to the final result.',
    ],
    imgAlt: 'Alena Martseniuk performing a laser treatment at the AestheticA studio',
    stats: statsFor('en', ['Years of experience', 'Happy clients', 'Treatments available']),
    valuesTitle: 'Our philosophy',
    values: [
      {
        icon: Sparkles,
        title: 'Cutting-edge technology',
        description:
          'Latest-generation equipment and up-to-date protocols for real, long-lasting results.',
      },
      {
        icon: UserCheck,
        title: 'Fully personalised care',
        description:
          'Your skin, your story, your goals. Every visit starts with an assessment so each step is adapted to you.',
      },
      {
        icon: BadgeCheck,
        title: 'Professional-grade products and devices',
        description:
          'We only work with certified brands and devices, ensuring your safety and the effectiveness of every session.',
      },
    ],
    teamTitle: 'Your specialist',
    team: [
      {
        name: 'Alena Martseniuk',
        role: 'Founder · Advanced Aesthetics Specialist',
        bio: 'Alena is the founder and heart of Estudio AestheticA. With extensive training in advanced aesthetics and a focus on natural-looking results, she has created a space where every client’s trust and wellbeing come first.',
        avatar: '/img/alena_bio-400.webp',
        languages: LANGUAGES,
      },
    ],
  },
}
// ─────────────────────────────────────────────────────────────────

export const AboutSection = () => {
  const c = ABOUT[useLang()]

  return (
    <section id="nosotros" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 space-y-20">

        {/* Intro */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-light text-neutral-800">
              <span className="font-serif italic text-gold-400">{c.title[0]}</span> {c.title[1]}
            </h2>
            {c.intro.map((p, i) => (
              <p key={i} className="text-neutral-600 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/img/alena_laser-900.webp"
              alt={c.imgAlt}
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 border-y border-neutral-100 py-12">
          {c.stats.map(({ value, label }) => (
            <div key={label} className="text-center space-y-1">
              <p className="text-4xl font-light text-neutral-900">{value}</p>
              <p className="text-sm text-neutral-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Valores */}
        <div className="space-y-8">
          <h3 className="text-3xl font-light text-neutral-800 text-center">
            {c.valuesTitle}
          </h3>
          <div className="grid sm:grid-cols-3 gap-8">
            {c.values.map(({ icon: Icon, title, description }) => (
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
        {c.team.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-3xl font-light text-neutral-800 text-center">
              {c.teamTitle}
            </h3>
            <div className="flex flex-wrap justify-center gap-8">
              {c.team.map(({ name, role, bio, avatar, languages }) => (
                <div
                  key={name}
                  className="flex flex-col items-center text-center max-w-lg space-y-5"
                >
                  <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-gold-100 shadow-lg">
                    <img
                      src={avatar}
                      alt={name}
                      width={400}
                      height={533}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                    />
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
                            alt=""
                            width={20}
                            height={15}
                            loading="lazy"
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
