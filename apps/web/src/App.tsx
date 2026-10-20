import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ROUTES, NOT_FOUND_ROUTE } from '@/routes'
import { RouteShell } from '@/components/RouteShell'

/** Al cambiar de página, vuelve arriba (salvo enlaces con ancla, que gestiona la página). */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

/** Sin router: el cliente usa BrowserRouter (main.tsx) y el prerender StaticRouter (entry-server.tsx). */
function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {ROUTES.map((route) => (
          <Route key={route.path} path={route.path} element={<RouteShell route={route} />} />
        ))}
        <Route path="*" element={<RouteShell route={NOT_FOUND_ROUTE} />} />
      </Routes>
    </>
  )
}

export default App
