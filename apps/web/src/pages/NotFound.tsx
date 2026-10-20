import { Link } from 'react-router-dom'
import { PATHS } from '@/i18n'
import { PageLayout } from '@/components/layout/PageLayout'

// Se prerenderiza como 404.html: Cloudflare Pages lo sirve con estado 404
// para cualquier ruta que no exista.
export const NotFound = () => (
  <PageLayout>
    <section className="max-w-3xl mx-auto px-6 pt-56 md:pt-44 pb-24 text-center space-y-6">
      <h1 className="text-4xl font-normal text-neutral-900">Página no encontrada</h1>
      <p className="text-neutral-700">La página que buscas no existe o ha cambiado de dirección.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to={PATHS.home.es} className="bg-gold-400 text-white px-8 py-3.5 rounded-full hover:bg-gold-500 transition-colors">
          Ir al inicio
        </Link>
        <Link to={PATHS.treatments.es} className="border border-neutral-300 text-neutral-700 px-8 py-3.5 rounded-full hover:border-gold-300 hover:text-gold-500 transition-colors">
          Ver tratamientos
        </Link>
      </div>
    </section>
  </PageLayout>
)
