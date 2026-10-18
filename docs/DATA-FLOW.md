# Flujos de datos

## Web pública

1. main.tsx crea un QueryClient y monta App dentro de QueryClientProvider.
2. React Router elige Home o una página legal. Home ensambla las secciones de la landing.
3. TreatmentsSection consume useTreatments(); el hook usa React Query y fetchTreatments() consulta treatments activos en Supabase. Ante error devuelve MOCK_TREATMENTS local.
4. BookingSection recoge datos y consentimiento explícito. Para mostrar huecos, useAvailableSlots(date, treatmentId) llama a fetchAvailableSlots(), que invoca get_available_slots.
5. Al enviar, bookingService.submitBooking() llama a submit_booking RPC con los campos de reserva. La función de base de datos realiza el alta relacionada y valida de nuevo la disponibilidad para evitar una carrera entre reservas. El error RPC se propaga al formulario.

~~~mermaid
sequenceDiagram
    actor Cliente
    participant Formulario as BookingSection
    participant Hook as useAvailableSlots
    participant Servicio as Servicios web
    participant Supabase
    participant DB as Postgres / RPC

    Cliente->>Formulario: Selecciona tratamiento y fecha
    Formulario->>Hook: date + treatmentId
    Hook->>Servicio: fetchAvailableSlots()
    Servicio->>Supabase: get_available_slots
    Supabase->>DB: Ejecuta función SQL
    DB-->>Formulario: Horas disponibles
    Cliente->>Formulario: Envía reserva y consentimiento
    Formulario->>Servicio: submitBooking(datos)
    Servicio->>Supabase: submit_booking(datos)
    Supabase->>DB: Valida hueco y crea reserva
    DB-->>Formulario: Resultado o error
    Formulario-->>Cliente: Confirmación o mensaje de error
~~~

~~~text
Sección React → hook React Query → servicio → cliente Supabase → Postgres/RPC
~~~

## Panel administrativo

1. proxy.ts actualiza cookies de Supabase y revisa claims para decidir si continúa, redirige al login o envía un usuario autenticado a citas.
2. Las páginas del dashboard y las Server Actions llaman a verifySession(); el proxy por sí solo no es la autorización de operaciones.
3. Los Server Components leen datos con supabaseAdmin (service role). Las acciones del servidor ejecutan cambios y revalidan/actualizan la interfaz según el módulo.
4. Componentes 'use client' presentan tablas, formularios, filtros y diálogos; delegan escrituras a Server Actions.
5. El PDF de factura se genera en el Route Handler: obtiene la factura y plantilla privada de Storage, la rellena con pdf-lib y responde con el documento.

~~~mermaid
sequenceDiagram
    actor Staff
    participant Browser as Navegador
    participant Proxy as proxy.ts
    participant Page as Server Component
    participant DAL as verifySession()
    participant Auth as Supabase Auth
    participant Admin as supabaseAdmin
    participant DB as Postgres

    Staff->>Browser: Abre el panel
    Browser->>Proxy: Solicitud con cookies
    Proxy->>Auth: getClaims()
    Auth-->>Proxy: Claims o sesión ausente
    alt Sin sesión y ruta protegida
        Proxy-->>Browser: Redirect a /login
    else Sesión válida
        Proxy->>Page: Continúa
        Page->>DAL: verifySession()
        DAL->>Auth: getClaims() con cookies
        Auth-->>DAL: Claims verificados
        Page->>Admin: Consulta de datos
        Admin->>DB: Acceso servidor con service_role
        DB-->>Page: Filas permitidas por la operación
        Page-->>Browser: Render del dashboard
    end
~~~

~~~text
Navegador → Proxy/Auth → Server Component o Server Action
                           ├── verifySession (anon + cookies)
                           └── supabaseAdmin (service role) → Postgres
Route PDF → autenticación → factura + plantilla Storage → pdf-lib → respuesta
~~~

## Restricciones de acceso a datos

La descripción completa de tablas, claves, políticas y permisos RPC está en [DATABASE.md](DATABASE.md).

- El esquema activa RLS. treatments tiene política de lectura pública para filas activas.
- patients, appointments, invoices e invoice_items no ofrecen acceso directo público en las políticas observadas. La web debe usar la RPC pública prevista para reservas; el panel hace operaciones privilegiadas en servidor.
- get_available_slots, submit_booking y create_invoice están definidos en supabase/schema.sql. Para cambios de esquema, revisar también migraciones y permisos GRANT/REVOKE asociados a funciones.
- No se encontraron llamadas directas del navegador a las tablas privadas del panel. No importar el cliente admin ni la service role en módulos cliente.

## Datos compartidos

@aesthetica/shared reexporta tipos y configuración clínica para las dos aplicaciones. Editar el dato compartido en packages/shared/src, no duplicar su fuente en una app.

## Errores

- Fallo de lectura del catálogo → aviso en consola y datos mock.
- Fallo de slots → aviso y lista vacía.
- Fallo de reserva RPC → se propaga al formulario, que muestra un mensaje.
- El panel maneja fallos en acciones y diálogos localmente. No se confirmó un límite global ni un servicio central de telemetría.
