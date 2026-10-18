# Desarrollo

## Requisitos conocidos

- Node.js compatible con Next.js 16 y pnpm 10.34.4, fijado por packageManager en el package.json raíz. El repo no fija una versión de Node en el manifiesto raíz.
- Para el backend local: Docker Desktop en ejecución y Supabase CLI 2.121.0, invocado con npx. La configuración está en supabase/config.toml.
- No hace falta Docker si las apps apuntan a un proyecto Supabase remoto de desarrollo.
- Los archivos apps/web/.env.local y apps/admin/.env.local son locales e ignorados por Git. No copies sus valores en documentación, tickets o logs.

## Instalación y configuración

Desde la raíz instala las dependencias con pnpm install. Crea o actualiza los archivos locales indicados con los nombres de variables siguientes; deja los valores en blanco aquí y complétalos localmente con las credenciales del entorno elegido:

apps/web/.env.local:

~~~dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
~~~

apps/admin/.env.local:

~~~dotenv
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
~~~

La web usa las dos variables VITE_* en el navegador. El panel usa SUPABASE_URL y SUPABASE_ANON_KEY en el servidor, la pareja NEXT_PUBLIC_* en el flujo de navegador para aceptar invitaciones y SUPABASE_SERVICE_ROLE_KEY únicamente en el cliente administrativo de servidor. En local, la URL y las claves deben pertenecer al mismo proyecto Supabase. No pongas la service role key en una variable NEXT_PUBLIC_* ni la expongas al navegador.

El código tiene valores placeholder como fallback en algunos clientes, pero no son credenciales funcionales. La web puede mostrar tratamientos mock cuando falla la lectura del catálogo; las reservas reales requieren RPC y base de datos accesibles. El panel necesita además un usuario de staff válido. Para generar facturas, debe estar cargada la plantilla privada en Storage.

## Arranque local con Supabase

La configuración local expone API en el puerto 54321 y Postgres en 54322. Tiene Auth y Storage habilitados. El seed de una base nueva carga supabase/schema.sql; la aplicación automática de migraciones está desactivada en supabase/config.toml. No ejecutes db reset como paso normal de arranque.

1. Inicia Docker Desktop.
2. Desde la raíz, inicia el conjunto local ligero que conserva Postgres, API, Auth y Storage:

~~~bash
npx supabase@2.121.0 start -x realtime,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
~~~

3. Consulta el estado local con npx supabase@2.121.0 status. Usa la URL local y las claves que muestra la CLI para completar las variables correspondientes en ambos .env.local. Los valores no deben añadirse al repo.
4. En terminales aparte, arranca las apps con pnpm dev desde la raíz (web en el puerto Vite y admin en el puerto 3000), o inicia una sola con los comandos filtrados de abajo.
5. Para parar Supabase sin borrar los datos, usa npx supabase@2.121.0 stop.

El auth.site_url y additional_redirect_urls del config local están preparados para http://localhost:3000 (admin). El flujo público de invitaciones no se podrá probar por correo con el comando anterior porque Mailpit está excluido; para ese flujo, configura un servicio de correo local apropiado o crea una cuenta local por el procedimiento de desarrollo ya establecido. No compartas credenciales de usuarios.

## Arranque contra Supabase remoto

Si no usas Docker, configura las variables con URL y claves de un proyecto de desarrollo remoto. No uses credenciales de producción para pruebas locales y no ejecutes migraciones remotas sin autorización expresa. La conectividad y el estado de un proyecto remoto no se verifican desde estos pasos.

## Comandos declarados en package.json

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

Vitest ejecuta pruebas unitarias del código de web y admin:

~~~bash
pnpm test
pnpm run test:web
pnpm run test:admin
~~~

Los casos de web verifican los servicios de disponibilidad y reserva contra las RPC esperadas. Los del admin verifican validación y redirects de autenticación, protección de sesión, normalización/validación de facturas y cálculo de importes. Las dependencias de Supabase, Next y Postgres se simulan: estas pruebas no demuestran que las políticas RLS, permisos SQL, correos ni Storage funcionen en una instancia real. La suite aún no monta BookingSection, así que no verifica la validación ni los mensajes visibles del formulario.

Para validar el backend, inicia Supabase local según la sección de arranque y comprueba manualmente el alta de reserva, el acceso con usuario local, la creación de factura y la descarga del PDF. Usa datos de prueba y nunca producción. No hay aún una suite de integración automatizada para Postgres.

TypeScript forma parte del build de la web (tsc); el script de build del admin delega en Next.

## Convenciones observadas

- TypeScript estricto en la configuración base; props y modelos tipados.
- Web: alias @/* → src/*; Tailwind; cn() desde src/lib/utils; React Query para estado asíncrono y React Hook Form/Zod disponibles para formularios.
- Admin: alias de app configurado en tsconfig; App Router; Server Components por defecto; 'use client' solo donde hace falta interactividad; Server Actions para mutaciones.
- Iconos observados: lucide-react. UI del admin usa Radix UI y componentes locales en components/ui.
- Mantener la fuente común en packages/shared; evitar duplicar tipos y configuración clínica.
- Mantener consentimiento en el flujo público de reserva y no cambiar la política de escritura sin revisar esquema y seguridad.

## Limitaciones y cuestiones por confirmar

- CLAUDE.md recoge solo reglas vigentes; la historia está en doc/historial.md y las tareas en doc/pendientes.md.
- No se inspeccionaron valores de .env.local. Comprueba localmente que las claves correspondan al endpoint Supabase elegido y que no sean placeholders.
- Las variables locales no cargan por sí solas el esquema de una instancia remota; revisa docs/DATABASE.md y el flujo de despliegue de base de datos antes de tocarla.
- El correo de invitación no está incluido en el arranque local ligero descrito arriba.
- apps/web/src/store/bookingStore.ts es código muerto: no se importa y apunta a una tabla citas inexistente.
- apps/admin/AGENTS.md incluye una instrucción vigente de consultar la documentación instalada de Next antes de modificar la app; apps/admin/CLAUDE.md la importa con @AGENTS.md.
- No se ejecutaron builds, linters, migraciones, tests, instalaciones ni arranques durante la edición de esta guía.
