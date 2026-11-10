# Notificaciones de nuevas reservas

Cada cita insertada en `appointments` encola un aviso desde Postgres (`pg_net`). El endpoint privado de `apps/admin` obtiene los datos con la service role y envía un email por Resend y un WhatsApp por WhatsApp Cloud API. La petición lleva una firma HMAC con marca temporal, no el secreto en una cabecera, porque `pg_net` guarda temporalmente las peticiones en su cola. Si un proveedor falla, la reserva se mantiene y el endpoint responde con error; revisa los logs de Vercel y Supabase.

## Configuración de Vercel

En el proyecto `aesthetica-web-admin`, configura estas variables en Production (y en Preview solo si se quiere enviar avisos desde reservas de prueba):

| Variable | Valor |
|---|---|
| `BOOKING_NOTIFICATION_SECRET` | Secreto aleatorio largo compartido con Supabase Vault. |
| `BOOKING_NOTIFICATION_EMAIL` | Email de Alena que recibirá las solicitudes. |
| `BOOKING_NOTIFICATION_FROM` | Remitente verificado en Resend, por ejemplo `Estudio AestheticA <reservas@aestheticavanzada.com>`. |
| `RESEND_API_KEY` | API key de Resend con permiso de envío. |
| `WHATSAPP_ACCESS_TOKEN` | Token de acceso de la app de Meta con permiso `whatsapp_business_messaging`. |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número emisor de WhatsApp Cloud API. |
| `WHATSAPP_OWNER_PHONE` | Móvil de Alena en formato internacional, solo dígitos; ejemplo `346XXXXXXXX`. |
| `WHATSAPP_BOOKING_TEMPLATE` | Nombre de plantilla aprobada para notificaciones de reserva. |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Idioma aprobado por Meta para esa plantilla; por ejemplo `es_ES`. |
| `WHATSAPP_GRAPH_API_VERSION` | Versión Graph API habilitada para la app de Meta (p. ej. `vXX.0`). |

La plantilla de WhatsApp debe tener cuatro parámetros de texto en el cuerpo, en este orden: nombre de cliente, tratamiento, fecha y hora en Europe/Madrid, teléfono de cliente. Meta debe aprobarla como plantilla de utilidad antes del envío. No se usa un mensaje libre porque las notificaciones de empresa iniciadas fuera de la ventana de atención requieren plantilla.

Configura `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en Vercel como ya se usan en el panel. No compartas ni registres esos valores.

## Configuración de Supabase Vault

Después del deploy de Vercel y de guardar las variables anteriores, crea un secreto aleatorio y guarda el mismo valor en Vercel (`BOOKING_NOTIFICATION_SECRET`) y Vault. No lo guardes en el repositorio ni lo pegues en tickets. En el SQL Editor del proyecto Supabase, ejecuta sustituyendo los valores localmente:

```sql
select vault.create_secret(
  'https://aesthetica-web-admin.vercel.app/api/notifications/booking',
  'booking_notification_url'
);
select vault.create_secret('SECRETO_COMPARTIDO', 'booking_notification_secret');
```

Para cambiar un valor existente, usa `vault.update_secret(<secret_id>, new_secret := '...')`; el `secret_id` se puede consultar en `vault.secrets` sin mostrar el valor secreto. La URL y el token solo los puede leer la función trigger con privilegios elevados.

## Activación y comprobación

1. Despliega el cambio del panel para publicar el endpoint.
2. Añade y despliega las variables de Vercel.
3. Ejecuta una vez `supabase/migrations/20261101_notificaciones_reservas.sql` en el SQL Editor de producción. No está autorizada su ejecución automática desde el repo.
4. Guarda los dos secretos en Vault con el SQL anterior.
5. Haz una reserva de prueba real y comprueba llegada del email, WhatsApp y los logs del endpoint en Vercel.

La reserva no espera a que terminen las notificaciones. `pg_net` las encola de forma asíncrona. Si no existen secretos de Vault o falla el encolado, la cita se guarda igualmente y Postgres deja un aviso genérico; si Resend o Meta rechazan el envío, el detalle se registra en Vercel sin incluir datos del cliente.
