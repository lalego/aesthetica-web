import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CLINIC } from '@/config/clinic'

export const Privacidad = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-600 mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-light text-neutral-800 mb-2">PolÃ­tica de Privacidad</h1>
        <p className="text-sm text-neutral-400 mb-10">Ãšltima actualizaciÃ³n: junio 2025</p>

        <div className="space-y-8 text-neutral-600 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">1. Responsable del tratamiento</h2>
            <ul className="space-y-1 pl-4 list-disc">
              <li><strong>Responsable:</strong> Alena Martseniuk (ClÃ­nica AestheticA)</li>
              <li><strong>Domicilio:</strong> {CLINIC.address.full}</li>
              <li><strong>Contacto:</strong> <a href={`mailto:${CLINIC.contact.email}`} className="text-gold-500 hover:underline">{CLINIC.contact.email}</a></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">2. Datos que recogemos y finalidad</h2>
            <p>Recogemos Ãºnicamente los datos que tÃº nos facilitas voluntariamente a travÃ©s del formulario de cita:</p>
            <ul className="space-y-1 pl-4 list-disc">
              <li><strong>Nombre y apellidos</strong> â€” para identificarte y personalizar la atenciÃ³n.</li>
              <li><strong>TelÃ©fono y correo electrÃ³nico</strong> â€” para confirmar y gestionar tu cita.</li>
              <li><strong>Tratamiento de interÃ©s y mensaje</strong> â€” para preparar la consulta.</li>
            </ul>
            <p>Estos datos pueden incluir informaciÃ³n relacionada con tu salud (categorÃ­a especial segÃºn el art. 9 del RGPD), que tratamos exclusivamente con tu consentimiento expreso para la prestaciÃ³n del servicio solicitado.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">3. Base legal del tratamiento</h2>
            <ul className="space-y-1 pl-4 list-disc">
              <li><strong>Consentimiento expreso</strong> (art. 6.1.a y art. 9.2.a RGPD) â€” marcado de la casilla en el formulario.</li>
              <li><strong>EjecuciÃ³n de un contrato</strong> (art. 6.1.b RGPD) â€” gestiÃ³n de la relaciÃ³n profesional.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">4. Plazo de conservaciÃ³n</h2>
            <p>Conservamos tus datos mientras dure la relaciÃ³n con la clÃ­nica y durante los plazos legalmente exigidos (normativa fiscal y sanitaria). Transcurrido ese plazo, los eliminaremos de forma segura.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">5. CesiÃ³n de datos</h2>
            <p>No cedemos tus datos a terceros, salvo obligaciÃ³n legal. Utilizamos <strong>Supabase</strong> como plataforma de almacenamiento seguro, con servidores en la UniÃ³n Europea y garantÃ­as de cumplimiento del RGPD.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-neutral-800">6. Tus derechos</h2>
            <p>Puedes ejercer en cualquier momento los siguientes derechos enviando un correo a <a href={`mailto:${CLINIC.contact.email}`} className="text-gold-500 hover:underline">{CLINIC.contact.email}</a>:</p>
            <ul className="space-y-1 pl-4 list-disc">
              <li><strong>Acceso</strong> â€” conocer quÃ© datos tenemos sobre ti.</li>
              <li><strong>RectificaciÃ³n</strong> â€” corregir datos inexactos.</li>
              <li><strong>SupresiÃ³n</strong> â€” solicitar la eliminaciÃ³n de tus datos.</li>
              <li><strong>OposiciÃ³n y limitaciÃ³n</strong> â€” oponerte al tratamiento o limitarlo.</li>
              <li><strong>Portabilidad</strong> â€” recibir tus datos en formato estructurado.</li>
              <li><strong>Retirada del consentimiento</strong> â€” en cualquier momento, sin efecto retroactivo.</li>
            </ul>
            <p>Si consideras que tus derechos no han sido atendidos correctamente, puedes presentar una reclamaciÃ³n ante la <strong>Agencia EspaÃ±ola de ProtecciÃ³n de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">www.aepd.es</a>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}

