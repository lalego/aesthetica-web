# Desarrollo

## Requisitos conocidos

- Node.js y pnpm compatibles con el lockfile y el campo packageManager (pnpm@10.34.4). La versión exacta mínima de Node no está declarada en la raíz.
- Docker/Supabase local solo es necesario si se quiere desarrollar contra una instancia local. La configuración en supabase/config.toml y las variables locales determinan su conexión.
- Las credenciales se configuran en archivos de entorno locales no versionados. No copiar valores de credenciales en código, documentación o logs.

## Instalación y configuración

Usa las dependencias existentes y el lockfile pnpm-lock.yaml; este análisis no instaló paquetes. Configura las variables que esperan las apps: la web usa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY; el panel usa SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY y sus equivalentes NEXT_PUBLIC_* donde corresponda. Los valores son específicos de cada entorno y no se documentan aquí.

La disponibilidad del panel requiere las variables Supabase y un usuario de staff habilitado. La funcionalidad de facturas requiere la plantilla PDF disponible en Storage. No se comprobaron cuentas remotas ni valores locales.

## Comandos verificados en package.json

Desde la raíz:

~~~bash
pnpm dev
pnpm build
pnpm lint
pnpm dev --filter=@aesthetica/web
pnpm dev --filter=@aesthetica/admin
pnpm build --filter=@aesthetica/web
pnpm build --filter=@aesthetica/admin
~~~

Por app, desde su directorio:

~~~bash
# apps/web
pnpm dev
pnpm build       # tsc && vite build
pnpm lint        # eslint
pnpm preview     # vite preview

# apps/admin
pnpm dev         # next dev
pnpm build       # next build
pnpm start       # next start
pnpm lint        # eslint
~~~

Los comandos listados reflejan scripts declarados; no se ejecutaron en esta fase.

## Pruebas y comprobaciones

No hay script test, ni dependencia/configuración reconocible de runner en los manifests revisados. TypeScript forma parte del build de la web (tsc); el script de build del admin delega en Next. No se afirma que exista cobertura automática de pruebas.

## Convenciones observadas

- TypeScript estricto en la configuración base; props y modelos tipados.
- Web: alias @/* → src/*; Tailwind; cn() desde src/lib/utils; React Query para estado asíncrono y React Hook Form/Zod disponibles para formularios.
- Admin: alias de app configurado en tsconfig; App Router; Server Components por defecto; 'use client' solo donde hace falta interactividad; Server Actions para mutaciones.
- Iconos observados: lucide-react. UI del admin usa Radix UI y componentes locales en components/ui.
- Mantener la fuente común en packages/shared; evitar duplicar tipos y configuración clínica.
- Mantener consentimiento en el flujo público de reserva y no cambiar la política de escritura sin revisar esquema y seguridad.

## Limitaciones y cuestiones por confirmar

- README.md de raíz sigue siendo el README de plantilla de Vite y no documenta el monorepo.
- CLAUDE.md contiene notas específicas de sesiones y herramientas que podrían estar obsoletas; úsalo como pista histórica y verifica las afirmaciones contra el código.
- No se verificaron versiones instaladas de Node, estado de despliegues, disponibilidad de Supabase, nombres/valores de variables por entorno ni la plantilla remota.
- Hay un apps/web/src/store/bookingStore.ts; no se verificó su uso en el flujo actual.
- apps/admin/AGENTS.md incluye una instrucción vigente de consultar la documentación instalada de Next antes de modificar la app. apps/admin/CLAUDE.md no aportó contenido en la lectura.
- El análisis fue de lectura; no se ejecutaron builds, linters, migraciones, tests ni instalaciones.
