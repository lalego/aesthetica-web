-- Servicios de PdfFormFiller (services.csv) que no existen en el catálogo de Booksy.
-- Se crean inactivos: no salen en la web pública ni en la reserva, solo en el
-- formulario de factura del admin. Ejecutar después de 20261017_facturas.sql y
-- antes del SQL de importación del histórico (que enlaza las líneas antiguas a
-- estos ids). Idempotente. supabase/schema.sql ya los incluye.
-- id = 'pff-' + ServiceID de services.csv. La duración no existía en
-- PdfFormFiller: es orientativa (la columna es obligatoria).

insert into treatments (id, name, category, description, duration_min, price_eur, is_active, image_url) values
  ('pff-fc',    'Limpieza facial',                                        'facial',   null, 60, 69,  false, null),
  ('pff-fc65',  'Limpieza facial (Descuento)',                            'facial',   null, 60, 65,  false, null),
  ('pff-bm',    'Masaje corporal relax',                                  'corporal', null, 60, 50,  false, null),
  ('pff-bm60',  'Masaje corporal integral',                               'corporal', null, 60, 60,  false, null),
  ('pff-pr25',  'Presoterapia',                                           'corporal', null, 30, 25,  false, null),
  ('pff-pr23',  'Presoterapia (Descuento)',                               'corporal', null, 30, 23,  false, null),
  ('pff-pr20',  'Presoterapia (Descuento)',                               'corporal', null, 30, 20,  false, null),
  ('pff-pr19',  'Presoterapia (Descuento)',                               'corporal', null, 30, 19,  false, null),
  ('pff-bpr10', 'Bono Presoterapia 10 ses.',                              'corporal', null, 30, 180, false, null),
  ('pff-bpr5',  'Bono Presoterapia 5 ses.',                               'corporal', null, 30, 100, false, null),
  ('pff-cfv',   'Cavitación Radiofrecuencia y Vacumterapia',              'corporal', null, 60, 45,  false, null),
  ('pff-cfv30', 'Cavitación Radiofrecuencia y Vacumterapia (Descuento)',  'corporal', null, 60, 30,  false, null)
on conflict (id) do nothing;
