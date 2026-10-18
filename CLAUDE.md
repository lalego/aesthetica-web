# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo structure

```
aesthetica-web/                    ← raíz del monorepo (pnpm workspaces + Turborepo)
├── apps/
│   ├── web/                       ← landing pública (Vite + React) → Cloudflare Pages
│   └── admin/                     ← panel de gestión (Next.js 14 + shadcn/ui) → Vercel
├── packages/
│   └── shared/                    ← tipos TS + config clínica compartidos
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Commands

```bash
# Desde la raíz del monorepo
pnpm dev                                  # Arranca todos los apps en paralelo
pnpm dev --filter=@aesthetica/web         # Solo la landing
pnpm dev --filter=@aesthetica/admin       # Solo el admin
pnpm build                                # Build de todos los apps
pnpm build --filter=@aesthetica/web       # Solo landing
pnpm lint                                 # ESLint en todo el monorepo

# Dentro de apps/web/ o apps/admin/
pnpm dev
pnpm build
pnpm lint
pnpm preview   # solo en web (Vite)
```

No test runner is configured.

## Project context

**Clínica AestheticA** — clínica estética en **València, España** (Ruzafa).

- `apps/web` — Landing/marketing site. Deployed on **Cloudflare Pages** (`aesthetica-web.pages.dev`). RGPD compliance required — all forms must include explicit consent checkbox referencing RGPD (UE) 2016/679 y LOPDGDD.
- `apps/admin` — Panel interno de gestión (citas, pacientes, facturación, tratamientos). Deployed on **Vercel**.
- `packages/shared` — Tipos TypeScript y config de la clínica compartidos entre apps.

## apps/web — Entry chain & page structure

`main.tsx` → `QueryClientProvider` → `App.tsx` → `Home.tsx` → mounts all sections in order.

```
<Navbar />
<main>
  <HeroSection />        # Hero con CTA → scroll a #agendar
  <TreatmentsSection />  # Grid de tratamientos con filtro por categoría
  <AboutSection />       # Quiénes somos, valores, equipo
  <BookingSection />     # Formulario de cita (id="agendar")
  <ContactSection />     # Mapa + datos de contacto
</main>
<Footer />
```

## apps/web — Source tree

```
apps/web/src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── TreatmentsSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── BookingSection.tsx
│   │   └── ContactSection.tsx
│   └── ui/
├── config/
│   └── clinic.ts               # Re-exporta desde @aesthetica/shared
├── hooks/
│   └── useTreatments.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── pages/
│   └── Home.tsx
├── services/
│   ├── treatmentService.ts     # fetchTreatments() — Supabase + MOCK_TREATMENTS fallback
│   └── bookingService.ts       # submitBooking() — supabase.rpc('submit_booking', ...)
├── store/
│   └── bookingStore.ts         # useBookings() sin usar (apunta a tabla 'citas' inexistente) — código muerto
└── types/
    └── index.ts                # Re-exporta desde @aesthetica/shared
```

## apps/admin — Source tree

```
apps/admin/
├── proxy.ts                      # antes "middleware.ts" (Next 16 lo renombró) — gate de auth optimista
├── app/
│   ├── page.tsx + auth-dispatcher.tsx  # landing de '/': decide login/citas/set-password (ver auth más abajo)
│   ├── login/                    # email+password, Server Action (lib/auth-actions.ts → login)
│   ├── set-password/             # tras aceptar invitación, fija contraseña (→ auth-actions.ts → setInitialPassword)
│   └── (dashboard)/
│       ├── layout.tsx            # verifySession() + <AppSidebar /> + <main>
│       ├── citas/
│       │   ├── page.tsx             # Server Component: fetch appointments + join patients/treatments/invoices
│       │   ├── citas-view.tsx       # 'use client': alterna calendario semanal / lista
│       │   ├── week-calendar.tsx + reschedule-dialog.tsx
│       │   ├── appointments-table.tsx  # 'use client': Select de estado por fila + columna Factura ("Facturar" si está completada)
│       │   └── actions.ts           # 'use server': setAppointmentStatus(), rescheduleAppointment()
│       ├── pacientes/
│       │   ├── page.tsx             # Server Component: fetch patients
│       │   └── patients-table.tsx   # 'use client': solo lectura + filtro de búsqueda (nombre, email, teléfono, DNI)
│       ├── tratamientos/
│       │   ├── page.tsx             # Server Component: fetch treatments (activos e inactivos)
│       │   ├── treatments-table.tsx # 'use client': toggle activo/inactivo
│       │   ├── treatment-form-dialog.tsx  # 'use client': alta/edición
│       │   └── actions.ts           # 'use server': saveTreatment(), setTreatmentActive()
│       ├── facturas/                # ver "Facturación" más abajo
│       │   ├── page.tsx             # Server Component: fetch invoices + patients + treatments activos
│       │   ├── invoices-table.tsx   # 'use client': listado, búsqueda, descarga PDF
│       │   ├── invoice-form-dialog.tsx  # 'use client': alta libre o desde una cita (prop `appointment`)
│       │   ├── actions.ts           # 'use server': createInvoice() → rpc('create_invoice')
│       │   └── [id]/pdf/route.ts    # Route Handler GET: genera el PDF al vuelo
│       └── usuarios/                # gestión de staff (invitar, listar) — actions.ts + invite-user-dialog.tsx
├── components/ui/                # primitivas shadcn (radix-nova) — algunas escritas a mano, ver abajo
└── lib/
    ├── supabase-server.ts         # cliente anon + cookies (Server Components/Actions) — solo para saber quién está logueado
    ├── supabase-browser.ts        # cliente anon + cookies (navegador) — solo lo usa auth-dispatcher.tsx, ver abajo
    ├── supabase-admin.ts          # cliente service_role, 'server-only' — el que usan todas las páginas de datos
    ├── dal.ts                     # verifySession() — comprobación real, la llaman layout.tsx, cada Server Action y el route del PDF
    ├── auth-actions.ts            # 'use server': login(), signOut(), setInitialPassword()
    ├── invoices.ts                # facturación sin deps de servidor: series, computeTotals(), formatEuro(), tipos Billing*
    └── invoice-pdf.ts             # 'server-only': renderInvoicePdf() con pdf-lib sobre la plantilla de Storage
```

**Facturación (implementada 2026-10-17, sustituye a PdfFormFiller):** antes las facturas se hacían con una app de consola Java aparte (`C:\Users\laleg\IdeaProjects\PdfFormFiller`, PDFBox + CSVs). Su lógica se ha portado a TypeScript dentro del admin:

- **Datos:** tablas `invoices` + `invoice_items` (máx. 3 líneas, las que caben en la plantilla). La factura guarda un *snapshot* de los datos del cliente (nombre, DNI, dirección, CP) — no cambia aunque luego se edite el paciente. `patients` ganó `tax_id`/`address`/`postal_code` y `email` pasó a ser opcional (los clientes históricos no tienen email).
- **Numeración:** `{serie}-{seq:4}-{año}`, p. ej. `C-0052-2026`. El `seq` es **un único correlativo global** compartido entre series y años (así lo hacía PdfFormFiller: 2025 acabó en 26 y 2026 empezó en 27). Lo asigna la función SQL `create_invoice()` con un advisory lock — nunca calcularlo en JS. Serie: `F` (facial/láser/capilar) o `C` (corporal/bienestar), según el primer tratamiento (`seriesForCategory()` en `lib/invoices.ts`), editable en el formulario.
- **IVA:** los importes llevan IVA incluido (21%), igual que `price_eur`. Base = `round(total / 1.21, 2)`, IVA = total − base (`TaxCalculator` de PdfFormFiller). Las líneas del PDF muestran el importe con IVA.
- **PDF:** se genera al vuelo en `/facturas/[id]/pdf` rellenando los campos AcroForm de `formulario.pdf` (`Numero`, `Fecha`, `Nombre`, `DNI`, `Direccion`, `CodigoPostal`, `Desc1-3`, `Total1-3`, `Subtotal`, `IVA 21`, `Total`, `Forma`, `Observaciones`) y aplanando el formulario. DNI vacío → `PENDIENTE-IDENTIFICAR`. No se guardan los PDFs.
- **⚠️ La plantilla NO está en el repo** (el repo es público y la plantilla lleva el NIF de la clínica): vive en el bucket privado `invoice-templates` de Supabase Storage, archivo `formulario.pdf`. El original está en `PdfFormFiller/src/main/resources/formulario.pdf`. Si se cambia el diseño, basta con subir la nueva versión al bucket (mismos nombres de campo).
- **`create_invoice()` no es SECURITY DEFINER y tiene `revoke execute ... from public, anon, authenticated`** — Postgres da EXECUTE a PUBLIC por defecto y PostgREST expone las funciones de `public`, sin el revoke cualquiera con la anon key podría emitir facturas.
- **Servicios de PdfFormFiller:** los 12 de `services.csv` (limpieza facial 69 €, bonos de presoterapia, cavitación, descuentos…) no coincidían con el catálogo de Booksy, así que están en `treatments` como **inactivos** con id `pff-<ServiceID>` (`supabase/migrations/20261017_servicios_pdfformfiller.sql`). No salen en la web ni en la reserva. El formulario de factura muestra todos los tratamientos en dos grupos, "Catálogo web" (activos) y "Solo facturación" (inactivos), con el precio al lado. La duración de estos servicios es orientativa, porque PdfFormFiller no la tenía. Si se activa uno desde `/tratamientos`, pasa a verse en la web.
- **Histórico:** las 42 facturas emitidas con PdfFormFiller (`F-0010-2025` … `C-0051-2026`) se importan con un SQL generado a partir del texto de los PDFs de `PdfFormFiller/out/` + `customers.csv` + `services.csv`. Importa los 31 clientes de `customers.csv` como pacientes (2 no tienen factura), y cada línea queda enlazada a su servicio (`treatment_id`). Ese SQL lleva datos personales y **no se guarda en el repo**: está en `PdfFormFiller/dev/migracion-aesthetica-web/` (junto con el script `build-import.mjs` que lo genera). Los PDFs originales siguen en `PdfFormFiller/out/` como archivo; las facturas antiguas imprimían la base imponible en cada línea (no el importe con IVA), así que el PDF regenerado desde el admin no es idéntico al original en esas líneas.

**Por qué `supabase-admin.ts` con `service_role`:** `patients`/`appointments` no tienen políticas RLS para `anon`/`authenticated` a propósito (ver `supabase/schema.sql`) — la única vía de escritura pública es la función `submit_booking()`. El panel admin necesita leer y escribir esas tablas directamente, así que todas las páginas de citas/pacientes/tratamientos son Server Components/Server Actions que usan `supabaseAdmin` (import protegido con el paquete `server-only`, nunca se debe importar desde un archivo `'use client'`).

**Autenticación de staff (Supabase Auth, implementada 2026-08-24):** `proxy.ts` hace una comprobación optimista en cada request (redirige a `/login` si no hay sesión) y `lib/dal.ts` → `verifySession()` vuelve a comprobarla de verdad en cada Server Component y cada Server Action de citas/tratamientos — un Server Action es un endpoint público igual que una API route, no basta con proteger la página. `service_role` sigue bypasseando RLS igual que antes; Supabase Auth aquí solo decide quién puede *llegar* a usar esas Server Actions, no cambia las políticas RLS de las tablas.

- **Alta de staff:** no hay UI de gestión de usuarios (fuera de alcance de momento) — se invita desde el dashboard de Supabase (Authentication → Users → Add user → Send invitation). El proyecto está en el plan Free **sin SMTP propio configurado**, así que Supabase usa sus plantillas de email por defecto y **no se pueden personalizar** (bloqueado hasta configurar SMTP custom). Eso significa que el link de invitación no puede apuntar a una ruta tipo `/auth/confirm?token_hash=...` propia — usa el flujo implícito de siempre: verifica en el propio servidor de Supabase y redirige a `Site URL` con los tokens en el fragmento `#` de la URL (invisible para el servidor). Por eso `app/page.tsx` (fuera del grupo `(dashboard)`, público en `proxy.ts`) monta `auth-dispatcher.tsx`, un client component con `lib/supabase-browser.ts` (`createBrowserClient` de `@supabase/ssr`, con las env vars `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`) que consume ese fragmento, sincroniza la sesión en cookies, y manda a `/set-password` (si el hash trae `type=invite`) o a `/citas`.
- **⚠️ Trampa de `@supabase/ssr` con el fragmento `#access_token=...`:** `createBrowserClient` fuerza `flowType: 'pkce'` internamente y no se puede desactivar (ni pasando `auth.flowType` en las opciones — el valor hardcodeado gana igual). En modo PKCE la detección automática de sesión busca un `?code=` en la URL, nunca `#access_token=`, así que `auth-dispatcher.tsx` NO puede confiar en `detectSessionInUrl` ni en esperar a que dispare `onAuthStateChange('SIGNED_IN')` — hay que leer el fragmento a mano (`new URLSearchParams(window.location.hash.slice(1))`) y llamar a `supabase.auth.setSession({ access_token, refresh_token })` explícitamente. El primer intento (2026-08-24, antes del fix) se quedaba en una página en blanco sin redirigir a ningún sitio porque de esto.
- **Si en el futuro se configura SMTP propio:** ahí sí se podría personalizar la plantilla "Invite user" para usar `{{ .TokenHash }}` + una ruta propia `/auth/confirm` (Route Handler que llama a `supabase.auth.verifyOtp()` server-side) en vez de este flujo basado en fragmento — es más simple y no necesita cliente de navegador. No implementado porque el flujo actual ya cubre el caso de uso con el plan Free.
- **Site URL / Redirect URLs:** configurados en el dashboard de Supabase (Authentication → URL Configuration) → Site URL = `https://aesthetica-web-admin.vercel.app`, Redirect URLs incluye también `http://localhost:3000/**` para pruebas en local.
- **`NEXTAUTH_SECRET`** ya no existe como variable — era un placeholder de un plan inicial de usar NextAuth.js que nunca se implementó; se usa Supabase Auth en su lugar, ver arriba.

**Node en esta máquina (actualizado 2026-10-17):** hay nvm-windows con varias versiones en `C:\Users\laleg\AppData\Roaming\nvm\` y `C:\Program Files\nodejs` apunta a **v22.5.1** (la de `D:\tools` ya no existe). Desde el Bash de Claude Code no está en el PATH: `export PATH="/c/Program Files/nodejs:$PATH"`. El corepack de esa versión falla con `Cannot find matching keyid` (claves de firma antiguas) → usar `COREPACK_INTEGRITY_KEYS=0 corepack pnpm ...`. Type-check del admin: `apps/admin/node_modules/.bin/tsc --noEmit -p apps/admin` (ignorar el error de `.next/dev/types/validator.ts`, es de tipos generados antiguos). **ESLint del admin está roto** (`Cannot find module 'next/dist/compiled/babel/eslint-parser'`, por `hoist=false` en `.npmrc`) — ya lo estaba antes de facturación.

**Supabase en local (montado 2026-10-18):** Supabase CLI vía `npx supabase@2.121.0` (no instalado globalmente) sobre Docker Desktop. Se arranca en versión recortada (solo Postgres, API, Auth y Storage) para gastar poca memoria:

```bash
export PATH="/c/Program Files/nodejs:/c/Program Files/Docker/Docker/resources/bin:$PATH"
npx supabase@2.121.0 start -x realtime,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
npx supabase@2.121.0 stop          # parar (los datos se conservan)
```

- `supabase/config.toml`: `[db.migrations] enabled = false` y `[db.seed] sql_paths = ["./schema.sql"]`. En una base nueva carga `schema.sql` entero, y las migraciones incrementales no se ejecutan (fallarían, porque cuentan con que las tablas ya existan). `site_url` = `http://localhost:3000`. Analytics y edge functions, apagados.
- Sin Studio. Para ver o editar datos, **DBeaver** en `localhost:54322`, base `postgres`, usuario `postgres` / contraseña `postgres`.
- `apps/admin/.env.local` apunta a local (`http://127.0.0.1:54321` + las claves de demo fijas de Supabase local).
- Datos cargados en local: la plantilla en el bucket `invoice-templates` (subida con la API de Storage) y la importación del histórico (`docker exec -i supabase_db_aesthetica-web psql -U postgres < import-facturas-historicas.sql`). Hay un usuario de staff local con el email del usuario. Sin servidor de correo, así que los usuarios se crean con `POST /auth/v1/admin/users` (`email_confirm: true`), no con invitación.
- `npx supabase@2.121.0 db reset` borra todo y vuelve a cargar `schema.sql`; después hay que repetir la plantilla, la importación y el usuario.
- **Docker vive en `D:\Docker\wsl`** (`CustomWslDistroDir` en `%APPDATA%\Docker\settings-store.json`), porque C: se quedó sin espacio y el disco de Docker pasó a solo lectura. El volumen Oracle del proyecto `aad` (contenedor `aad-db`, imagen `doctorkirk/oracle-19c`, ambos borrados) está guardado en `D:\docker-backup\oracle-aad-db-volume.tar`.

**shadcn CLI no funciona en este entorno:** se escribió cuando solo había Node v18.14.1/v18.20.8 (requiere ≥20.18.1); con el Node 22 de arriba quizá ya funcione, no probado. Los componentes de `components/ui/` que faltaban (`table`, `badge`, `input`, `label`, `textarea`, `select`, `switch`, `dialog`) están escritos a mano siguiendo el estilo `radix-nova` ya configurado en `components.json`, usando los primitivos de `radix-ui` (paquete unificado, mismo patrón que `button.tsx`: `import { Dialog } from "radix-ui"` → `Dialog.Root`, etc.). Si se necesita añadir un componente nuevo, replicar ese patrón en vez de intentar correr `pnpm dlx shadcn add` — falla con `Cannot find native binding` en Node 18.

## packages/shared

Fuente única de verdad para datos y tipos compartidos entre apps:

- `packages/shared/src/clinic.ts` — `CLINIC` config (nombre, dirección, teléfono, horarios). **Editar aquí, no en las apps.**
- `packages/shared/src/types.ts` — `Treatment`, `TreatmentCategory` interfaces.
- `packages/shared/src/index.ts` — barrel export.

Import en cualquier app: `import { CLINIC } from '@aesthetica/shared'`

## Key conventions

**Styling:** Tailwind utility classes everywhere. Use `cn()` from `@/lib/utils` for conditional classes. Theme: Inter (sans), Playfair Display (serif), paleta rose + neutral.

**Path aliases:**
- `@/*` → `src/*` dentro de cada app
- `@aesthetica/shared` → `packages/shared/src/index.ts`

**Clinic data:** Editar solo en `packages/shared/src/clinic.ts`. Se propaga a Navbar, Footer, ContactSection y admin.

**Content data:** Editar solo en los objetos al inicio de cada sección:
- Tratamientos → `MOCK_TREATMENTS` en `apps/web/src/services/treatmentService.ts` (o Supabase)
- Quiénes somos → objeto `ABOUT` en `apps/web/src/components/sections/AboutSection.tsx`

**State management (apps/web):**
- Server/async → `@tanstack/react-query` v4
- Client → Zustand
- Forms → `react-hook-form` + `zod`

**Backend:** Supabase real conectado (2026-08-24) — proyecto `aesthetica` (org `aesthetica-clinic`), URL `https://vhcmpglvmpwfwblexhcs.supabase.co`. Credenciales en `.env.local` de cada app (gitignored) y en las env vars de Cloudflare Pages / Vercel. Fallback a `MOCK_TREATMENTS` solo si Supabase no responde.

**Supabase schema:** tablas `treatments`, `patients`, `specialists`, `appointments`, `treatment_history`, `invoices`, `invoice_items` con RLS habilitado. Fuente de verdad: `supabase/schema.sql` (ejecutar entero en el SQL Editor de un proyecto Supabase nuevo). Los cambios sobre el proyecto ya existente van además como SQL incremental e idempotente en `supabase/migrations/AAAAMMDD_*.sql` (se ejecutan a mano en el SQL Editor; no hay Supabase CLI ni `psql` en esta máquina). `invoices`/`invoice_items` siguen el mismo criterio que `patients`: sin políticas para `anon`/`authenticated`, solo `service_role`. `treatments` tiene lectura pública (`is_active = true`); `patients`/`appointments` no tienen políticas para `anon` — toda escritura del formulario de reserva pasa por la función `submit_booking()` (SECURITY DEFINER), llamada desde `apps/web/src/services/bookingService.ts` vía `supabase.rpc(...)`. `specialists`/`treatment_history` sin políticas públicas todavía (pendiente auth de staff).

**Icons:** `lucide-react` únicamente.

**TypeScript:** strict mode. Props con interfaces explícitas.

## Deploy

### apps/web → Cloudflare Pages
- **Build command:** `pnpm turbo build --filter=@aesthetica/web`
- **Build output:** `apps/web/dist`
- **Root directory:** `/` (raíz del monorepo)
- **Variables de entorno:** `NODE_VERSION=18`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Auto-deploy:** cualquier push a `main` — verificado funcionando el 2026-08-21 (llevaba ~1 mes roto tras la migración a monorepo; ver `doc/entorno-desarrollo-estado.md` para el detalle)
- **Cuenta Cloudflare:** el proyecto vive en la cuenta `Lalego@gmail.com`, login vía **"Continue with GitHub"** (no email/contraseña — esa es otra cuenta distinta, `Lalego@hotmail.com`, sin proyectos)

### apps/admin → Vercel
- **Root directory:** `apps/admin`
- **Framework:** Next.js (auto-detectado)
- **Variables de entorno:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (publishable key), `SUPABASE_SERVICE_ROLE_KEY` (secret key — la usan las Server Actions de citas/pacientes/tratamientos/facturas y la descarga de la plantilla PDF de Storage; en local, `apps/admin/.env.local` usa la de Supabase local, ver "Supabase en local"), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mismos valores que las dos primeras, con prefijo público — las necesita `lib/supabase-browser.ts` para el flujo de invitación, ver `apps/admin — Source tree` más arriba)
- **Proyecto:** `aesthetica-web-admin` en la cuenta/team `aesthetica1` de Vercel — verificado en producción el 2026-08-24, `aesthetica-web-admin.vercel.app` sirve correctamente el panel (Citas, Pacientes, Tratamientos, Facturación)
- **Auto-deploy:** cualquier push a `main` (Production Deployment conectado vía GitHub)

## Próximos pasos (Fase 2+)

- [x] Facturación en el admin (2026-10-17): el código está hecho, ver "Facturación" más arriba
- [x] UI de gestión de staff en admin (`/usuarios`, commit a72fb90)

**Puesta en marcha de facturación (en este orden):**
- [ ] Ejecutar `supabase/migrations/20261017_facturas.sql` en el SQL Editor de Supabase
- [ ] Ejecutar `supabase/migrations/20261017_servicios_pdfformfiller.sql` (antes de la importación: las líneas antiguas apuntan a estos tratamientos)
- [ ] Subir `PdfFormFiller/src/main/resources/formulario.pdf` a Storage → bucket `invoice-templates` → `formulario.pdf`
- [ ] Ejecutar `PdfFormFiller/dev/migracion-aesthetica-web/import-facturas-historicas.sql` en el SQL Editor (la comprobación del final debe dar 42 facturas)
- [ ] Commit + push de los cambios de facturación (auto-deploy a Vercel)
- [ ] Probar en producción: el listado tiene 42 facturas, se descarga una antigua y se emite una nueva (debe salir `…-0052-2026`) desde `/facturas` y desde "Facturar" en una cita completada
- [x] Probar en local (2026-10-18): Supabase local con schema, plantilla e histórico. `/facturas` muestra las 42 y el PDF se genera bien. Ver "Supabase en local".

**Mejoras futuras de facturación:**
- [ ] Facturas rectificativas/anulación (ahora una factura emitida no se puede editar ni borrar desde el panel)
- [ ] Editar los datos fiscales (DNI, dirección, CP) desde la ficha del paciente (ahora solo se puede desde el formulario de factura)
- [ ] Filtro por año o trimestre en `/facturas` y exportación para el gestor (CSV con base, IVA y total)
- [ ] Automatizar el envío al gestor. Ahora se hace a mano: primero se suben los PDFs de las facturas a Dropbox y después se le manda un correo. Hay que automatizar los dos pasos: subir a Dropbox (API de Dropbox) y enviar el correo. Todavía no está decidido cómo (botón en `/facturas`, cron por trimestre…). Ojo: hoy los PDFs no se guardan, se generan al vuelo, así que para subirlos habría que generarlos con `renderInvoicePdf()`.

**Entorno:**
- [ ] Arreglar ESLint en `apps/admin` (`Cannot find module 'next/dist/compiled/babel/eslint-parser'`, por `hoist=false`)
- [ ] Dominio personalizado en Cloudflare Pages
- [ ] App móvil Expo en `apps/mobile/` (comparte `packages/shared`)
