import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CLINIC } from '@/config/clinic'

export const PoliticaCookies = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-600 mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-light text-neutral-800 mb-2">Política de Cookies</h1>
        <p className="text-sm text-neutral-400 mb-10">Última actualización: junio 2025</p>

        <div className="space-y-8 text-neutral-600 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">1. ¿Qué son las cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus preferencias y mejore tu experiencia de navegación.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">2. Cookies que utilizamos</h2>
            <p>Este sitio web utiliza únicamente <strong>cookies técnicas estrictamente necesarias</strong> para su funcionamiento. No utilizamos cookies de analítica, publicidad ni rastreo de terceros.</p>

            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-neutral-700 font-medium">Cookie</th>
                    <th className="text-left px-4 py-3 text-neutral-700 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 text-neutral-700 font-medium">Finalidad</th>
                    <th className="text-left px-4 py-3 text-neutral-700 font-medium">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">session</td>
                    <td className="px-4 py-3">Técnica</td>
                    <td className="px-4 py-3">Mantener la sesión del usuario</td>
                    <td className="px-4 py-3">Sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">3. Google Maps</h2>
            <p>El mapa integrado en la sección de contacto utiliza el servicio Google Maps, que puede establecer sus propias cookies técnicas para mostrar el mapa correctamente. Puedes consultar la política de cookies de Google en <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">policies.google.com</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">4. Cómo gestionar las cookies</h2>
            <p>Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que deshabilitar las cookies técnicas puede afectar al funcionamiento del sitio.</p>
            <ul className="space-y-1 pl-4 list-disc">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">Safari</a></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">5. Contacto</h2>
            <p>Para cualquier consulta sobre nuestra política de cookies, puedes escribirnos a <a href={`mailto:${CLINIC.contact.email}`} className="text-gold-500 hover:underline">{CLINIC.contact.email}</a>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
