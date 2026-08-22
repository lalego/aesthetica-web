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

## Pendiente

- [ ] Rellenar `apps/web/.env.local`, `apps/admin/.env.local` **y las variables de entorno reales de Supabase en Cloudflare Pages/Vercel** (siguen todas con placeholders; el mock fallback funciona en local pero no hay datos reales en ningún entorno).
- [ ] Verificar `apps/admin` (Next.js) arranca correctamente en local — todavía no se ha probado (solo se ha comprobado `apps/web`).
- [ ] Confirmar si `apps/admin` está realmente conectado a un proyecto de Vercel: no se encontró ninguna GitHub App de Vercel instalada en `lalego/aesthetica-web` (solo está la de Cloudflare Workers and Pages), así que es posible que el despliegue de admin en Vercel **no exista todavía** o esté en otra cuenta/organización.
- [ ] Decidir si hace falta `pnpm approve-builds` para `esbuild`/`unrs-resolver` (de momento no ha hecho falta).

## Cómo continuar

```cmd
call D:\tools\env-node18.bat
cd C:\wpi\aesthetica-web
pnpm dev                                  :: todos los apps
pnpm dev --filter=@aesthetica/web         :: solo landing
pnpm dev --filter=@aesthetica/admin       :: solo admin
```
