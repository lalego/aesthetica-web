import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { QueryClientProvider, dehydrate } from '@tanstack/react-query'
import App from './App.tsx'
import { createQueryClient } from '@/lib/queryClient'
import { fetchTreatments } from '@/services/treatmentService'
import { ROUTES, NOT_FOUND_ROUTE } from '@/routes'
import { headTags, SITE_URL } from '@/seo/head'
import type { Treatment } from '@/types'

// Entrada del prerender: la compila `vite build --ssr` y la usa scripts/prerender.mjs.

export { ROUTES, NOT_FOUND_ROUTE, SITE_URL, fetchTreatments }

export interface RenderedPage {
  html: string
  head: string
  title: string
  lang: string
  state: string
}

export const render = (url: string, route: (typeof ROUTES)[number], treatments: Treatment[]): RenderedPage => {
  const queryClient = createQueryClient()
  queryClient.setQueryData(['treatments'], treatments)

  const html = renderToString(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  )

  const meta = route.meta(treatments)
  return {
    html,
    head: headTags(meta),
    title: meta.title,
    lang: meta.lang,
    // `<` escapado para que ningún texto pueda cerrar el <script>.
    state: JSON.stringify(dehydrate(queryClient)).replace(/</g, '\\u003c'),
  }
}
