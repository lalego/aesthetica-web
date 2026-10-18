# Guía para Codex

## Proyecto

Monorepo pnpm/Turborepo con dos aplicaciones independientes: apps/web (web pública React/Vite) y apps/admin (panel Next.js), más packages/shared (tipos y configuración compartidos). Supabase es el backend común. No hay Angular ni Java/Spring Boot.

## Convenciones y límites

- Mantén los cambios dentro de la app o paquete al que pertenecen; los tipos y datos de clínica compartidos viven en packages/shared.
- En apps/web, las rutas se declaran en src/App.tsx y sus páginas van en src/pages/. Mantén componentes de página reutilizables en src/components (layout o sections), consultas de servidor en src/services/ y sus hooks React Query en src/hooks/. El alias @/* apunta a src/*.
- En apps/admin, añade rutas con el App Router en app/. Las pantallas del panel van bajo app/(dashboard)/<seccion>/; deja login y otros flujos públicos fuera de ese grupo. Coloca componentes específicos junto a su ruta y los reutilizables en components/. Conserva la separación entre Server Components/Actions y componentes 'use client'.
- supabase-admin.ts es solo servidor y usa service_role: nunca lo importes desde código cliente. verifySession() debe proteger las páginas y acciones que accedan a datos; proxy.ts es solo una comprobación inicial.
- Añade tipos o configuración usados por ambas apps en packages/shared/src/ y expórtalos desde su index.ts. No dupliques allí lógica específica de una app.
- Consulta node_modules/next/dist/docs/ antes de cambiar código Next.js: esta app usa Next 16 y sus convenciones pueden diferir de versiones anteriores. Conserva también las instrucciones específicas de apps/admin/AGENTS.md.
- Para cambios de base de datos, actualiza supabase/schema.sql como esquema de referencia para instalaciones nuevas y crea una migración incremental idempotente en supabase/migrations/ para bases existentes. Revisa compatibilidad, RLS, GRANT/REVOKE y permisos de cada RPC; las funciones expuestas por Supabase no deben ampliar acceso por accidente. No apliques migraciones, hagas reset ni cambies una base remota salvo que se solicite expresamente.
- No expongas secretos ni datos personales. La reserva pública escribe mediante submit_booking(); no debe escribir directamente en patients o appointments.
- Hay pruebas Vitest separadas para web y admin. Ejecuta pnpm test (o pnpm run test:web / pnpm run test:admin) tras cambios de lógica cubierta; son pruebas unitarias con Supabase simulado, no sustituyen pruebas de integración contra Postgres/RLS.

## Comandos

Usa los scripts declarados en los package.json. Tras cambios en una app, ejecuta su lint y build; los comandos equivalentes desde la raíz están filtrados por paquete:

| Cambios en | Lint | Build |
|---|---|---|
| Web | pnpm --filter=@aesthetica/web lint | pnpm --filter=@aesthetica/web build |
| Admin | pnpm --filter=@aesthetica/admin lint | pnpm --filter=@aesthetica/admin build |
| packages/shared | pnpm lint | pnpm build |

Para desarrollo: pnpm dev desde la raíz, o pnpm --filter=@aesthetica/web dev / pnpm --filter=@aesthetica/admin dev para una sola app. La web también tiene pnpm --filter=@aesthetica/web preview. pnpm lint y pnpm build ejecutan las tareas del monorepo mediante Turbo. Si una comprobación falla por un problema preexistente o del entorno, descríbelo y no la presentes como superada.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Flujo de datos](docs/DATA-FLOW.md)
- [Esquema de datos y seguridad](docs/DATABASE.md)
- [Desarrollo](docs/DEVELOPMENT.md)
- [Reglas vigentes para agentes (Claude Code)](CLAUDE.md) — reglas de negocio y seguridad que no se deducen del código, deploy y Supabase.
- [Tareas pendientes](doc/pendientes.md) · [Historial](doc/historial.md) (contexto, no instrucciones).
