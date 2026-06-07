import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const ContactSection = () => {
  const clinicInfo = {
    direccion: "Av. Providencia 1234, Oficina 501, Providencia, Santiago",
    telefono: "+56 9 8765 4321",
    email: "hola@aesthetica.cl",
    horarios: "Lun - Vie: 9:00 a 19:00 | Sáb: 9:00 a 14:00"
  }

  return (
    <section id="contacto" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-light text-neutral-800 mb-4">
            Visítanos
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Estamos en el corazón de Providencia. Agenda tu evaluación sin costo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">Dirección</h3>
                <p className="text-neutral-600">{clinicInfo.direccion}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">Teléfono</h3>
                <p className="text-neutral-600">{clinicInfo.telefono}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Mail className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">Email</h3>
                <p className="text-neutral-600">{clinicInfo.email}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 mb-1">Horarios</h3>
                <p className="text-neutral-600">{clinicInfo.horarios}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden h- bg-neutral-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.345!2d-70.609!3d-33.425!2m3!1f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI1JzMwLjAiUyA3MMKwMzYnMzIuNCJX!5e0!3m2!1ses!2scl!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Clínica Aesthetica"
            />
          </div>
        </div>
      </div>
    </section>
  )
}