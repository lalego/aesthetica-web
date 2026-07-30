# Configurar el entorno de desarrollo en otro ordenador

## Requisitos previos

- **Node.js** v18
- **pnpm** — versión fijada en `package.json` (`packageManager: pnpm@10.34.4`). Con Corepack activado (`corepack enable`) se instala sola al ejecutar `pnpm`.
- **git**

## 1. Clonar el repo y configurar git

```bash
git clone https://github.com/lalego/aesthetica-web.git
cd aesthetica-web
git config user.name "Luis Aleixandre"
git config user.email "laleixandreg@laberit.com"
```

## 2. Instalar dependencias

```bash
pnpm install
```

## 3. Variables de entorno (no están en git)

`apps/web/.env.local` y `apps/admin/.env.local` están en `.gitignore` (regla `*.local`) y hay que recrearlos a mano.

**`apps/web/.env.local`:**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**`apps/admin/.env.local`:**
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
NEXTAUTH_SECRET=...
```

Copia los valores reales desde el `.env.local` del ordenador donde ya funcionan (o desde el gestor de contraseñas donde estén guardados).

## 4. Arrancar

```bash
pnpm dev                                  # todos los apps en paralelo
pnpm dev --filter=@aesthetica/web         # solo landing (Vite)
pnpm dev --filter=@aesthetica/admin       # solo admin (Next.js)
```
