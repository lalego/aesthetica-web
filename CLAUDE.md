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

## Architecture

Single-page React + TypeScript + Vite app for a cosmetic clinic (Clínica Aesthetica, Santiago, Chile). Currently a marketing/landing site with no routing.

**Entry chain:** `main.tsx` → wraps the app in `QueryClientProvider` → `App.tsx` → `Home.tsx` orchestrates page sections.

```
src/
├── components/
│   ├── sections/   # Full-width page sections (HeroSection, ContactSection)
│   └── ui/         # Reusable primitives (currently empty)
├── features/       # Feature-scoped logic (currently empty)
├── hooks/          # Custom hooks (currently empty)
├── lib/
│   ├── supabase.ts # Supabase client (reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
│   └── utils.ts    # cn() helper (clsx + tailwind-merge)
├── pages/
│   └── Home.tsx    # Main page, manages smooth scroll to contact section
└── store/          # Zustand stores (currently empty)
```

## Key conventions

**Styling:** Tailwind utility classes everywhere. Use `cn()` from `lib/utils.ts` to merge conditional classes. Custom theme adds Inter (sans-serif) and Playfair Display (serif) fonts and a rose color palette — see `tailwind.config.js`.

**Path alias:** `@/*` resolves to `src/*` (configured in both `vite.config.ts` and `tsconfig.json`).

**State management intent:**
- Server/async state → `@tanstack/react-query` (provider already at root)
- Client state → Zustand (installed, no stores written yet)
- Form state → `react-hook-form` + `zod` (installed, not yet wired)

**Backend:** Supabase is configured but no queries are implemented yet. Add real credentials to `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — the `.env.local` file has placeholder values.

**Icons:** Use `lucide-react` for all icons.

**TypeScript:** Strict mode is on. Keep components typed with explicit prop interfaces.
