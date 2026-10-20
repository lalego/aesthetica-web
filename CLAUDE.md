# CLAUDE.md

Guía para Claude Code en este repositorio. Solo contiene información **vigente**. Si algo deja de ser cierto, corrígelo aquí en vez de añadir una nota al lado.

Dónde está cada cosa (una sola fuente por tema):

| Tema | Fuente |
|---|---|
| Convenciones de cambio y límites (compartido con Codex) | [AGENTS.md](AGENTS.md), y [apps/admin/AGENTS.md](apps/admin/AGENTS.md) para Next 16 |
| Estructura, módulos y tecnologías | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Flujos de reserva y del panel | [docs/DATA-FLOW.md](docs/DATA-FLOW.md) |
| Tablas, RLS y RPC | [docs/DATABASE.md](docs/DATABASE.md) (el SQL de verdad es `supabase/schema.sql`) |
| Variables de entorno, Supabase local y comandos | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Tareas pendientes | [doc/pendientes.md](doc/pendientes.md) (al cerrar una, márcala allí) |
| Versiones y novedades | [CHANGELOG.md](CHANGELOG.md) (al terminar algo visible, apúntalo en "Sin publicar") |
| Qué pasó y por qué (no son instrucciones) | [doc/historial.md](doc/historial.md) |
| Particularidades de esta máquina (Node, Docker) | `CLAUDE.local.md` (no versionado) |

No copies aquí árboles de ficheros ni listas de comandos que ya estén en `docs/`, porque se desactualizan.

## Proyecto

**Estudio AestheticA**, estudio de estética avanzada en Ruzafa (València). Es un monorepo pnpm + Turborepo:

- `apps/web`: web pública (Vite + React 18) en castellano (`/`) e inglés (`/en`), con páginas de tratamientos, reserva de citas y páginas legales. Se prerenderiza a un HTML estático por página y se despliega en Cloudflare Pages.
- `apps/admin`: panel interno (Next.js 16 + React 19) con citas, pacientes, tratamientos, facturas y usuarios. Se despliega en Vercel.
- `packages/shared`: `CLINIC` (datos de la clínica) y tipos compartidos. Los datos de la clínica se editan **solo** en `packages/shared/src/clinic.ts`.

## Comandos

`pnpm dev | build | lint | test` desde la raíz. Para una sola app, `--filter=@aesthetica/web` o `--filter=@aesthetica/admin`. `pnpm test` ejecuta Vitest (pruebas unitarias de web y admin con Supabase simulado). No sustituye a probar contra Postgres.

- Si un cambio en `apps/admin/app/globals.css` (sobre todo en `@theme`) no se aplica ni reiniciando `next dev`, es la caché persistente de Turbopack. Para el servidor, borra `apps/admin/.next/dev/cache` y vuelve a arrancarlo.
- Para comprobar tipos del admin: `apps/admin/node_modules/.bin/tsc --noEmit -p apps/admin` (ignora el error de `.next/dev/types/validator.ts`, que sale de tipos generados antiguos).
- `.npmrc` → `hoist=false` es necesario: sin él se mezclan `@types/react` 18 (web) y 19 (admin) y falla `tsc` en web. Como efecto secundario, un paquete que haga `require` de algo que no declara como dependencia falla al cargarse. Esos casos se arreglan con `packageExtensions` en `pnpm-workspace.yaml` (como ya se hizo con `eslint-config-next` → `next`), nunca quitando `hoist=false`.

## Reglas que no se deducen del código

**RGPD:** todo formulario de la web lleva una casilla de consentimiento explícito que cita el RGPD (UE) 2016/679 y la LOPDGDD.

**Acceso a datos:**
- `patients`, `appointments`, `invoices` e `invoice_items` no tienen políticas RLS para `anon`/`authenticated`, y es intencionado. La web solo escribe a través de `submit_booking()` y lee huecos con `get_available_slots()`, las dos SECURITY DEFINER.
- El admin lee y escribe con `lib/supabase-admin.ts` (service_role, `server-only`), que nunca se importa desde un archivo `'use client'`. `proxy.ts` solo hace un redirect optimista. La comprobación real es `verifySession()` (`lib/dal.ts`), y la llaman el layout del dashboard, **cada Server Action** y el route del PDF: un Server Action es un endpoint público.
- Postgres concede EXECUTE a PUBLIC por defecto y PostgREST expone las funciones de `public`. Toda función nueva que no deba ser pública necesita `revoke execute ... from public, anon, authenticated`, como `create_invoice()`.
- Los cambios de esquema se hacen en `supabase/schema.sql` y además en una migración idempotente `supabase/migrations/AAAAMMDD_*.sql`. En producción se ejecutan a mano en el SQL Editor; en local, las migraciones están desactivadas (ver más abajo).

**Facturación** (`/facturas`, portada desde la app Java PdfFormFiller):
- Numeración `{serie}-{seq:4}-{año}`, p. ej. `C-0052-2026`. `seq` es **un único correlativo global** para todas las series y años. Lo asigna `create_invoice()` con un advisory lock: nunca lo calcules en JS.
- Serie `F` (facial, láser, capilar) o `C` (corporal, bienestar), según el primer tratamiento (`seriesForCategory()` en `lib/invoices.ts`). Se puede cambiar en el formulario.
- Los importes llevan el IVA incluido (21 %), igual que `price_eur`. Base = `round(total / 1.21, 2)` e IVA = total − base. Máximo 3 líneas, las que caben en la plantilla.
- La factura guarda un *snapshot* del cliente (nombre, DNI, dirección, CP). Si el DNI está vacío, el PDF muestra `PENDIENTE-IDENTIFICAR`.
- El PDF se genera al vuelo y no se guarda: se rellenan los campos AcroForm de `formulario.pdf` y se aplana. **La plantilla no está en el repo**, porque el repo es público y la plantilla lleva el NIF de la clínica. Está en el bucket privado `invoice-templates` de Storage. Si cambia el diseño, se sube una versión nueva con los mismos nombres de campo.
- Los tratamientos con id `pff-*` son servicios antiguos de PdfFormFiller y son **inactivos** a propósito: solo sirven para facturar y no salen en la web. Si se activa uno, aparece en la web.
- El SQL que importa el histórico (42 facturas y 31 clientes) lleva datos personales y **nunca va al repo**. Está fuera, en `PdfFormFiller/dev/migracion-aesthetica-web/`.

**Auth de staff (Supabase Auth):**
- El staff se invita desde `/usuarios` (`inviteUserByEmail`). El plan Free no tiene SMTP propio, así que las plantillas de email no se pueden personalizar. El enlace usa el flujo implícito: Supabase redirige a `Site URL` con los tokens en el fragmento `#`.
- `app/page.tsx` monta `auth-dispatcher.tsx`, que consume ese fragmento y manda a `/set-password` (si `type=invite`) o a `/citas`.
- ⚠️ `createBrowserClient` de `@supabase/ssr` fuerza PKCE y no se puede desactivar. En PKCE solo detecta `?code=`, nunca `#access_token=`, así que no confíes en `detectSessionInUrl` ni en `onAuthStateChange`. Lee el fragmento a mano y llama a `supabase.auth.setSession(...)`.
- Si algún día se configura SMTP propio, se podría usar `{{ .TokenHash }}` con un Route Handler `/auth/confirm` + `verifyOtp()`, sin cliente de navegador.

**UI del admin:** el CLI de shadcn no se usa aquí. Los componentes de `components/ui/` están escritos a mano con el estilo `radix-nova` y el paquete unificado `radix-ui` (`import { Dialog } from "radix-ui"` → `Dialog.Root`). Para añadir uno, copia ese patrón.

**Estilo:** Tailwind con `cn()` (`@/lib/utils`), Inter y Playfair Display, paleta dorada + neutros: `gold` en `apps/web/tailwind.config.js`, que el admin replica como variables `--gold-*` en `app/globals.css`. Iconos solo de `lucide-react`. TypeScript strict, props con interfaces explícitas. En la web: React Query v4 para datos asíncronos y react-hook-form + zod para formularios (no hay librería de estado global). El contenido de las secciones está en objetos al principio de cada archivo (`ABOUT` en `AboutSection.tsx`, `MOCK_TREATMENTS` en `treatmentService.ts`, que se usa solo si Supabase falla).

**SEO de la web (prerender):**
- `src/routes.tsx` es la única lista de páginas. De ahí salen el router, el `<head>` de cada página (título, descripción, canonical, hreflang y JSON-LD, en `src/seo/head.ts`), el HTML estático y `sitemap.xml`. Una página nueva se añade ahí, no en `App.tsx`.
- `pnpm build` ejecuta `vite build`, después `vite build --ssr src/entry-server.tsx` y por último `scripts/prerender.mjs`. Este escribe `<ruta>.html`, que Cloudflare sirve sin extensión ni barra final (es la URL canónica), y `404.html`. No hay `_redirects`: un `/* /index.html 200` devolvería 200 en las URLs que no existen.
- Los tratamientos se leen de Supabase al hacer el build. Si cambian en el panel, el navegador los actualiza, pero el HTML que lee Google no cambia hasta el siguiente despliegue.
- Textos: `src/content/landings.ts` (páginas de tratamientos, `match` decide qué tratamientos lista), `src/content/pages.ts` (resto de páginas) y `src/content/treatments-en.ts` (nombres en inglés por id, porque la tabla solo los tiene en castellano). Los componentes guardan sus textos en objetos `{ es, en }` y usan `useLang()`.
- Es un estudio de estética, no un centro sanitario: el schema es `BeautySalon` (nunca `MedicalBusiness`), sin lenguaje médico y sin tratamientos con aguja. No se pone `aggregateRating` con las reseñas de Google.
- El HTML prerenderizado y el primer render del cliente deben coincidir: nada que dependa de la fecha o de `window` en el render (usa `useEffect`, como `today` en `BookingSection`).

## Supabase

- **Producción:** proyecto `aesthetica` (org `aesthetica-clinic`), `https://vhcmpglvmpwfwblexhcs.supabase.co`. En Authentication → URL Configuration, Site URL = `https://aesthetica-web-admin.vercel.app`, y Redirect URLs incluye `http://localhost:3000/**`. No ejecutes SQL ni migraciones en remoto sin que lo pida el usuario.
- **Pausa del plan Free:** Supabase pausa el proyecto tras ~7 días sin actividad, y entonces la web no puede guardar reservas. Lo evita el Cron Job de Vercel (`apps/admin/vercel.json`), que llama cada día a `/api/keepalive` (una consulta con la anon key). Si vuelve a pausarse, revisa en Vercel → Logs que el cron responda 200.
- **Local:** Supabase CLI con `npx supabase@2.121.0` y la lista `-x` recortada de `docs/DEVELOPMENT.md` (solo Postgres, API, Auth y Storage). `supabase/config.toml` carga `schema.sql` como seed y tiene las migraciones desactivadas, porque fallarían sobre una base nueva. No hay Studio: los datos se ven con DBeaver (`localhost:54322`, `postgres`/`postgres`). No hay servidor de correo, así que los usuarios se crean con `POST /auth/v1/admin/users` y `email_confirm: true`.
- `db reset` lo borra todo. Después hay que volver a subir la plantilla al bucket, reimportar el histórico (`docker exec -i supabase_db_aesthetica-web psql -U postgres < import-facturas-historicas.sql`) y crear el usuario de staff.

## Deploy

Los dos despliegan solos con cada push a `main`.

- **apps/web → Cloudflare Pages** (`https://aestheticavanzada.com`, también `www` y `aesthetica-web.pages.dev`): build `pnpm turbo build --filter=@aesthetica/web`, output `apps/web/dist`, root `/`. Variables: `NODE_VERSION=18`, `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. El proyecto está en la cuenta de Cloudflare `Lalego@gmail.com`, a la que se entra con **"Continue with GitHub"**. La cuenta `Lalego@hotmail.com` es otra y no tiene proyectos. `www` y `aesthetica-web.pages.dev` redirigen con 301 a `https://aestheticavanzada.com`, conservando ruta y query, mediante la Bulk Redirect Rule "Dominio principal" (lista `dominio_principal`, en Delivery & performance → Bulk redirects). Las vistas previas `<id>.aesthetica-web.pages.dev` no se redirigen.
- **apps/admin → Vercel**: proyecto `aesthetica-web-admin` (team `aesthetica1`), root `apps/admin`. Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
