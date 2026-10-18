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
