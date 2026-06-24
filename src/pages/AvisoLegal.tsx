import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CLINIC } from '@/config/clinic'

export const AvisoLegal = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-600 mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-light text-neutral-800 mb-2">Aviso Legal</h1>
        <p className="text-sm text-neutral-400 mb-10">Última actualización: junio 2025</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">1. Titular del sitio web</h2>
            <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos del titular:</p>
            <ul className="space-y-1 pl-4 list-disc">
              <li><strong>Titular:</strong> Alena Martseniuk</li>
              <li><strong>Nombre comercial:</strong> Centro AestheticA</li>
              <li><strong>Domicilio:</strong> {CLINIC.address.full}</li>
              <li><strong>Teléfono:</strong> {CLINIC.contact.phone}</li>
              <li><strong>Correo electrónico:</strong> <a href={`mailto:${CLINIC.contact.email}`} className="text-gold-500 hover:underline">{CLINIC.contact.email}</a></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">2. Objeto y ámbito de aplicación</h2>
            <p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>aesthetica-web.pages.dev</strong> (en adelante, "el Sitio Web"), titularidad de Alena Martseniuk, que ofrece información sobre los servicios de estética avanzada de Centro AestheticA.</p>
            <p>El acceso al Sitio Web implica la aceptación plena y sin reservas de las presentes condiciones.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">3. Propiedad intelectual e industrial</h2>
            <p>Todos los contenidos del Sitio Web (textos, imágenes, logotipos, diseño gráfico y código fuente) son propiedad de Alena Martseniuk o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución o comunicación pública sin autorización expresa.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">4. Exclusión de responsabilidad</h2>
            <p>La información publicada en este Sitio Web tiene carácter orientativo. Centro AestheticA no se responsabiliza de los daños derivados del uso del Sitio Web, ni de posibles errores en los contenidos. Los resultados de los tratamientos pueden variar según cada persona.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">5. Legislación aplicable</h2>
            <p>El presente Aviso Legal se rige por la legislación española. Para cualquier controversia derivada del uso del Sitio Web, las partes se someten a la jurisdicción de los Juzgados y Tribunales de Valencia.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
