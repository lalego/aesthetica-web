# Pendientes

Lista única de tareas abiertas. Cuando cierres una, márcala con la fecha.

## Puesta en marcha de facturación (en este orden)

- [x] Commit de los cambios de facturación (4cbef38, d570df1)
- [x] Probar en local (2026-10-18): Supabase local con schema, plantilla e histórico. `/facturas` muestra las 42 y el PDF sale bien.
- [x] Ejecutar `supabase/migrations/20261017_facturas.sql` en el SQL Editor de producción (2026-10-20)
- [x] (2026-10-20) Ejecutar `supabase/migrations/20261017_servicios_pdfformfiller.sql`. Tiene que ir antes de la importación, porque las líneas antiguas apuntan a estos tratamientos.
- [x] (2026-10-20) Subir `PdfFormFiller/src/main/resources/formulario.pdf` a Storage → bucket `invoice-templates` → `formulario.pdf`
- [x] Ejecutar `PdfFormFiller/dev/migracion-aesthetica-web/import-facturas-historicas.sql` (2026-10-20: 42 facturas, seq 10–51, 3533,00 €; la siguiente es la 0052)
- [x] Push a `main` (2026-10-20, después de los pasos de base de datos)
- [ ] Probar en producción: el listado tiene 42 facturas, se descarga una antigua y se emite una nueva (debe salir `…-0052-2026`), tanto desde `/facturas` como desde "Facturar" en una cita completada.

## Mejoras de facturación

- [ ] Facturas rectificativas o anulación. Ahora una factura emitida no se puede editar ni borrar desde el panel.
- [ ] Editar los datos fiscales (DNI, dirección, CP) desde la ficha del paciente. Ahora solo se puede desde el formulario de factura.
- [ ] Filtro por año o trimestre en `/facturas`, y exportación CSV para el gestor (base, IVA, total).
- [ ] Automatizar el envío al gestor. Hoy se hace a mano: se suben los PDFs a Dropbox y luego se le manda un correo. Falta decidir cómo hacerlo (botón en `/facturas`, cron trimestral…). Los PDFs no se guardan, así que habría que generarlos con `renderInvoicePdf()`.

## SEO de la web

- [x] Prerender, páginas de tratamientos en castellano e inglés, metadatos, JSON-LD `BeautySalon`, sitemap, robots e imágenes WebP (2026-10-20)
- [ ] Cambiar en el panel (`/tratamientos`) las descripciones que hablan de agujas o de lenguaje médico: Carboxiterapia ("Microinyecciones de CO₂"), Mesoterapia corporal ("Microinyecciones…"), Microneedling ("Microagujas…") y Peeling Dermatology ("Peeling médico…"). Decidir también si se renombran Microneedling y Mesoterapia, porque los nombres ya implican aguja. Después, redesplegar la web para que el HTML recoja el cambio.
- [x] (2026-10-20) Unificar las cifras: +1.200 clientes y 31 tratamientos en el Hero y en "Quiénes somos".
- [ ] Que Alena revise la traducción al ucraniano (`landings.ts`, `pages.ts`, `treatments-i18n.ts` y los textos `uk` de los componentes), incluido cómo escribe su nombre (ahora "Альона Марценюк").
- [ ] Revisar los textos de `apps/web/src/content/landings.ts` con Alena (número de sesiones, aparatos, precios "desde"). Están redactados con información general, no con la del estudio.
- [ ] Google Search Console: verificar el dominio (registro DNS en Cloudflare) y enviar `https://aestheticavanzada.com/sitemap.xml`.
- [ ] Google Business Profile: poner `https://aestheticavanzada.com` como web, revisar que el nombre, la dirección y el teléfono coincidan con `clinic.ts` y añadir los servicios con enlace a su página.
- [ ] Rich Results Test (https://search.google.com/test/rich-results) sobre la portada y una página de tratamiento, tras el despliegue.
- [x] (2026-10-20) Rendimiento: el JS baja de 160 a 121 KB gzip. `apps/web/src/lib/supabase.ts` es un cliente REST propio en lugar de `@supabase/supabase-js`, y zod se carga con `import()` al tocar el formulario (`bookingValidation.ts`, 14 KB). Lo que queda: react-dom 41 KB, código propio 32 KB (9 KB son los textos de `landings.ts`), react-router 13 KB. Opcional: alojar las fuentes en el propio dominio.
- [ ] Hacer un deploy hook de Cloudflare Pages para redesplegar cuando cambien los tratamientos en el panel.

## Entorno y producto

- [x] Evitar que Supabase Free pause el proyecto por inactividad (2026-10-20): Cron Job diario de Vercel a `/api/keepalive`. Pendiente opcional: crear `CRON_SECRET` en Vercel.
- [x] (2026-10-20) El formulario de reserva ya no muestra éxito si falla el envío: avisa con teléfono y WhatsApp y, si el hueco se ha ocupado, pide otra hora y recarga los huecos.

- [x] Arreglar ESLint en `apps/admin` (2026-10-18, con `packageExtensions` en `pnpm-workspace.yaml`)
- [x] Commit de las pruebas Vitest y de la documentación de `docs/` (2026-10-18)
- [x] Dominio personalizado en Cloudflare Pages: `aestheticavanzada.com` (2026-10-19)
- [ ] Siguientes pasos del correo `info@`: SMTP con Resend (quitar el aviso de remitente no verificado y enviar las invitaciones de Supabase desde el dominio). Los datos de contacto de la web y las redirecciones ya están hechos (2026-10-20). Ver `doc/dominio-personalizado.md`.
- [ ] App móvil Expo en `apps/mobile/` (compartiría `packages/shared`)
- [x] Borrar el código muerto `apps/web/src/store/bookingStore.ts` (2026-10-18)
- [x] Revisar los comentarios de `supabase/schema.sql` que hablan de "staff auth futuro" (2026-10-18)
