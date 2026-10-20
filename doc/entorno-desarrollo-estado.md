# Estado de configuración del entorno — máquina sin permisos de administrador

Contexto: en este equipo no hay permisos de admin, así que no se pudo instalar Node vía winget/nvm-windows (instalación cancelada por falta de UAC). Se usó en su lugar un Node portátil ya presente en `D:\tools`.

## Hecho

1. **Node** — se usa el binario portátil `D:\tools\node-v18.14.1\node.exe` (v18.14.1, coincide con lo que pide `doc/entorno-desarrollo.md`). No requiere admin.
2. **pnpm** — habilitado vía `corepack enable` sobre ese Node. Genera pnpm **10.34.4** (versión exacta fijada en `package.json` → `packageManager`).
3. **Script de entorno** — creado `D:\tools\env-node18.bat`, copia de `D:\tools\env.bat` pero apuntando a `node-v18.14.1` en vez de `node-16` (ese otro script no se ha tocado). Para activarlo en una terminal nueva:
   ```cmd
   call D:\tools\env-node18.bat
   ```
   Verificado: `node -v` → `v18.14.1`, `pnpm -v` → `10.34.4`.
4. **`pnpm install`** — ejecutado en la raíz del monorepo (`C:\wpi\aesthetica-web`). Completado sin errores (~12 min, red lenta).
   - Aviso pendiente: *"Ignored build scripts: esbuild@0.18.20, unrs-resolver@1.12.2. Run `pnpm approve-builds` to pick which dependencies should be allowed to run scripts."* — pnpm bloquea esos scripts por seguridad por defecto. No ha impedido que `pnpm dev` funcione, pero si en el futuro hay algo raro con builds/binarios nativos, revisar esto primero.
5. **`.env.local`** — creados **vacíos** (solo con las claves, sin valores) en:
   - `apps/web/.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   - `apps/admin/.env.local` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXTAUTH_SECRET`)

   Sin estos valores, `apps/web` sigue funcionando gracias al fallback a `MOCK_TREATMENTS`. `apps/admin` probablemente necesite las credenciales reales para funcionar (no verificado).
6. **Verificación** — se arrancó `pnpm dev --filter=@aesthetica/web`, respondió `200 OK` en `http://localhost:5173/` con el HTML correcto ("Clínica AestheticA"). Servidor parado después de la prueba.
7. **Git** — el email local del repo (`luis.aleixandregonzalez@ext.europarl.europa.eu`) difiere del que indica `doc/entorno-desarrollo.md` (`laleixandreg@laberit.com`). Se decidió **dejarlo como está**, no se tocó.
8. **Bug de render en blanco (apps/web)** — `src/lib/supabase.ts` usaba `??` para el fallback de `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`. Como `.env.local` define esas claves con valor **vacío** (`""`, no `undefined`), el `??` nunca se disparaba y `createClient('')` lanzaba una excepción que dejaba la app en blanco. Cambiado a `||`. Commit `d3c5056`.
9. **Pipeline de despliegue de Cloudflare Pages reparado (2026-08-21)** — llevaba **~1 mes roto** desde la migración a monorepo, sin que nadie lo notara (el sitio en `aesthetica-web.pages.dev` seguía sirviendo el último build bueno de hace 2 meses). Causas encontradas y arregladas, todas en la cuenta de Cloudflare `Lalego@gmail.com` (⚠️ ver nota de cuentas más abajo):
   - **Build config desactualizada** en el dashboard de Cloudflare (Settings → Build): seguía en `npm run build` / output `dist`, de antes del monorepo. Corregido a `pnpm turbo build --filter=@aesthetica/web` / `apps/web/dist`.
   - **`NODE_VERSION=16`** en las variables de entorno de Cloudflare — insuficiente para el `corepack` que resuelve pnpm (necesita Node ≥18.17 por la API `URL.canParse`, si no el build falla en el paso de `Reshimming asdf nodejs...`). Corregido a `18`.
   - **Colisión de tipos React 18/19**: `apps/web` usa React 18 y `apps/admin` React 19. pnpm hoisteaba una única copia de `@types/react` (la v19 de admin) en una carpeta interna (`node_modules/.pnpm/node_modules/`) que quedaba en la ruta de resolución de tipos de TypeScript, rompiendo `tsc` en `apps/web` con errores `TS2786` en cualquier componente JSX (`Route`, iconos de `lucide-react`, `Link`, etc.). Arreglado con `.npmrc` → `hoist=false` en la raíz del monorepo (requiere `pnpm install` para regenerar `node_modules`). Commit `e76f796`.
   - Deploy de producción verificado en vivo: `aesthetica-web.pages.dev` sirve correctamente el commit `e76f796`.
10. **⚠️ Cuenta de Cloudflare** — el proyecto `aesthetica-web` de Cloudflare Pages vive en la cuenta `Lalego@gmail.com` (login vía GitHub OAuth), **no** en `Lalego@hotmail.com` (login vía email/contraseña), que no tiene ningún proyecto. Son cuentas de Cloudflare distintas aunque el email personal sea similar. Para gestionar el deploy de `apps/web` (variables de entorno, dominios, etc.), iniciar sesión en Cloudflare con el botón **"Continue with GitHub"**, no con email/contraseña.

## Actualización 2026-10-17

- `D:\tools` ya no existe en esta máquina. Hay **nvm-windows** (`C:\Users\laleg\AppData\Roaming\nvm\`, versiones 14 a 22) y `C:\Program Files\nodejs` → **v22.5.1**. Desde Git Bash: `export PATH="/c/Program Files/nodejs:$PATH"`.
- El corepack de Node 22.5.1 falla con `Cannot find matching keyid` (claves de firma de npm rotadas) → `COREPACK_INTEGRITY_KEYS=0 corepack pnpm ...`.
- `node_modules` se había creado antes de `hoist=false` (`ERR_PNPM_HOIST_PATTERN_DIFF`); se regeneró con `pnpm install` (~4 min).
- ESLint de `apps/admin` falla con `Cannot find module 'next/dist/compiled/babel/eslint-parser'` (consecuencia de `hoist=false`). Arreglado el 2026-10-18 (ver `historial.md`).

## Pendiente (cerrado el 2026-10-20)

- [x] Variables de Supabase. **Producción:** Cloudflare Pages y Vercel tienen las reales; la web publicada saca los precios de la base de datos y el panel lee las facturas. **Local:** `apps/admin/.env.local` y `apps/web/.env.local` apuntan al Supabase local (`http://127.0.0.1:54321`, claves de demo). `NEXTAUTH_SECRET` ya no se usa.
- [x] `apps/admin` arranca en local (`next dev`, puerto 3000).
- [x] `apps/admin` está conectado a Vercel: proyecto `aesthetica-web-admin` (team `aesthetica1`), que despliega en cada push a `main`.
- [x] `pnpm approve-builds` para `esbuild`/`unrs-resolver`: no hace falta. Los builds de web y admin funcionan en local, en Cloudflare y en Vercel.

## Cómo continuar

Este documento es histórico: describe la primera puesta en marcha en otra máquina (`D:\tools` y `C:\wpi` ya no existen). Lo vigente está en `docs/DEVELOPMENT.md` (comandos, variables y Supabase local) y, para esta máquina, en `CLAUDE.local.md`.
