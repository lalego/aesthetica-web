import { useEffect } from 'react'
import { PageContext } from '@/i18n'
import { useTreatments } from '@/hooks/useTreatments'
import { headTags } from '@/seo/head'
import type { AppRoute } from '@/routes'

interface RouteShellProps {
  route: AppRoute
}

/** Al navegar en el cliente, sustituye las etiquetas del <head> de la página anterior. */
const HeadSync = ({ route }: RouteShellProps) => {
  const { data: treatments = [] } = useTreatments()
  useEffect(() => {
    const meta = route.meta(treatments)
    document.title = meta.title
    document.documentElement.lang = meta.lang
    document.head.querySelectorAll('[data-head]').forEach((el) => el.remove())
    document.head.insertAdjacentHTML('beforeend', headTags(meta))
  }, [route, treatments])
  return null
}

/** Da a cada página su idioma (`usePage`) y su <head>. */
export const RouteShell = ({ route }: RouteShellProps) => (
  <PageContext.Provider value={{ lang: route.lang, alternates: route.alternates }}>
    <HeadSync route={route} />
    {route.element}
  </PageContext.Provider>
)
