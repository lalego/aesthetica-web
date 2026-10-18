# Guía para Codex

## Proyecto

Monorepo pnpm/Turborepo con dos aplicaciones independientes: apps/web (web pública React/Vite) y apps/admin (panel Next.js), más packages/shared (tipos y configuración compartidos). Supabase es el backend común. No hay Angular ni Java/Spring Boot.

## Convenciones y límites

- Mantén los cambios dentro de la app o paquete al que pertenecen; los tipos y datos de clínica compartidos viven en packages/shared.
- En apps/web, sigue los patrones existentes de hooks/servicios React Query, React Router y Tailwind. El alias @/* apunta a src/*.
- En apps/admin, conserva la separación entre Server Components/Actions y componentes 'use client'. supabase-admin.ts es solo servidor y usa service_role: nunca lo importes desde código cliente. verifySession() debe proteger páginas y acciones que accedan a datos.
- Consulta node_modules/next/dist/docs/ antes de cambiar código Next.js: esta app usa Next 16 y sus convenciones pueden diferir de versiones anteriores. Conserva también las instrucciones específicas de apps/admin/AGENTS.md.
- No expongas secretos ni datos personales. No cambies políticas RLS ni funciones SQL sin revisar las implicaciones de seguridad. La reserva pública escribe mediante submit_booking(); no debe escribir directamente en patients o appointments.
- No hay runner de tests configurado. No afirmes que los cambios están probados si no ejecutaste una comprobación adecuada.

## Comandos

Desde la raíz: pnpm dev, pnpm build, pnpm lint. Para una app: pnpm dev --filter=@aesthetica/web o pnpm dev --filter=@aesthetica/admin; builds y lint equivalentes con --filter. Web también ofrece pnpm --filter=@aesthetica/web preview. No existe script test.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Flujo de datos](docs/DATA-FLOW.md)
- [Desarrollo](docs/DEVELOPMENT.md)
- [Contexto heredado de Claude Code](CLAUDE.md) — útil como referencia; puede contener notas históricas que requieren verificación.
