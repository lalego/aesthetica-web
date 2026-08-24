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
│       ├── layout.tsx            # verifyStaffSession() + <AppSidebar /> + <main>
│       ├── citas/
│       │   ├── page.tsx             # Server Component: fetch appointments + join patients/treatments
│       │   ├── appointments-table.tsx  # 'use client': Select de estado por fila
│       │   └── actions.ts           # 'use server': setAppointmentStatus()
│       ├── pacientes/
│       │   ├── page.tsx             # Server Component: fetch patients
│       │   └── patients-table.tsx   # 'use client': solo lectura + filtro de búsqueda
│       ├── tratamientos/
│       │   ├── page.tsx             # Server Component: fetch treatments (activos e inactivos)
│       │   ├── treatments-table.tsx # 'use client': toggle activo/inactivo
│       │   ├── treatment-form-dialog.tsx  # 'use client': alta/edición
│       │   └── actions.ts           # 'use server': saveTreatment(), setTreatmentActive()
│       └── facturas/                # placeholder, sin implementar
├── components/ui/                # primitivas shadcn (radix-nova) — algunas escritas a mano, ver abajo
└── lib/
    ├── supabase-server.ts         # cliente anon + cookies (Server Components/Actions) — solo para saber quién está logueado
    ├── supabase-browser.ts        # cliente anon + cookies (navegador) — solo lo usa auth-dispatcher.tsx, ver abajo
    ├── supabase-admin.ts          # cliente service_role, 'server-only' — el que usan todas las páginas de datos
    ├── dal.ts                     # verifyStaffSession() — comprobación real, la llaman layout.tsx y cada Server Action
    └── auth-actions.ts            # 'use server': login(), signOut(), setInitialPassword()
```

**Por qué `supabase-admin.ts` con `service_role`:** `patients`/`appointments` no tienen políticas RLS para `anon`/`authenticated` a propósito (ver `supabase/schema.sql`) — la única vía de escritura pública es la función `submit_booking()`. El panel admin necesita leer y escribir esas tablas directamente, así que todas las páginas de citas/pacientes/tratamientos son Server Components/Server Actions que usan `supabaseAdmin` (import protegido con el paquete `server-only`, nunca se debe importar desde un archivo `'use client'`).

**Autenticación de staff (Supabase Auth, implementada 2026-08-24):** `proxy.ts` hace una comprobación optimista en cada request (redirige a `/login` si no hay sesión) y `lib/dal.ts` → `verifyStaffSession()` vuelve a comprobarla de verdad en cada Server Component y cada Server Action de citas/tratamientos — un Server Action es un endpoint público igual que una API route, no basta con proteger la página. `service_role` sigue bypasseando RLS igual que antes; Supabase Auth aquí solo decide quién puede *llegar* a usar esas Server Actions, no cambia las políticas RLS de las tablas.

- **Alta de staff:** no hay UI de gestión de usuarios (fuera de alcance de momento) — se invita desde el dashboard de Supabase (Authentication → Users → Add user → Send invitation). El proyecto está en el plan Free **sin SMTP propio configurado**, así que Supabase usa sus plantillas de email por defecto y **no se pueden personalizar** (bloqueado hasta configurar SMTP custom). Eso significa que el link de invitación no puede apuntar a una ruta tipo `/auth/confirm?token_hash=...` propia — usa el flujo implícito de siempre: verifica en el propio servidor de Supabase y redirige a `Site URL` con los tokens en el fragmento `#` de la URL (invisible para el servidor). Por eso `app/page.tsx` (fuera del grupo `(dashboard)`, público en `proxy.ts`) monta `auth-dispatcher.tsx`, un client component con `lib/supabase-browser.ts` (`createBrowserClient` de `@supabase/ssr`, con las env vars `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`) que consume ese fragmento, sincroniza la sesión en cookies, y manda a `/set-password` (si el hash trae `type=invite`) o a `/citas`.
- **⚠️ Trampa de `@supabase/ssr` con el fragmento `#access_token=...`:** `createBrowserClient` fuerza `flowType: 'pkce'` internamente y no se puede desactivar (ni pasando `auth.flowType` en las opciones — el valor hardcodeado gana igual). En modo PKCE la detección automática de sesión busca un `?code=` en la URL, nunca `#access_token=`, así que `auth-dispatcher.tsx` NO puede confiar en `detectSessionInUrl` ni en esperar a que dispare `onAuthStateChange('SIGNED_IN')` — hay que leer el fragmento a mano (`new URLSearchParams(window.location.hash.slice(1))`) y llamar a `supabase.auth.setSession({ access_token, refresh_token })` explícitamente. El primer intento (2026-08-24, antes del fix) se quedaba en una página en blanco sin redirigir a ningún sitio porque de esto.
- **Si en el futuro se configura SMTP propio:** ahí sí se podría personalizar la plantilla "Invite user" para usar `{{ .TokenHash }}` + una ruta propia `/auth/confirm` (Route Handler que llama a `supabase.auth.verifyOtp()` server-side) en vez de este flujo basado en fragmento — es más simple y no necesita cliente de navegador. No implementado porque el flujo actual ya cubre el caso de uso con el plan Free.
- **Site URL / Redirect URLs:** configurados en el dashboard de Supabase (Authentication → URL Configuration) → Site URL = `https://aesthetica-web-admin.vercel.app`, Redirect URLs incluye también `http://localhost:3000/**` para pruebas en local.
- **`NEXTAUTH_SECRET`** ya no existe como variable — era un placeholder de un plan inicial de usar NextAuth.js que nunca se implementó; se usa Supabase Auth en su lugar, ver arriba.

**shadcn CLI no funciona en este entorno:** requiere Node ≥20.18.1 y el Node portátil de la máquina sin permisos de admin es v18.14.1/v18.20.8. Los componentes de `components/ui/` que faltaban (`table`, `badge`, `input`, `label`, `textarea`, `select`, `switch`, `dialog`) están escritos a mano siguiendo el estilo `radix-nova` ya configurado en `components.json`, usando los primitivos de `radix-ui` (paquete unificado, mismo patrón que `button.tsx`: `import { Dialog } from "radix-ui"` → `Dialog.Root`, etc.). Si se necesita añadir un componente nuevo, replicar ese patrón en vez de intentar correr `pnpm dlx shadcn add` — falla con `Cannot find native binding` en Node 18.

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

**Supabase schema:** tablas `treatments`, `patients`, `specialists`, `appointments`, `treatment_history` con RLS habilitado. Fuente de verdad: `supabase/schema.sql` (ejecutar entero en el SQL Editor de un proyecto Supabase nuevo). `treatments` tiene lectura pública (`is_active = true`); `patients`/`appointments` no tienen políticas para `anon` — toda escritura del formulario de reserva pasa por la función `submit_booking()` (SECURITY DEFINER), llamada desde `apps/web/src/services/bookingService.ts` vía `supabase.rpc(...)`. `specialists`/`treatment_history` sin políticas públicas todavía (pendiente auth de staff).

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
- **Variables de entorno:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (publishable key), `SUPABASE_SERVICE_ROLE_KEY` (secret key — la usan las Server Actions de citas/pacientes/tratamientos), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mismos valores que las dos primeras, con prefijo público — las necesita `lib/supabase-browser.ts` para el flujo de invitación, ver `apps/admin — Source tree` más arriba)
- **Proyecto:** `aesthetica-web-admin` en la cuenta/team `aesthetica1` de Vercel — verificado en producción el 2026-08-24, `aesthetica-web-admin.vercel.app` sirve correctamente el panel (Citas, Pacientes, Tratamientos, Facturación)
- **Auto-deploy:** cualquier push a `main` (Production Deployment conectado vía GitHub)

## Próximos pasos (Fase 2+)

- [ ] Completar panel admin: facturación sigue siendo placeholder (citas, pacientes y tratamientos ya conectados a Supabase real, ver `apps/admin — Source tree` más arriba)
- [ ] UI de gestión de staff en admin (alta/baja de usuarios) — de momento se invita a mano desde el dashboard de Supabase, ver nota de autenticación más arriba
- [ ] Dominio personalizado en Cloudflare Pages
- [ ] App móvil Expo en `apps/mobile/` (comparte `packages/shared`)
