import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/queryClient'

const queryClient: QueryClient = createQueryClient()

const app = (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Tratamientos con los que se generó el HTML, para que la hidratación coincida.
          Como son del build, React Query los da por caducados y los vuelve a pedir. */}
      <Hydrate state={window.__RQ_STATE__}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Hydrate>
    </QueryClientProvider>
  </React.StrictMode>
)

const root = document.getElementById('root')!

// En producción cada página viene prerenderizada (scripts/prerender.mjs); en `vite dev` no.
if (root.firstElementChild) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
