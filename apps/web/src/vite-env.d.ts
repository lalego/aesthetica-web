/// <reference types="vite/client" />

interface Window {
  /** Caché de React Query con la que se prerenderizó la página (scripts/prerender.mjs). */
  __RQ_STATE__?: unknown
}
