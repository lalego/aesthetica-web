import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CLINIC } from '@/config/clinic'

const LEGAL_LINKS = [
  { label: 'Aviso legal', to: '/aviso-legal' },
  { label: 'Política de privacidad', to: '/privacidad' },
  { label: 'Política de cookies', to: '/politica-cookies' },
]

const NAV_LINKS = [
  { label: 'Tratamientos', href: '/#tratamientos' },
  { label: 'Quiénes somos', href: '/#nosotros' },
  { label: 'Agendar cita', href: '/#agendar' },
  { label: 'Contacto', href: '/#contacto' },
]

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1c1410] text-stone-400">
      <div className="h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Marca */}
          <div className="space-y-5">
            <img src="/aesthetica.png" alt="AestheticA" className="h-20 w-auto brightness-0 invert opacity-80" />
            <p className="text-base leading-relaxed">
              Centro de estética avanzada en {CLINIC.address.district}, {CLINIC.address.city}.
              Tratamientos personalizados con tecnología de vanguardia.
            </p>
            <div className="flex gap-2">
              <a
                href={CLINIC.contact.instagram_href}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={CLINIC.contact.facebook_href}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={CLINIC.contact.whatsapp_href}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-colors"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Contacto — centrado */}
          <div className="space-y-5 md:text-center">
            <p className="text-stone-100 text-base font-medium uppercase tracking-widest">Contacto</p>
            <address className="not-italic text-base space-y-3">
              <div className="flex items-start justify-center gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <a href={CLINIC.maps.href} target="_blank" rel="noopener noreferrer" className="hover:text-stone-100 transition-colors leading-relaxed text-left">
                  {CLINIC.address.street}<br />
                  {CLINIC.address.district}, {CLINIC.address.zip} {CLINIC.address.city}
                </a>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a href={CLINIC.contact.phone_href} className="hover:text-stone-100 transition-colors">
                  {CLINIC.contact.phone}
                </a>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a href={`mailto:${CLINIC.contact.email}`} className="hover:text-stone-100 transition-colors">
                  {CLINIC.contact.email}
                </a>
              </div>
              <div className="flex items-start justify-center gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <div className="space-y-0.5 text-left">
                  {CLINIC.hours.map(({ days, time }: { days: string; time: string }) => (
                    <p key={days}>
                      <span className="text-stone-300">{days}:</span> {time}
                    </p>
                  ))}
                </div>
              </div>
            </address>
          </div>

          {/* Navegación — alineada a la derecha */}
          <div className="space-y-5 md:text-right md:flex md:flex-col md:items-end">
            <p className="text-stone-100 text-base font-medium uppercase tracking-widest">Navegación</p>
            <ul className="text-base space-y-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="flex items-center gap-2 group hover:text-gold-400 transition-colors justify-end">
                    {label}
                    <span className="w-3 h-px bg-stone-600 group-hover:w-5 group-hover:bg-gold-400 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-500">
            © {year} Centro AestheticA. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap gap-5">
            {LEGAL_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-stone-500 hover:text-gold-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
