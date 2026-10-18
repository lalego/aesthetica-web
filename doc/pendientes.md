# Pendientes

Lista única de tareas abiertas. Cuando cierres una, márcala con la fecha.

## Puesta en marcha de facturación (en este orden)

- [x] Commit de los cambios de facturación (4cbef38, d570df1)
- [x] Probar en local (2026-10-18): Supabase local con schema, plantilla e histórico. `/facturas` muestra las 42 y el PDF sale bien.
- [ ] Ejecutar `supabase/migrations/20261017_facturas.sql` en el SQL Editor de producción
- [ ] Ejecutar `supabase/migrations/20261017_servicios_pdfformfiller.sql`. Tiene que ir antes de la importación, porque las líneas antiguas apuntan a estos tratamientos.
- [ ] Subir `PdfFormFiller/src/main/resources/formulario.pdf` a Storage → bucket `invoice-templates` → `formulario.pdf`
- [ ] Ejecutar `PdfFormFiller/dev/migracion-aesthetica-web/import-facturas-historicas.sql` (la comprobación del final debe dar 42 facturas)
- [ ] Push a `main` (a 2026-10-18, `main` va 6 commits por delante de `origin/main`). Esto despliega en Vercel, así que conviene hacerlo después de los pasos de base de datos.
- [ ] Probar en producción: el listado tiene 42 facturas, se descarga una antigua y se emite una nueva (debe salir `…-0052-2026`), tanto desde `/facturas` como desde "Facturar" en una cita completada.

## Mejoras de facturación

- [ ] Facturas rectificativas o anulación. Ahora una factura emitida no se puede editar ni borrar desde el panel.
- [ ] Editar los datos fiscales (DNI, dirección, CP) desde la ficha del paciente. Ahora solo se puede desde el formulario de factura.
- [ ] Filtro por año o trimestre en `/facturas`, y exportación CSV para el gestor (base, IVA, total).
- [ ] Automatizar el envío al gestor. Hoy se hace a mano: se suben los PDFs a Dropbox y luego se le manda un correo. Falta decidir cómo hacerlo (botón en `/facturas`, cron trimestral…). Los PDFs no se guardan, así que habría que generarlos con `renderInvoicePdf()`.

## Entorno y producto

- [x] Arreglar ESLint en `apps/admin` (2026-10-18, con `packageExtensions` en `pnpm-workspace.yaml`)
- [x] Commit de las pruebas Vitest y de la documentación de `docs/` (2026-10-18)
- [ ] Dominio personalizado en Cloudflare Pages (ver `doc/dominio-personalizado.md`)
- [ ] App móvil Expo en `apps/mobile/` (compartiría `packages/shared`)
- [x] Borrar el código muerto `apps/web/src/store/bookingStore.ts` (2026-10-18)
- [x] Revisar los comentarios de `supabase/schema.sql` que hablan de "staff auth futuro" (2026-10-18)
