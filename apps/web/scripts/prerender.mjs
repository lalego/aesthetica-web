// Genera un HTML estático por página a partir del build de Vite, más sitemap.xml
// y 404.html. Se ejecuta en `pnpm build`, después de `vite build` (cliente) y
// `vite build --ssr` (dist-ssr/entry-server.js).
//
// Cada página se escribe como `<ruta>.html` (`/tratamientos/faciales` →
// `tratamientos/faciales.html`), que Cloudflare Pages sirve en la URL sin
// extensión ni barra final, que es la canónica.
//
// Los tratamientos se piden a Supabase en el build: si cambian precios o se
// añade uno en el panel, la web los actualiza sola en el navegador, pero el HTML
// estático (lo que lee Google) no cambia hasta el siguiente despliegue.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const ssrEntry = resolve(root, 'dist-ssr/entry-server.js')

const { render, ROUTES, NOT_FOUND_ROUTE, SITE_URL, fetchTreatments } = await import(pathToFileURL(ssrEntry).href)

const template = await readFile(resolve(dist, 'index.html'), 'utf8')
const treatments = await fetchTreatments()
console.log(`[prerender] ${treatments.length} tratamientos`)

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const page = (url, route) => {
  const { html, head, title, lang, state } = render(url, route, treatments)
  return template
    .replace('<html lang="es">', `<html lang="${lang}">`)
    .replace(/<title>.*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html)
    .replace('<!--app-state-->', `<script>window.__RQ_STATE__=${state}</script>`)
}

const fileFor = (path) => resolve(dist, path === '/' ? 'index.html' : `${path.slice(1)}.html`)

for (const route of ROUTES) {
  const file = fileFor(route.path)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, page(route.path, route))
}
await writeFile(resolve(dist, '404.html'), page('/404', NOT_FOUND_ROUTE))
console.log(`[prerender] ${ROUTES.length} páginas + 404.html`)

// ── sitemap.xml con alternativas hreflang ─────────────────────────
const abs = (path) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`)
const today = new Date().toISOString().slice(0, 10)
const entries = ROUTES.filter((r) => r.sitemap).map((r) => {
  const alternates = r.alternates
    ? [...Object.entries(r.alternates), ['x-default', r.alternates.es]]
        .map(([hl, p]) => `\n    <xhtml:link rel="alternate" hreflang="${hl}" href="${abs(p)}"/>`)
        .join('')
    : ''
  return `  <url>\n    <loc>${abs(r.path)}</loc>\n    <lastmod>${today}</lastmod>${alternates}\n  </url>`
})
await writeFile(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`,
)
console.log(`[prerender] sitemap.xml con ${entries.length} URLs`)

await rm(resolve(root, 'dist-ssr'), { recursive: true, force: true })
