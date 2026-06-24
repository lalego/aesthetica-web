import { MapPin, Phone, Instagram, Clock } from 'lucide-react'
import { CLINIC } from '@/config/clinic'

export const ContactSection = () => {
  return (
    <section id="contacto" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-light text-neutral-800 mb-4">
            Visítanos
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Estamos en Ruzafa, València. Agenda tu evaluación sin compromiso.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 text-gold-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">Dirección</h3>
                <p className="text-neutral-600">
                  {CLINIC.address.street}<br />
                  {CLINIC.address.district}, {CLINIC.address.zip} {CLINIC.address.city}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone className="w-5 h-5 text-gold-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">Teléfono</h3>
                <a
                  href={CLINIC.contact.phone_href}
                  className="text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  {CLINIC.contact.phone}
                </a>
              </div>
            </div>

            {CLINIC.contact.instagram && (
              <div className="flex gap-4">
                <Instagram className="w-5 h-5 text-gold-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">Instagram</h3>
                  <a
                    href={CLINIC.contact.instagram_href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    @{CLINIC.contact.instagram}
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Clock className="w-5 h-5 text-gold-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">Horarios</h3>
                {CLINIC.hours.map(({ days, time }: { days: string; time: string }) => (
                  <p key={days} className="text-neutral-600 text-sm">
                    <span className="font-medium">{days}:</span> {time}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden h-80 lg:h-full bg-neutral-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3081.5!2d-0.3698608!3d39.4604317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd60498e46207ae1%3A0xc9ea27b0cef8f594!2sAestheticA!5e0!3m2!1ses!2ses!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación ${CLINIC.name} ${CLINIC.address.city}`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}