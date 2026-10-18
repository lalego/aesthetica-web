# Esquema de datos y seguridad

Esta guía resume el SQL versionado en supabase/schema.sql y supabase/migrations/. El esquema puede cambiar: antes de tocar datos, contrasta esta guía con esos archivos. No contiene datos de producción.

## Entidades y relaciones

~~~mermaid
erDiagram
    TREATMENTS ||--o{ APPOINTMENTS : "se reserva"
    PATIENTS ||--o{ APPOINTMENTS : "solicita"
    SPECIALISTS o|--o{ APPOINTMENTS : "atiende"
    PATIENTS ||--o{ TREATMENT_HISTORY : "tiene"
    TREATMENTS ||--o{ TREATMENT_HISTORY : "registra"
    APPOINTMENTS o|--o{ TREATMENT_HISTORY : "puede originar"
    SPECIALISTS o|--o{ TREATMENT_HISTORY : "realiza"
    PATIENTS ||--o{ INVOICES : "recibe"
    APPOINTMENTS o|--o| INVOICES : "se factura una vez"
    INVOICES ||--o{ INVOICE_ITEMS : "contiene"
    TREATMENTS o|--o{ INVOICE_ITEMS : "referencia"
~~~

| Tabla | Propósito y campos relevantes |
|---|---|
| treatments | Catálogo. id es texto; category está limitado a facial, corporal, laser, capilar o bienestar. Incluye duración, precio, is_active e imagen. |
| specialists | Personal/profesionales: UUID, nombre, rol y estado activo. |
| patients | Persona que reserva o recibe factura. Email único pero nullable; nombre, teléfono y consentimiento; datos fiscales opcionales (tax_id, address, postal_code). Índice único parcial en tax_id cuando no es null. |
| appointments | Reserva: paciente y tratamiento obligatorios; especialista opcional; fecha/hora, duración, estado y notas. Estado: pending, confirmed, cancelled o completed. Borrar paciente elimina sus citas; no hay borrado en cascada desde tratamiento. |
| treatment_history | Registro de tratamientos realizados, enlazado a paciente y tratamiento; cita y especialista opcionales. Borrar paciente elimina su historial. |
| invoices | Cabecera fiscal. Paciente obligatorio; cita opcional y única; número y secuencia global únicos; fecha, snapshot del cliente, forma de pago, observaciones, tipo impositivo y totales. Borrar paciente está restringido; borrar la cita deja appointment_id a null. |
| invoice_items | De 1 a 3 líneas por factura, posiciones únicas de 1 a 3, descripción e importe con IVA incluido; tratamiento opcional. Borrar la factura elimina sus líneas. |

Las claves UUID se generan con gen_random_uuid() salvo treatments.id, que usa identificadores de texto para conservar IDs del catálogo.

## RLS y roles

RLS está habilitado en las siete tablas del esquema. En el SQL versionado, la única política declarada es:

- treatments_public_read_active: anon y authenticated pueden leer tratamientos con is_active = true.

No hay políticas para leer o escribir specialists, patients, appointments, treatment_history, invoices ni invoice_items; con RLS habilitado, las solicitudes normales de esos roles quedan denegadas. El panel usa supabaseAdmin con service_role exclusivamente en servidor, que evita RLS. La autenticación de staff y la autorización de acceso a operaciones del panel son controles distintos: el primero identifica al usuario; el cliente privilegiado tiene acceso amplio a datos.

La plantilla de factura usa el bucket privado invoice-templates. schema.sql crea el bucket, pero no declara políticas de Storage; la descarga la realiza el servidor. Verifica los permisos efectivos en el proyecto antes de cambiar este comportamiento.

## RPCs

### get_available_slots(p_date date, p_treatment_id text) → setof timestamptz

- SECURITY DEFINER, search_path = public; el SQL concede ejecución a anon.
- Devuelve inicios libres cada 30 minutos, en horario Europe/Madrid: lunes a viernes 10:00–20:00, sábado 10:00–18:00 y domingo cerrado.
- Solo considera tratamientos activos, horas futuras y citas pending o confirmed; evita solapamientos usando duración del tratamiento/cita.
- La función expone huecos disponibles, no filas de pacientes o citas.

### submit_booking(p_name text, p_email text, p_phone text, p_treatment_id text, p_scheduled_at timestamptz, p_notes text, p_gdpr_consent boolean) → uuid

- SECURITY DEFINER, search_path = public; el SQL concede ejecución a anon.
- Exige consentimiento, comprueba que el tratamiento existe y está activo y realiza upsert del paciente por email.
- Crea una cita pending y repite la comprobación de solapamiento antes de escribir. El esquema no muestra un bloqueo o constraint de exclusión que serialice dos llamadas concurrentes al mismo hueco; no des por garantizada esa carrera solo por la segunda comprobación.
- Es el único camino de escritura esperado para la reserva pública. No concedas acceso directo a las tablas privadas para reemplazarlo.

### create_invoice(p_series text, p_issued_on date, p_patient_id uuid, p_appointment_id uuid, p_customer_name text, p_customer_tax_id text, p_customer_address text, p_customer_postal_code text, p_payment_method text, p_observations text, p_items jsonb) → uuid

- Asigna una secuencia global bajo advisory transaction lock y genera el número con serie, secuencia y año de emisión.
- Acepta entre 1 y 3 items. Calcula total sumando importes (IVA incluido), base dividiendo entre 1.21 y el impuesto como diferencia. Inserta cabecera y líneas en la misma transacción.
- No está declarada SECURITY DEFINER. El esquema revoca EXECUTE a PUBLIC, anon y authenticated.
- **Permiso por confirmar:** el SQL versionado no incluye un GRANT EXECUTE explícito a service_role tras ese REVOKE. Antes de depender de la RPC en una instalación nueva, comprueba los permisos efectivos/default privileges del proyecto y concede el mínimo necesario si falta.

## Cambios de esquema

1. Revisa las claves foráneas, índices, checks, RLS y ACL alrededor de la tabla o función que vas a cambiar.
2. Actualiza supabase/schema.sql para instalaciones nuevas y añade una migración incremental idempotente en supabase/migrations/ para bases existentes.
3. Asegura que la migración sea compatible con los datos existentes y documenta el orden/dependencias si requiere más de un paso.
4. Para cada función expuesta por PostgREST, revisa SECURITY INVOKER/DEFINER, search_path, validación de entradas y privilegios EXECUTE. Para tablas, revisa políticas RLS y permisos de roles explícitamente.
5. No ejecutes migraciones, reset ni SQL en bases remotas sin petición expresa. Las migraciones actuales son SQL; comprueba el flujo de despliegue vigente antes de asumir que Supabase CLI las aplica automáticamente.

## Qué queda sin confirmar

- Los permisos efectivos de service_role sobre create_invoice en cada entorno.
- Las políticas del bucket y la configuración efectiva de Storage remota.
- Si la base remota coincide con el esquema y las migraciones del repositorio.
- El uso en producción de specialists y treatment_history; aparecen en el esquema, pero no se confirmó un flujo de UI activo para ellos.
