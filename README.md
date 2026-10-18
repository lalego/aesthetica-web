# AestheticA

Monorepo de las aplicaciones de Clínica AestheticA. Usa pnpm workspaces para los paquetes y Turborepo para ejecutar tareas en paralelo.

## Aplicaciones

| Ruta | Descripción | Tecnologías |
|---|---|---|
| apps/web | Web pública: inicio, información legal, tratamientos y solicitud de citas | React 18, Vite, TypeScript |
| apps/admin | Panel interno: citas, pacientes, tratamientos, facturas y usuarios | Next.js 16, React 19, TypeScript |
| packages/shared | Configuración de clínica y tipos compartidos | TypeScript |
| supabase | Esquema, funciones RPC y migraciones de Postgres | Supabase |

La web y el panel usan Supabase para autenticación y datos. El panel utiliza una clave privilegiada únicamente desde código de servidor; no la expongas al navegador.

## Requisitos

- Node.js compatible con Next.js 16.
- pnpm 10.34.4, versión declarada en el campo packageManager del manifiesto raíz.
- Docker Desktop y Supabase CLI solo si vas a trabajar contra Supabase local.

## Inicio rápido

Desde la raíz del repositorio:

~~~bash
pnpm install
~~~

Configura las variables locales siguiendo [Desarrollo local](docs/DEVELOPMENT.md#instalación-y-configuración). No añadas valores de credenciales al repositorio. Para desarrollar contra una instancia local de Supabase, sigue también [Arranque local con Supabase](docs/DEVELOPMENT.md#arranque-local-con-supabase).

Arranca ambas apps:

~~~bash
pnpm dev
~~~

Por defecto, Vite sirve la web en http://localhost:5173 y Next.js el panel en http://localhost:3000. Para iniciar una sola aplicación:

~~~bash
pnpm dev --filter=@aesthetica/web
pnpm dev --filter=@aesthetica/admin
~~~

## Comandos habituales

~~~bash
pnpm build
pnpm lint
pnpm test
~~~

Las pruebas unitarias se pueden ejecutar por separado con pnpm run test:web o pnpm run test:admin. Simulan las llamadas a Supabase y Next; no sustituyen una comprobación de Postgres, RLS o Storage en Supabase local.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md): estructura, tecnologías y límites entre aplicaciones.
- [Flujo de datos](docs/DATA-FLOW.md): reservas públicas y operaciones del panel.
- [Esquema de datos](docs/DATABASE.md): tablas, relaciones, RLS y RPC.
- [Desarrollo](docs/DEVELOPMENT.md): variables por nombre, configuración local, servicios y comandos.
- [Instrucciones para Codex](AGENTS.md): convenciones y guía para cambios en el repositorio.

## Notas

- La fuente compartida de configuración y tipos está en packages/shared.
- El esquema de Supabase está en supabase/schema.sql; las migraciones incrementales están en supabase/migrations/. Revisa las pautas de seguridad en docs/DATABASE.md antes de modificarlo.
- La configuración de despliegue y los servicios remotos no se describen como requisitos para desarrollo local; consulta la documentación del entorno si necesitas desplegar.
