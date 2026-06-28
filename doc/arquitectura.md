# Arquitectura del proyecto — Clínica AestheticA

## Visión general

Ecosistema completo para la gestión de la clínica compuesto por tres aplicaciones que conviven en un monorepo. Comparten tipos TypeScript, configuración de clínica y lógica de negocio a través de paquetes internos.

```
aesthetica-web/                    ← raíz del monorepo
├── apps/
│   ├── web/                       ← Landing pública        → Cloudflare Pages
│   ├── admin/                     ← Panel de gestión       → Vercel
│   └── mobile/                    ← App Android/iOS (Fase 3) → Play Store / App Store
├── packages/
│   ├── shared/                    ← Tipos TS + config clínica
│   └── ui/                        ← Componentes cross-platform (Fase 3)
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | Builds incrementales, caché compartida, workspace links |
| Landing (web) | Vite + React 18 + TypeScript | Ya existente, rápido para sitio estático |
| Admin (back+front) | Next.js 14 App Router | Full-stack en un solo proyecto: UI + API Routes |
| Admin UI | shadcn/ui + Tailwind | Componentes accesibles, sin lock-in, customizables |
| Base de datos | Supabase (PostgreSQL) | BaaS gratuito: DB + Auth + REST API auto-generada |
| Autenticación | Supabase Auth | SSO para el staff del admin |
| Deploy web | Cloudflare Pages | CDN global, free tier, auto-deploy desde main |
| Deploy admin | Vercel | Soporte nativo Next.js, serverless functions incluidas |
| Mobile (Fase 3) | Expo (React Native) | Comparte lógica con web, build para Android e iOS |

---

## Aplicaciones

### apps/web — Landing pública

Marketing site de la clínica. Sin autenticación.

**Deploy:** Cloudflare Pages
- Build command: `pnpm turbo build --filter=@aesthetica/web`
- Build output: `apps/web/dist`
- Variables de entorno: `NODE_VERSION=18`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Estructura interna:**
```
apps/web/src/
├── components/
│   ├── layout/         Navbar, Footer
│   └── sections/       HeroSection, TreatmentsSection, AboutSection,
│                       BookingSection, ContactSection
├── config/
│   └── clinic.ts       Re-exporta desde @aesthetica/shared
├── hooks/
│   └── useTreatments.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts        cn() helper
├── pages/
│   └── Home.tsx
├── services/
│   ├── treatmentService.ts   Supabase + MOCK_TREATMENTS fallback
│   └── bookingService.ts     upsert patients + insert appointments
├── store/
│   └── bookingStore.ts       Zustand: selectedDate
└── types/
    └── index.ts              Re-exporta desde @aesthetica/shared
```

**Flujo de entrada:** `main.tsx` → `QueryClientProvider` → `App.tsx` → `Home.tsx`

**Secciones de la página (orden):**
```
Navbar → Hero → Tratamientos → Quiénes somos → Cita (#agendar) → Contacto → Footer
```

---

### apps/admin — Panel de gestión

Panel interno para el personal de la clínica. Requiere autenticación.

**Deploy:** Vercel
- Root directory: `apps/admin`
- Framework: Next.js (auto-detectado)
- Variables de entorno: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXTAUTH_SECRET`

**Módulos planificados:**

| Módulo | Ruta | Descripción |
|---|---|---|
| Dashboard | `/` | Resumen del día: citas, pacientes nuevos |
| Agenda | `/citas` | Calendario, crear/ver/cancelar citas |
| Pacientes | `/pacientes` | Lista, ficha individual, historial |
| Tratamientos | `/tratamientos` | CRUD: nombre, precio, duración, categoría |
| Facturación | `/facturas` | Generar facturas, listado, estado de pago |

**API Routes (backend):**
```
apps/admin/app/api/
├── appointments/route.ts
├── patients/route.ts
├── treatments/route.ts
└── invoices/route.ts
```

Todas las rutas de API usan el **Supabase server client** (con service role key, nunca expuesta al cliente).

---

### packages/shared — Paquete compartido

Fuente única de verdad para datos y tipos que usan múltiples apps.

```
packages/shared/src/
├── clinic.ts    CLINIC config (nombre, dirección, teléfono, horarios, redes)
├── types.ts     Treatment, TreatmentCategory interfaces
└── index.ts     barrel export
```

**Uso en cualquier app:**
```typescript
import { CLINIC, Treatment, TreatmentCategory } from '@aesthetica/shared'
```

**Regla:** Nunca hardcodear datos de la clínica en un componente. Siempre importar desde `@aesthetica/shared`.

---

### apps/mobile — App móvil (Fase 3)

App para pacientes (Android + iOS) construida con Expo.

**Qué reutiliza de packages/shared:**
- ✅ Tipos TypeScript (`Treatment`, `TreatmentCategory`)
- ✅ Config de la clínica (`CLINIC`)
- ✅ Lógica de negocio pura (validaciones Zod, helpers de fecha)
- ✅ Llamadas a la API del admin (`apps/admin/app/api/*`)

**Qué NO puede reutilizar:**
- ❌ Componentes React DOM / Tailwind (web-only)
- ❌ Componentes shadcn/ui

Para la UI, `packages/ui/` en Fase 3 usará **NativeWind** (Tailwind para React Native).

---

## Base de datos — Supabase

### Tablas

```
treatments          id, name, category, description, duration_min, price_eur, is_active, image_url
patients            id, full_name, email, phone, gdpr_consent, updated_at
specialists         id, name, bio, image_url
appointments        id, patient_id, treatment_id, specialist_id, scheduled_at, duration_min, status, notes
treatment_history   id, patient_id, treatment_id, performed_at, notes, specialist_id
```

RLS habilitado en todas las tablas.

### Clientes Supabase

| App | Tipo de cliente | Key usada |
|---|---|---|
| apps/web | Browser client | `anon key` (expuesta, restringida por RLS) |
| apps/admin (UI) | Browser client | `anon key` |
| apps/admin (API Routes) | Server client | `service_role key` (solo en servidor) |

---

## Convenciones de código

**Imports de path:**
- `@/*` → `src/*` dentro de cada app
- `@aesthetica/shared` → `packages/shared/src/index.ts`

**Styling:** Tailwind utility classes. `cn()` de `@/lib/utils` para clases condicionales.

**Iconos:** `lucide-react` únicamente.

**TypeScript:** strict mode. Props con interfaces explícitas.

**RGPD:** Todos los formularios con checkbox explícito referenciando RGPD (UE) 2016/679 y LOPDGDD.

---

## Migración — historial

### Lo que se hizo (2026-06-27)

El proyecto original `aesthetica-web` (Vite + React) fue convertido en la raíz del monorepo sin perder el historial git.

**Cambios estructurales:**
- `src/` → `apps/web/src/`
- `public/` → `apps/web/public/`
- Archivos de config (`vite.config.ts`, `tsconfig.json`, etc.) → `apps/web/`
- `package.json` raíz reemplazado por workspace root
- `pnpm-workspace.yaml` + `turbo.json` + `tsconfig.base.json` añadidos a raíz

**Paquete shared creado:**
- `packages/shared/src/types.ts` ← `src/types/index.ts`
- `packages/shared/src/clinic.ts` ← `src/config/clinic.ts`
- `apps/web/src/types/index.ts` y `apps/web/src/config/clinic.ts` convertidos en re-exports de `@aesthetica/shared`

### Pendiente (ejecutar en terminal)

```bash
# 1. Instalar pnpm
npm install -g pnpm

# 2. Desde la raíz del monorepo — convertir lockfile y limpiar
pnpm import
del package-lock.json
rmdir /s /q node_modules

# 3. Instalar todo el workspace
pnpm install

# 4. Verificar landing
pnpm dev --filter=@aesthetica/web

# 5. Crear admin con Next.js 14
pnpm create next-app apps/admin --typescript --tailwind --app --no-src-dir --import-alias "@/*"
# → src/ directory: No
# → Turbopack: No

# 6. Inicializar shadcn/ui
cd apps/admin
pnpm dlx shadcn-ui@latest init

# 7. Actualizar Cloudflare Pages (en el dashboard)
#    Build command:        pnpm turbo build --filter=@aesthetica/web
#    Build output dir:     apps/web/dist
#    NODE_VERSION:         18
```

---

## Roadmap

| Fase | Contenido |
|---|---|
| ✅ Fase 1 | Landing pública (web) — desplegada en Cloudflare Pages |
| 🔄 Fase 2 | Panel admin (Next.js) + Supabase real + Auth staff |
| ⬜ Fase 3 | App móvil Expo (Android) + packages/ui NativeWind |
| ⬜ Fase 4 | Dominio personalizado, panel pacientes, notificaciones |
