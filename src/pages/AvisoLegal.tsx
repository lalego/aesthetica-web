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
        <p className="text-sm text-neutral-400 mb-10">Ãšltima actualizaciÃ³n: junio 2025</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">1. Titular del sitio web</h2>
            <p>En cumplimiento del artÃ­culo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la InformaciÃ³n y de Comercio ElectrÃ³nico (LSSI-CE), se informa de los siguientes datos del titular:</p>
            <ul className="space-y-1 pl-4 list-disc">
              <li><strong>Titular:</strong> Alena Martseniuk</li>
              <li><strong>Nombre comercial:</strong> ClÃ­nica AestheticA</li>
              <li><strong>Domicilio:</strong> {CLINIC.address.full}</li>
              <li><strong>TelÃ©fono:</strong> {CLINIC.contact.phone}</li>
              <li><strong>Correo electrÃ³nico:</strong> <a href={`mailto:${CLINIC.contact.email}`} className="text-gold-500 hover:underline">{CLINIC.contact.email}</a></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">2. Objeto y Ã¡mbito de aplicaciÃ³n</h2>
            <p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>aesthetica-web.pages.dev</strong> (en adelante, "el Sitio Web"), titularidad de Alena Martseniuk, que ofrece informaciÃ³n sobre los servicios de estÃ©tica avanzada de ClÃ­nica AestheticA.</p>
            <p>El acceso al Sitio Web implica la aceptaciÃ³n plena y sin reservas de las presentes condiciones.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">3. Propiedad intelectual e industrial</h2>
            <p>Todos los contenidos del Sitio Web (textos, imÃ¡genes, logotipos, diseÃ±o grÃ¡fico y cÃ³digo fuente) son propiedad de Alena Martseniuk o de terceros que han autorizado su uso. Queda prohibida su reproducciÃ³n, distribuciÃ³n o comunicaciÃ³n pÃºblica sin autorizaciÃ³n expresa.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">4. ExclusiÃ³n de responsabilidad</h2>
            <p>La informaciÃ³n publicada en este Sitio Web tiene carÃ¡cter orientativo. ClÃ­nica AestheticA no se responsabiliza de los daÃ±os derivados del uso del Sitio Web, ni de posibles errores en los contenidos. Los resultados de los tratamientos pueden variar segÃºn cada persona.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">5. LegislaciÃ³n aplicable</h2>
            <p>El presente Aviso Legal se rige por la legislaciÃ³n espaÃ±ola. Para cualquier controversia derivada del uso del Sitio Web, las partes se someten a la jurisdicciÃ³n de los Juzgados y Tribunales de Valencia.</p>
          </section>

        </div>
      </div>
    </div>
  )
}

