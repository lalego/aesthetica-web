# Historial

Contexto de decisiones y problemas pasados. **No son instrucciones**: lo vigente está en `CLAUDE.md` y en `docs/`. Hay más detalle de la puesta en marcha inicial en `entorno-desarrollo-estado.md`.

## 2026-08-21 — Pipeline de Cloudflare Pages reparado

Llevaba ~1 mes roto desde la migración a monorepo. El sitio seguía sirviendo el último build bueno. Había tres causas:

- La configuración de build en el dashboard era de antes del monorepo (`npm run build` / `dist`).
- `NODE_VERSION=16`, que no basta para el corepack que resuelve pnpm. Se subió a 18.
- `@types/react` 19 (admin) se colaba en la resolución de tipos de la web (React 18). Se arregló con `hoist=false` en `.npmrc` (commit e76f796). Como efecto secundario, ESLint del admin dejó de funcionar (`eslint-config-next` hace `require` de `next` sin declararlo). Se arregló el 2026-10-18 con `packageExtensions` en `pnpm-workspace.yaml`.

## 2026-08-24 — Supabase real y auth de staff

- Se conectó el proyecto Supabase real. Hasta entonces la web solo funcionaba con `MOCK_TREATMENTS`.
- El primer intento del flujo de invitación se quedaba en una página en blanco, porque `@supabase/ssr` fuerza PKCE e ignora el `#access_token=`. Se arregló leyendo el fragmento a mano (81e2861, a623738).
- `NEXTAUTH_SECRET` era un resto de un plan inicial con NextAuth.js que nunca se implementó. Ya no existe.
- Al principio el staff se invitaba desde el dashboard de Supabase. Después se añadió `/usuarios` (a72fb90, renombrado de "Staff" en 4604a9a).

## Agenda

- 6ae2263: disponibilidad real (`get_available_slots()`) en la reserva web, y calendario semanal en el admin.

## 2026-10-17 — Facturación migrada desde PdfFormFiller

- Antes las facturas se hacían con una app de consola Java (`C:\Users\laleg\IdeaProjects\PdfFormFiller`, PDFBox + CSVs). Su lógica (`TaxCalculator`, numeración, plantilla AcroForm) se portó a TypeScript en el admin.
- El correlativo global compartido entre series y años viene de PdfFormFiller: 2025 acabó en 26 y 2026 empezó en 27.
- Los 12 servicios de `services.csv` no coincidían con el catálogo de Booksy, así que se importaron como tratamientos inactivos `pff-<ServiceID>`. Su duración es orientativa, porque PdfFormFiller no la tenía.
- `patients` ganó `tax_id`/`address`/`postal_code`, y `email` pasó a ser opcional (los clientes históricos no lo tenían).
- Las facturas antiguas imprimían la base imponible en cada línea, no el importe con IVA. Por eso el PDF regenerado desde el admin no es idéntico al original en esas líneas. Los originales están en `PdfFormFiller/out/`.

## 2026-10-17 / 18 — Entorno de la máquina

- El Node portátil de `D:\tools` (v18) desapareció, y se pasó a nvm-windows con Node 22.5.1. Con Node 18, el CLI de shadcn fallaba (`Cannot find native binding`, necesita ≥20.18.1) y por eso los componentes UI se escribieron a mano. Con Node 22 no se ha vuelto a probar.
- Se montó Supabase local recortado (2a3254e). Docker se movió a `D:\Docker\wsl` porque C: se quedó sin espacio.

## 2026-10-18 — Reorganización de la documentación

`CLAUDE.md` mezclaba estado actual, historia y tareas, y contradecía al código: decía que no había tests, que no había UI de usuarios y que no había Supabase CLI. Se separó en `CLAUDE.md` (lo vigente), `docs/` (referencia técnica), `doc/pendientes.md`, este archivo y `CLAUDE.local.md` (lo de esta máquina).

## 2026-10-20 — SEO de la web y cambio de "Clínica" a "Estudio"

- El encargo pedía Next.js (`metadata`, `sitemap.js`), pero la web es Vite. Se prefirió prerenderizar en el build en vez de migrar, porque da el mismo HTML para Google, se queda en Cloudflare Pages sin adaptador (OpenNext) y no obliga a reescribir. Se hizo a mano (Vite SSR + `scripts/prerender.mjs`) para no añadir dependencias.
- Antes había una sola URL, el `<div id="root">` llegaba vacío y `_redirects` devolvía la portada con 200 en cualquier ruta. Ni WhatsApp ni Instagram mostraban vista previa.
- Decisiones con el usuario: solo estética (sin personal sanitario), así que el schema es `BeautySalon` y no `MedicalBusiness`, y los tratamientos son sin aguja. Idiomas castellano e inglés (traducción de Claude). Los tratamientos estrella (Hydroface Plus, Hollywood Peeling, fotorejuvenecimiento, radiofrecuencia y presoterapia, además de la depilación láser como categoría) se eligieron sin datos de volumen de búsqueda.
- No se usa `aggregateRating` con las 66 reseñas de Google Business Profile: Google no muestra estrellas que un negocio publica sobre sí mismo.
- El usuario pidió llamar al negocio "Estudio" en vez de "Clínica" en todas partes. En España, "clínica" suele implicar un centro sanitario registrado. Se mantuvo "centro de estética" en algunos textos porque es una búsqueda habitual.
- Las imágenes se convirtieron a WebP una sola vez con `sharp`, fuera del repo. Los JPEG originales siguen en `public/`, porque `hero-clinic.jpeg` se usa en el JSON-LD.
- Lo que falta (revisar textos, descripciones con agujas en la base de datos, Search Console, peso del JS) está en `pendientes.md`.

## 2026-10-20 — Puesta en producción, versiones y tercer idioma

- **Base de datos de producción.** El proyecto de Supabase estaba **pausado** (plan Free, ~7 días sin actividad). Mientras tanto la web mostraba `MOCK_TREATMENTS` y el formulario decía "¡Solicitud recibida!" aunque la reserva no se guardaba, así que se pudo perder alguna. Se reactivó, se aplicaron las migraciones de facturación, se importaron las 42 facturas antiguas (la siguiente es la 0052) y se subió `formulario.pdf`. El SQL del histórico lo pegó el usuario, para que los datos de clientes no pasaran por la conversación.
- **Para que no vuelva a pausarse:** Cron Job diario de Vercel a `/api/keepalive`. Se descartó GitHub Actions porque desactiva los cron de repos sin actividad en 60 días.
- **Formulario de reserva:** ya no da por buena una reserva que falla. Distingue "hueco ocupado" (el mensaje del `raise exception` de `submit_booking()`) de un fallo general, en el que muestra teléfono y WhatsApp.
- **Versiones:** `CHANGELOG.md` con una sola versión para todo el proyecto, porque web y panel se publican juntos. Se reconstruyeron las versiones 0.1.0–0.5.0 a partir del historial de git y se etiquetaron. Hoy salieron la 1.0.0 (SEO) y la 1.1.0. La versión se ve en el pie del panel.
- **Dominio:** `www` y `aesthetica-web.pages.dev` redirigen con 301 mediante una Bulk Redirect de Cloudflare. Las Redirect Rules de la zona no sirven para `pages.dev`, que no es un dominio propio. Las vistas previas `<id>.aesthetica-web.pages.dev` no se redirigen a propósito. El email de la web pasó a `info@` y las páginas legales a "Estudio AestheticA".
- **JS de la web: de 160 a 121 KB gzip.** `@supabase/supabase-js` se sustituyó por un cliente REST propio para las tres llamadas de la web, y zod se carga con `import()`. Se midió con los sourcemaps: react-router parecía el 27 % por su código fuente, pero minificado son solo 13 KB, así que se dejó.
- **Ucraniano:** tercer idioma, porque Alena lo habla y hay clientela ucraniana. El código de idioma es `uk` (ISO 639-1, el que pide `hreflang`), pero el usuario lo confundió con Reino Unido y las rutas se sirven en `/ua`. Estuvieron unos minutos en `/uk`, que redirige con `_redirects`. La traducción la hizo Claude y está pendiente de que la revise Alena.
- **Selector de idioma con banderas en SVG,** porque Windows no dibuja los emoji de banderas.
- **Diseño "muy claro":** Alena encontró la web pálida. De las tres propuestas (más contraste, tonos cálidos o secciones oscuras) se eligió la C: fondos crema y arena, "Quiénes somos" en el marrón del pie y textos más oscuros. Se publicó en la rama `diseno` (vista previa en `https://diseno.aesthetica-web.pages.dev`) para que Alena la revise antes de pasarla a `main`.
- **Vistas previas de Cloudflare:** fallaban porque el entorno Preview tenía su propia configuración antigua, con `NODE_VERSION=16`; en agosto solo se corrigió Production. Se cambió a 18 en el panel, porque un `.node-version` en el repo no basta mientras la variable exista. Las variables de Supabase de Preview siguen con `placeholder` a propósito, para que en la vista previa no se puedan crear citas reales.
