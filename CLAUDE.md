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
│   └── bookingService.ts       # submitBooking() — upsert patients + insert appointments
├── store/
│   └── bookingStore.ts
└── types/
    └── index.ts                # Re-exporta desde @aesthetica/shared
```

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

**Backend:** Supabase configurado con placeholders en `apps/web/.env.local`. Fallback a mock data si Supabase no está disponible. Credenciales reales en `.env.local` (gitignored) y variables de entorno de Cloudflare Pages / Vercel.

**Supabase schema:** tablas `treatments`, `patients`, `specialists`, `appointments`, `treatment_history` con RLS habilitado.

**Icons:** `lucide-react` únicamente.

**TypeScript:** strict mode. Props con interfaces explícitas.

## Deploy

### apps/web → Cloudflare Pages
- **Build command:** `pnpm turbo build --filter=@aesthetica/web`
- **Build output:** `apps/web/dist`
- **Root directory:** `/` (raíz del monorepo)
- **Variables de entorno:** `NODE_VERSION=18`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Auto-deploy:** cualquier push a `main`

### apps/admin → Vercel
- **Root directory:** `apps/admin`
- **Framework:** Next.js (auto-detectado)
- **Variables de entorno:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXTAUTH_SECRET`

## Próximos pasos (Fase 2+)

- [ ] Conectar Supabase con credenciales reales
- [ ] Completar panel admin: citas, pacientes, tratamientos, facturación
- [ ] Autenticación staff en admin (Supabase Auth)
- [ ] Dominio personalizado en Cloudflare Pages
- [ ] App móvil Expo en `apps/mobile/` (comparte `packages/shared`)
