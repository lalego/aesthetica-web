# Versiones

Novedades de cada versión de la web pública (`aestheticavanzada.com`) y del panel de gestión. Hay una sola versión para todo el proyecto, porque los dos se publican juntos con cada push a `main`.

**Cómo se numera** (`MAYOR.MENOR.PARCHE`):
- **PARCHE** (1.0.**1**): correcciones y retoques de texto o diseño.
- **MENOR** (1.**1**.0): funcionalidad nueva.
- **MAYOR** (**2**.0.0): un cambio grande que afecta a cómo se usa la web o el panel.

**Cómo sacar una versión:**
1. Mientras se trabaja, apunta los cambios en "Sin publicar".
2. Al publicar, renombra esa sección con el número y la fecha, y pon el mismo número en `version` de `package.json` (raíz, `apps/web`, `apps/admin` y `packages/shared`).
3. Haz el commit (`release: vX.Y.Z`), la etiqueta (`git tag -a vX.Y.Z -m "..."`) y el push con etiquetas (`git push origin main --tags`).

## Sin publicar

### Novedades
- **Versión en ucraniano** en `/ua`: todas las páginas, los tratamientos y el formulario de reserva. El menú muestra las banderas de los otros dos idiomas.

### Cambios
- Los precios se muestran con el símbolo € en todos los idiomas.
- El selector de idioma del menú es una bandera (Reino Unido / España) en lugar de "EN" / "ES".
- En tablet, el menú cabe en una línea: el botón de teléfono muestra solo el icono hasta pantallas grandes.

## 1.1.0 — 2026-10-20

Web más ligera y datos de contacto con el dominio propio.

### Novedades
- La versión se ve en el pie del menú del panel, con un enlace a estas novedades.

### Cambios
- **La web pesa un 24 % menos** (de 160 a 121 KB de JavaScript comprimido): se quita la librería completa de Supabase, que solo hacía falta para tres llamadas, y la validación del formulario se descarga al usarlo.
- El email de contacto de la web y de las páginas legales pasa a ser **info@aestheticavanzada.com**, y el aviso legal cita el dominio `aestheticavanzada.com`.
- `www.aestheticavanzada.com` y `aesthetica-web.pages.dev` redirigen al dominio principal, así Google no ve la web duplicada.
- Las páginas legales usan el nombre comercial **Estudio AestheticA** (antes "Centro AestheticA").

## 1.0.0 — 2026-10-20

La web pasa a estar preparada para Google y para clientes que no hablan castellano.

### Novedades
- **Páginas propias para cada tipo de tratamiento:** faciales, depilación láser, corporales, masajes, y novias y regalos, más Hydroface Plus, Hollywood Peeling, fotorejuvenecimiento, radiofrecuencia facial y presoterapia. Cada una tiene su texto, precios, preguntas frecuentes y formulario de reserva.
- **Versión en inglés** en `/en`, con selector de idioma en el menú.
- **Páginas de "Sobre nosotros", "Contacto" y un índice de tratamientos.**
- **SEO:** cada página llega a Google con su contenido, título y descripción propios, y datos estructurados (ficha del negocio, servicios, preguntas frecuentes y migas de pan). Hay `sitemap.xml`, `robots.txt` y una página de "no encontrada" de verdad.
- **Vista previa con foto** al compartir un enlace por WhatsApp o redes.

### Cambios
- "Clínica" pasa a ser "**Estudio**" en toda la web.
- Imágenes más ligeras (WebP) y fuentes que no bloquean la carga: la web carga más rápido en el móvil.
- Las cifras de la portada y de "Quiénes somos" coinciden (+1.200 clientes, 31 tratamientos) y se editan en un solo sitio.

### Correcciones
- **El formulario de reserva ya no dice "¡Solicitud recibida!" cuando falla el envío.** Muestra un aviso con teléfono y WhatsApp, y si la hora se ha ocupado, pide elegir otra.
- La base de datos ya no se pausa por inactividad: una tarea diaria la mantiene activa. Antes, al pausarse, se perdían reservas.
- El enlace a la política de privacidad del formulario apuntaba a un sitio que no existía.

## 0.5.0 — 2026-10-17

### Novedades
- **Facturación en el panel** (`/facturas`), que sustituye a la aplicación PdfFormFiller: facturas con numeración correlativa, series F (facial, láser, capilar) y C (corporal, bienestar), IVA incluido y PDF descargable con la plantilla de siempre.
- Facturar directamente desde una cita completada.
- Importación de las 42 facturas anteriores y de los servicios antiguos de PdfFormFiller (aplicada en producción el 2026-10-20).

## 0.4.0 — 2026-08-30

### Novedades
- **La reserva web solo ofrece horas libres de verdad**, según la duración del tratamiento y las citas ya ocupadas.
- **Calendario semanal de citas** en el panel.

## 0.3.0 — 2026-08-25

### Novedades
- **Panel de gestión:** citas, pacientes y tratamientos.
- **Acceso del personal** con email y contraseña, por invitación.
- Gestión de usuarios del panel (`/usuarios`).

## 0.2.0 — 2026-08-24

### Novedades
- **Las reservas de la web se guardan en la base de datos** (Supabase), con los pacientes y su consentimiento.
- El proyecto se reorganiza para alojar la web pública y el panel de gestión juntos.

## 0.1.0 — 2026-06-25

Primera versión publicada de la web.

### Novedades
- Página de inicio con presentación, catálogo de 31 tratamientos con filtros, "Quiénes somos" con Alena, formulario de cita, contacto con mapa y redes sociales.
- Diseño en dorado con el logo, adaptado al móvil.
- Aviso legal, política de privacidad y política de cookies.
