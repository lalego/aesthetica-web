# Arquitectura

## Estado y alcance

Descripción del repositorio abierto. Los elementos marcados como verificados se contrastaron con los archivos actuales; el detalle histórico de CLAUDE.md no se considera automáticamente vigente.

## Vista general

El repositorio es un monorepo gestionado con pnpm workspaces y Turborepo. Contiene dos aplicaciones de interfaz y un paquete compartido; no se encontró un backend propio separado. Ambas aplicaciones se conectan directamente a Supabase.

~~~text
apps/web ───────┐
                ├── Supabase (Auth, Postgres, RPC y Storage para facturas)
apps/admin ─────┘
       │
packages/shared (configuración de clínica y tipos TypeScript)
~~~

La relación de despliegue descrita en CLAUDE.md es Cloudflare Pages para la web y Vercel para el panel. No se verificó el estado actual de esos proyectos externos.

## Estructura

- apps/web/: web pública, SPA con React, Vite y React Router. src/components/layout contiene navegación y pie; src/components/sections reúne las secciones de inicio; src/pages contiene inicio y páginas legales; src/hooks y src/services encapsulan consultas y operaciones de Supabase; src/lib contiene cliente y utilidades.
- apps/admin/: panel Next.js con App Router. app/(dashboard) agrupa citas, pacientes, tratamientos, facturas y usuarios; app/login y app/set-password implementan acceso; components contiene navegación y primitivas UI; lib contiene autenticación, acceso a datos y lógica de facturas/PDF.
- packages/shared/src/: clinic.ts configura datos compartidos de la clínica; types.ts declara tipos; index.ts los exporta.
- supabase/schema.sql: esquema y funciones SQL; supabase/migrations/: cambios incrementales.
- docs/: documentación de arquitectura, flujos y desarrollo.

## Tecnologías verificadas

- Gestor: pnpm 10.34.4 (campo packageManager); orquestación: Turborepo (latest, por tanto sin versión fija en package.json).
- Web: React 18.2, Vite 4.4, TypeScript ^5, React Router ^7, TanStack Query ^4, Supabase JS ^2, Tailwind CSS ^3, Zustand ^4, React Hook Form ^7 y Zod ^3.
- Admin: Next.js 16.2.9, React 19.2.4, TypeScript ^5, Supabase JS ^2, @supabase/ssr ^0.12, Tailwind CSS ^4, Radix UI, lucide-react y pdf-lib 1.17.1.
- Compartido: TypeScript; package workspace @aesthetica/shared exporta directamente desde src/index.ts.
- Datos: Supabase/Postgres; tablas documentadas en el esquema: treatments, specialists, patients, appointments, treatment_history, invoices e invoice_items.

## Entradas y módulos principales

### Web

src/main.tsx crea el cliente React Query y monta App. src/App.tsx define rutas para /, /aviso-legal, /privacidad y /politica-cookies. pages/Home.tsx compone Navbar, Hero, Tratamientos, About, Booking, Contact y Footer.

### Admin

app/layout.tsx es el layout raíz. app/page.tsx monta el AuthDispatcher para resolver el retorno del flujo de autenticación. proxy.ts hace la comprobación de sesión y los redirects iniciales. El layout del grupo (dashboard) verifica sesión antes de mostrar el panel. Las páginas de sección recuperan datos; las tablas y formularios cliente gestionan interacciones. Las operaciones mutables viven en Server Actions por sección. app/(dashboard)/facturas/[id]/pdf/route.ts genera la respuesta PDF.

### Persistencia y lógica compartida

packages/shared es la fuente común de configuración y tipos. supabase/schema.sql define datos, RLS y RPCs. La facturación calcula importes en apps/admin/lib/invoices.ts y genera PDF con pdf-lib en invoice-pdf.ts.

## Seguridad, autenticación e integraciones

- La web usa el cliente Supabase de apps/web/src/lib/supabase.ts. El esquema permite lectura pública de tratamientos activos. Disponibilidad y alta de reservas pasan por get_available_slots y submit_booking RPC.
- El admin emplea Supabase Auth. proxy.ts refresca/verifica claims para redirecciones; lib/dal.ts expone verifySession() para comprobación en servidor. El cliente de navegador procesa el retorno de invitación.
- supabase-server.ts usa anon key y cookies para autenticación. supabase-admin.ts usa service role para operaciones de datos, es server-only y evita RLS: tratarlo como acceso privilegiado.
- Integración PDF: plantilla en Supabase Storage y generación de documentos en el servidor. La existencia y configuración de la plantilla desplegada no se verificó en este análisis.
- Otras plataformas externas (hosting, DNS, cuentas) se mencionan en documentación heredada, pero no se comprobaron contra sus servicios.

## Manejo de errores observado

La carga de tratamientos registra un aviso y recurre a MOCK_TREATMENTS si Supabase devuelve error; la disponibilidad registra aviso y retorna una lista vacía. La reserva propaga errores RPC y BookingSection los captura para mostrarlos al usuario. En el panel, Server Actions y componentes cliente contienen manejadores locales; no se verificó un sistema global de observabilidad o una política uniforme de errores.

## Áreas no aplicables / no confirmadas

- No hay Angular, NgRx ni componentes/servicios Angular en el repositorio.
- No hay Java ni Spring Boot: no existen controladores, entidades o repositorios de ese ecosistema.
- No hay backend de API separado; las funciones SQL de Supabase son parte del backend de datos.
- No se inspeccionó la configuración real de producción ni el estado remoto de Supabase.
