import { CLINIC } from '@/config/clinic'

const LEGAL_LINKS = [
  { label: 'Aviso legal', href: '#aviso-legal' },
  { label: 'Política de privacidad', href: '#privacidad' },
  { label: 'Política de cookies', href: '#cookies' },
]

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Marca */}
          <div className="space-y-3">
            <img src="/aesthetica.png" alt="AestheticA" className="h-10 w-auto brightness-0 invert opacity-90" />
            <p className="text-sm leading-relaxed">
              Clínica de medicina estética en {CLINIC.address.city}. Tratamientos
              personalizados con tecnología de vanguardia y un equipo médico especializado.
            </p>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <p className="text-white text-sm font-medium uppercase tracking-wide">Contacto</p>
            <address className="not-italic text-sm space-y-1">
              <p>{CLINIC.address.street}</p>
              <p>{CLINIC.address.district}, {CLINIC.address.zip} {CLINIC.address.city}</p>
              <p>
                <a href={CLINIC.contact.phone_href} className="hover:text-white transition-colors">
                  {CLINIC.contact.phone}
                </a>
              </p>
              {CLINIC.contact.email && (
                <p>
                  <a href={`mailto:${CLINIC.contact.email}`} className="hover:text-white transition-colors">
                    {CLINIC.contact.email}
                  </a>
                </p>
              )}
              {CLINIC.hours.map(({ days, time }: { days: string; time: string }) => (
                <p key={days}>{days}: {time}</p>
              ))}
            </address>
          </div>

          {/* RGPD */}
          <div className="space-y-3">
            <p className="text-white text-sm font-medium uppercase tracking-wide">Información legal</p>
            <p className="text-sm leading-relaxed">
              De conformidad con el{' '}
              <abbr title="Reglamento General de Protección de Datos">RGPD</abbr> (UE)
              2016/679 y la LOPDGDD, tus datos son tratados por {CLINIC.legal_name}{' '}
              ({CLINIC.cif}) únicamente para gestionar tu cita y enviarte información
              sobre nuestros servicios, con tu consentimiento expreso.
            </p>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © {year} {CLINIC.legal_name}. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap gap-4">
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="text-xs hover:text-white transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
