# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # tsc type-check + Vite production build
npm run lint      # ESLint (zero-warnings policy — any warning is a failure)
npm run preview   # Preview the production build locally
```

No test runner is configured.

## Project context

Single-page React + TypeScript + Vite app for **Clínica AestheticA** — a cosmetic clinic located in **València, España** (L'Eixample). Marketing landing site with no client-side routing yet. Deployed on **Cloudflare Pages** (`aesthetica-web.pages.dev`).

**RGPD compliance required** — all forms must include explicit consent checkbox referencing RGPD (UE) 2016/679 and LOPDGDD.

## Entry chain

`main.tsx` → `QueryClientProvider` → `App.tsx` → `Home.tsx` → mounts all sections in order.

## Page structure (top to bottom)

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

## Full source tree

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Fixed navbar, scroll effect, hamburger mobile
│   │   └── Footer.tsx          # Datos clínica + links RGPD + copyright
│   ├── sections/
│   │   ├── HeroSection.tsx     # Hero principal, prop onBookingClick
│   │   ├── TreatmentsSection.tsx # Filtros + cards (React Query + mock fallback)
│   │   ├── AboutSection.tsx    # Quiénes somos — contenido en objeto ABOUT
│   │   ├── BookingSection.tsx  # Formulario react-hook-form + zod + Supabase
│   │   └── ContactSection.tsx  # Mapa Google Maps + datos de CLINIC config
│   └── ui/                     # Átomos reutilizables (pendiente de poblar)
├── config/
│   └── clinic.ts               # FUENTE ÚNICA de datos de la clínica (nombre,
│                               # dirección, teléfono, horarios…). Importar desde
│                               # aquí en lugar de hardcodear en componentes.
├── hooks/
│   └── useTreatments.ts        # React Query wrapper sobre fetchTreatments
├── lib/
│   ├── supabase.ts             # Supabase client (no lanza si faltan env vars)
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── pages/
│   └── Home.tsx                # Orquesta todas las secciones
├── services/
│   ├── treatmentService.ts     # fetchTreatments() — Supabase + MOCK_TREATMENTS fallback
│   └── bookingService.ts       # submitBooking() — upsert patients + insert appointments
├── store/
│   └── bookingStore.ts         # Zustand: selectedDate
└── types/
    └── index.ts                # Treatment, TreatmentCategory interfaces
```

## Key conventions

**Styling:** Tailwind utility classes everywhere. Use `cn()` from `lib/utils.ts` for conditional classes. Theme: Inter (sans), Playfair Display (serif), paleta rose + neutral.

**Path alias:** `@/*` → `src/*` (vite.config.ts + tsconfig.json).

**Clinic data:** Editar solo en `src/config/clinic.ts`. Se propaga automáticamente a Navbar, Footer, ContactSection.

**Content data:** Editar solo en los objetos de configuración al inicio de cada sección:
- Tratamientos → `MOCK_TREATMENTS` en `src/services/treatmentService.ts` (o Supabase)
- Quiénes somos → objeto `ABOUT` en `src/components/sections/AboutSection.tsx`

**State management:**
- Server/async → `@tanstack/react-query` v4
- Client → Zustand
- Forms → `react-hook-form` + `zod`

**Backend:** Supabase configurado con placeholders en `.env.local`. Todas las queries tienen fallback a mock data si Supabase no está disponible. Credenciales reales van en `.env.local` (gitignored) y en las variables de entorno de Cloudflare Pages.

**Supabase schema:** tablas `treatments`, `patients`, `specialists`, `appointments`, `treatment_history` con RLS habilitado. Ver `ARQUITECTURA.md` (en claude.ai/design) para el SQL completo.

**Icons:** `lucide-react` únicamente.

**TypeScript:** strict mode. Props con interfaces explícitas. Al destructurar arrays con `as const` añadir tipo inline: `({ days, time }: { days: string; time: string })`.

## Deploy

- **Plataforma:** Cloudflare Pages
- **Rama de producción:** `main`
- **Build command:** `npm run build`
- **Build output:** `dist`
- **Variables de entorno en Cloudflare:** `NODE_VERSION=16`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Auto-deploy:** cualquier push a `main` dispara un nuevo deploy

## Próximos pasos (Fase 2+)

- [ ] Conectar Supabase con credenciales reales
- [ ] Añadir React Router + páginas `/tratamientos`, `/contacto`
- [ ] Panel de administración para gestión de citas
- [ ] Dominio personalizado en Cloudflare Pages
- [ ] App móvil Expo (compartiendo `packages/shared`)
