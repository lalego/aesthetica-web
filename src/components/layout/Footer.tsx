import { Instagram, Facebook } from 'lucide-react'
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
          <div className="space-y-4">
            <img src="/aesthetica.png" alt="AestheticA" className="h-20 w-auto brightness-0 invert opacity-90" />
            <p className="text-sm leading-relaxed">
              Clínica de estética avanzada en {CLINIC.address.district}, {CLINIC.address.city}.
              Tratamientos personalizados con tecnología de vanguardia.
            </p>
            <div className="flex gap-3">
              <a href={CLINIC.contact.instagram_href} target="_blank" rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={CLINIC.contact.facebook_href} target="_blank" rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={CLINIC.contact.whatsapp_href} target="_blank" rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
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
