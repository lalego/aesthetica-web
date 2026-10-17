-- Clínica AestheticA — esquema Supabase
-- Ejecutar completo en el SQL Editor de Supabase (proyecto nuevo, en orden).
-- Fuente de verdad para las tablas descritas en CLAUDE.md: treatments, patients,
-- specialists, appointments, treatment_history — todas con RLS habilitado.

create extension if not exists "pgcrypto";

-- ── treatments ────────────────────────────────────────────────────────────
-- id en texto (no uuid) para conservar los ids ya usados en el frontend
-- (MOCK_TREATMENTS en apps/web/src/services/treatmentService.ts: 'f1', 'c1', ...)

create table if not exists treatments (
  id text primary key,
  name text not null,
  category text not null check (category in ('facial', 'corporal', 'laser', 'capilar', 'bienestar')),
  description text,
  duration_min integer not null,
  price_eur numeric(10, 2),
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now()
);

alter table treatments enable row level security;

create policy "treatments_public_read_active"
  on treatments for select
  to anon, authenticated
  using (is_active = true);

-- Sin políticas de escritura para anon/authenticated: la edición de tratamientos
-- queda reservada a service_role hasta que exista auth de staff en apps/admin.

-- ── specialists ───────────────────────────────────────────────────────────

create table if not exists specialists (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table specialists enable row level security;
-- Sin políticas públicas todavía: solo accesible vía service_role / staff auth futuro.

-- ── patients ──────────────────────────────────────────────────────────────
-- Sin acceso directo de anon/authenticated (ni SELECT ni INSERT/UPDATE):
-- toda alta de paciente pasa por la función submit_booking() (más abajo),
-- que corre con privilegios elevados (SECURITY DEFINER) y valida el consentimiento
-- RGPD antes de escribir. Así evitamos exponer email/teléfono de pacientes,
-- o permitir que cualquiera sobrescriba los datos de otro paciente por email.

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,                -- null en clientes históricos importados de PdfFormFiller
  phone text,
  gdpr_consent boolean not null default false,
  tax_id text,                      -- DNI/NIF, para facturar
  address text,
  postal_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table patients enable row level security;

create unique index if not exists patients_tax_id_key on patients (tax_id) where tax_id is not null;

-- ── appointments ──────────────────────────────────────────────────────────
-- Mismo criterio que patients: sin acceso directo, todo vía submit_booking().

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  treatment_id text not null references treatments(id),
  specialist_id uuid references specialists(id),
  scheduled_at timestamptz not null,
  duration_min integer not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now()
);

alter table appointments enable row level security;

-- ── treatment_history ─────────────────────────────────────────────────────

create table if not exists treatment_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  treatment_id text not null references treatments(id),
  appointment_id uuid references appointments(id),
  specialist_id uuid references specialists(id),
  performed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table treatment_history enable row level security;
-- Sin políticas públicas: solo accesible vía service_role / staff auth futuro.

-- ── submit_booking(): único punto de escritura para el formulario público ──
-- Upsert de paciente por email + creación de cita 'pending', en una transacción.
-- SECURITY DEFINER: se ejecuta con los privilegios del owner (bypassa RLS de
-- patients/appointments), pero solo hace exactamente esto — no expone las
-- tablas en crudo a anon. Sustituye a los dos INSERT/UPSERT sueltos que hacía
-- antes apps/web/src/services/bookingService.ts directamente contra las tablas.

create or replace function submit_booking(
  p_name text,
  p_email text,
  p_phone text,
  p_treatment_id text,
  p_scheduled_at timestamptz,
  p_notes text,
  p_gdpr_consent boolean
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
  v_duration_min integer;
  v_appointment_id uuid;
begin
  if not p_gdpr_consent then
    raise exception 'gdpr_consent es obligatorio';
  end if;

  select duration_min into v_duration_min
  from treatments
  where id = p_treatment_id and is_active = true;

  if v_duration_min is null then
    raise exception 'treatment_id inválido o inactivo: %', p_treatment_id;
  end if;

  insert into patients (full_name, email, phone, gdpr_consent, updated_at)
  values (p_name, p_email, p_phone, true, now())
  on conflict (email) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        gdpr_consent = true,
        updated_at = now()
  returning id into v_patient_id;

  -- Defensa contra carrera: dos personas reservando el mismo hueco a la vez.
  -- get_available_slots() ya filtra huecos ocupados, pero esto es la última
  -- palabra justo antes de escribir.
  if exists (
    select 1 from appointments
    where status in ('pending', 'confirmed')
      and scheduled_at < p_scheduled_at + (v_duration_min || ' minutes')::interval
      and (scheduled_at + (duration_min || ' minutes')::interval) > p_scheduled_at
  ) then
    raise exception 'Ese hueco ya no está disponible, elige otro.';
  end if;

  insert into appointments (patient_id, treatment_id, scheduled_at, duration_min, status, notes)
  values (v_patient_id, p_treatment_id, p_scheduled_at, v_duration_min, 'pending', p_notes)
  returning id into v_appointment_id;

  return v_appointment_id;
end;
$$;

grant execute on function submit_booking(text, text, text, text, timestamptz, text, boolean) to anon;

-- ── get_available_slots(): huecos libres para la web pública ───────────────
-- SECURITY DEFINER + grant a anon (mismo patrón que submit_booking): no
-- expone la tabla appointments en crudo, solo devuelve horas de inicio libres.
-- El horario de apertura reproduce CLINIC.hours de packages/shared/src/clinic.ts
-- (Lun–Vie 10:00–20:00, Sáb 10:00–18:00, Dom cerrado) — si ese horario cambia,
-- actualizar también aquí.

create or replace function get_available_slots(
  p_date date,
  p_treatment_id text
) returns setof timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration_min integer;
  v_dow integer;
  v_open time;
  v_close time;
  v_slot timestamptz;
  v_close_at timestamptz;
begin
  select duration_min into v_duration_min
  from treatments
  where id = p_treatment_id and is_active = true;

  if v_duration_min is null then
    return;
  end if;

  v_dow := extract(dow from p_date); -- 0 = domingo, 6 = sábado

  if v_dow = 0 then
    return; -- domingo cerrado
  elsif v_dow = 6 then
    v_open := time '10:00';
    v_close := time '18:00';
  else
    v_open := time '10:00';
    v_close := time '20:00';
  end if;

  v_slot := (p_date + v_open) at time zone 'Europe/Madrid';
  v_close_at := (p_date + v_close) at time zone 'Europe/Madrid';

  while v_slot + (v_duration_min || ' minutes')::interval <= v_close_at loop
    if v_slot > now()
      and not exists (
        select 1 from appointments
        where status in ('pending', 'confirmed')
          and scheduled_at < v_slot + (v_duration_min || ' minutes')::interval
          and (scheduled_at + (duration_min || ' minutes')::interval) > v_slot
      )
    then
      return next v_slot;
    end if;

    v_slot := v_slot + interval '30 minutes';
  end loop;

  return;
end;
$$;

grant execute on function get_available_slots(date, text) to anon;

-- ── invoices / invoice_items ──────────────────────────────────────────────
-- Mismo criterio que patients/appointments: sin políticas para anon/authenticated,
-- solo el panel admin (service_role) lee y escribe.
-- Los datos del cliente se copian en la factura (snapshot): una factura emitida
-- no debe cambiar aunque luego se edite el paciente.

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,            -- 'F-0052-2026'
  series text not null check (series ~ '^[A-Z0-9]+$'),
  seq integer not null unique,            -- correlativo global, compartido entre series y años
  issued_on date not null,
  patient_id uuid not null references patients(id) on delete restrict,
  appointment_id uuid unique references appointments(id) on delete set null,
  customer_name text not null,
  customer_tax_id text,
  customer_address text,
  customer_postal_code text,
  payment_method text,
  observations text,
  tax_rate numeric(4, 2) not null default 0.21,
  subtotal numeric(10, 2) not null,
  tax numeric(10, 2) not null,
  total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

alter table invoices enable row level security;

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  position smallint not null check (position between 1 and 3), -- la plantilla PDF tiene 3 líneas
  description text not null,
  amount numeric(10, 2) not null,         -- IVA incluido, como los precios de treatments
  treatment_id text references treatments(id),
  unique (invoice_id, position)
);

alter table invoice_items enable row level security;

-- ── create_invoice(): numeración atómica + totales ────────────────────────
-- Reserva el siguiente número con un lock de transacción (dos altas a la vez
-- no pueden coger el mismo seq). Totales igual que TaxCalculator de
-- PdfFormFiller: los importes llevan IVA incluido y la base se saca dividiendo.
-- p_items: [{ "description": "...", "amount": 69, "treatment_id": "f1" | null }, ...]

create or replace function create_invoice(
  p_series text,
  p_issued_on date,
  p_patient_id uuid,
  p_appointment_id uuid,
  p_customer_name text,
  p_customer_tax_id text,
  p_customer_address text,
  p_customer_postal_code text,
  p_payment_method text,
  p_observations text,
  p_items jsonb
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_tax_rate numeric := 0.21;
  v_seq integer;
  v_total numeric;
  v_subtotal numeric;
  v_invoice_id uuid;
begin
  if jsonb_array_length(p_items) not between 1 and 3 then
    raise exception 'Una factura lleva entre 1 y 3 líneas';
  end if;

  select round(sum((item->>'amount')::numeric), 2) into v_total
  from jsonb_array_elements(p_items) as item;

  v_subtotal := round(v_total / (1 + v_tax_rate), 2);

  perform pg_advisory_xact_lock(hashtext('invoices_seq'));
  select coalesce(max(seq), 0) + 1 into v_seq from invoices;

  insert into invoices (
    number, series, seq, issued_on, patient_id, appointment_id,
    customer_name, customer_tax_id, customer_address, customer_postal_code,
    payment_method, observations, tax_rate, subtotal, tax, total
  ) values (
    format('%s-%s-%s', p_series, lpad(v_seq::text, 4, '0'), extract(year from p_issued_on)),
    p_series, v_seq, p_issued_on, p_patient_id, p_appointment_id,
    p_customer_name, p_customer_tax_id, p_customer_address, p_customer_postal_code,
    p_payment_method, p_observations, v_tax_rate, v_subtotal, v_total - v_subtotal, v_total
  ) returning id into v_invoice_id;

  insert into invoice_items (invoice_id, position, description, amount, treatment_id)
  select v_invoice_id, ordinality, item->>'description', (item->>'amount')::numeric, item->>'treatment_id'
  from jsonb_array_elements(p_items) with ordinality as item;

  return v_invoice_id;
end;
$$;

-- Postgres da EXECUTE a PUBLIC por defecto y PostgREST expone las funciones de
-- public: sin este revoke cualquiera con la anon key podría emitir facturas.
revoke execute on function create_invoice(text, date, uuid, uuid, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;

-- ── Storage: plantilla PDF ────────────────────────────────────────────────
-- formulario.pdf (la plantilla AcroForm de PdfFormFiller) no va en el repo,
-- que es público y la plantilla lleva el NIF de la clínica. Se sube a mano a
-- este bucket privado: Storage → invoice-templates → formulario.pdf

insert into storage.buckets (id, name, public)
values ('invoice-templates', 'invoice-templates', false)
on conflict (id) do nothing;

-- ── Seed: tratamientos reales de Clínica AestheticA (fuente: Booksy) ───────
-- Mismos datos que MOCK_TREATMENTS en apps/web/src/services/treatmentService.ts,
-- para que el paso de mock -> Supabase sea transparente (mismos ids/nombres/precios).

insert into treatments (id, name, category, description, duration_min, price_eur, is_active, image_url) values
  ('f1', 'Limpieza Facial Básica', 'facial', 'Limpieza profunda con extracción de impurezas para piel fresca y equilibrada.', 60, 65, true, null),
  ('f2', 'Hydroface Plus — Limpieza Profunda Avanzada', 'facial', 'Limpieza avanzada con hidrodermabrasión para una piel renovada y luminosa.', 90, 109, true, null),
  ('f3', 'Microdermabrasión con Punta de Diamante', 'facial', 'Exfoliación mecánica que elimina células muertas y estimula la renovación celular.', 60, 54, true, null),
  ('f4', 'Limpieza Facial Hombre con Microdermoabrasión', 'facial', 'Tratamiento adaptado a la piel masculina con limpieza y microdermoabrasión.', 75, 75, true, null),
  ('f5', 'Facial Premium Maria Galland [Skin]Biosis', 'facial', 'Tratamiento de alta gama con la exclusiva tecnología [Skin]Biosis de Maria Galland.', 90, 129, true, null),
  ('f6', 'Fotorejuvenecimiento LPL', 'facial', 'Luz pulsada de última generación para reducir manchas, rojeces y signos de envejecimiento.', 50, 110, true, null),
  ('f7', 'Hollywood Peeling Láser ND-YAG', 'facial', 'Peeling de carbono con láser ND-YAG para poros dilatados, acné y luminosidad instantánea.', 30, 120, true, null),
  ('f8', 'Radiofrecuencia con Vitaminas', 'facial', 'Combinación de radiofrecuencia y vitaminas para tensar y revitalizar la piel.', 30, 70, true, null),
  ('f9', 'Radiofrecuencia con Mascarilla Alginato', 'facial', 'Radiofrecuencia reafirmante combinada con mascarilla de alginato calmante y nutritiva.', 30, 75, true, null),
  ('f10', 'Hydro Kiss', 'facial', 'Tratamiento de hidratación intensa con ácido hialurónico para una piel jugosa y tersa.', 90, 55, true, null),
  ('f11', 'Masaje Lifting Miofascial', 'facial', 'Técnica manual que trabaja el tejido miofascial para un efecto lifting natural.', 30, 40, true, null),
  ('f12', 'Microneedling con Cóctel Vitamínico', 'facial', 'Microagujas que estimulan el colágeno e introducen activos en profundidad.', 30, 150, true, null),
  ('f13', 'Peeling Dermatology Facial', 'facial', 'Peeling médico que renueva la piel y mejora manchas, acné y textura irregular.', 30, 90, true, null),
  ('f14', 'Enzimoterapia', 'facial', 'Exfoliación enzimática suave que purifica y regenera sin agredir la piel sensible.', 30, 69, true, null),
  ('f15', 'Carboxiterapia Facial', 'facial', 'Microinyecciones de CO₂ para mejorar la circulación, reducir ojeras y rejuvenecer.', 30, 55, true, null),
  ('f16', 'Presoterapia Ocular', 'facial', 'Masaje por presión en la zona ocular para drenar bolsas y reducir fatiga visual.', 30, 20, true, null),
  ('c1', 'Presoterapia Terapéutica Alta Gama', 'corporal', 'Drenaje linfático por presión de alta gama para piernas cansadas y retención de líquidos.', 30, 25, true, null),
  ('c2', 'Presoterapia Corporal y Ocular', 'corporal', 'Sesión combinada de presoterapia corporal y ocular para un drenaje completo.', 30, 30, true, null),
  ('c3', 'Masaje Completo Integral (60 min)', 'corporal', 'Masaje integral de cuerpo completo que trabaja la musculatura y libera tensiones.', 60, 65, true, null),
  ('c4', 'Masaje Completo Integral (90 min)', 'corporal', 'Versión extendida del masaje integral para una relajación muscular profunda.', 90, 75, true, null),
  ('c5', 'Masaje Relajante con Aromaterapia', 'corporal', 'Masaje suave con aceites esenciales para reducir el estrés y mejorar el bienestar.', 45, 60, true, null),
  ('c6', 'Abdomen de Acero Estándar', 'corporal', 'Tratamiento de tonificación abdominal con tecnología de electroestimulación.', 60, 50, true, null),
  ('c7', 'Abdomen de Acero Premium', 'corporal', 'Sesión premium de tonificación abdominal de mayor duración y mayor intensidad.', 90, 60, true, null),
  ('c8', 'Body Sculpture con Presoterapia', 'corporal', 'Modelado corporal que combina tecnología reductora con drenaje linfático.', 80, 80, true, null),
  ('c9', 'Mesoterapia Corporal', 'corporal', 'Microinyecciones con activos lipolíticos para reducir celulitis y grasa localizada.', 30, 55, true, null),
  ('c10', 'Peeling Corporal con Hidratación', 'corporal', 'Exfoliación corporal seguida de hidratación intensa para una piel suave y uniforme.', 75, 50, true, null),
  ('l1', 'Depilación Láser (zona)', 'laser', 'Depilación definitiva por zonas con tecnología láser de última generación.', 30, 119, true, null),
  ('l2', 'Depilación Láser Diodo — Mujer Cuerpo Completo', 'laser', 'Sesión de depilación láser de diodo para cuerpo completo, la solución más eficaz.', 45, 599, true, null),
  ('l3', 'Depilación Láser Diodo — Hombre Cuerpo Completo', 'laser', 'Depilación láser de diodo adaptada a la piel y el vello masculino, cuerpo completo.', 60, 699, true, null),
  ('l4', 'Depilación con LPL Luz Pulsada', 'laser', 'Luz pulsada de alta eficacia para reducción progresiva del vello en todo tipo de zonas.', 30, 55, true, null),
  ('cap1', 'Mesoterapia Capilar (bono 12 sesiones)', 'capilar', 'Bono de 12 sesiones de mesoterapia capilar para frenar la caída y densificar el cabello.', 90, 950, true, null),
  ('b1', 'Bono Futura Mamá', 'bienestar', 'Tratamiento especialmente diseñado para el bienestar de la mamá durante el embarazo.', 90, 75, true, null),
  ('b2', 'Pack Belleza para Novias — Estándar', 'bienestar', 'Pack completo de tratamientos para que la novia luzca perfecta en su gran día.', 30, 499, true, null),
  ('b3', 'Pack Belleza para Novias — Premium', 'bienestar', 'Versión premium del pack nupcial con tratamientos exclusivos de mayor profundidad.', 90, 699, true, null),
  ('b4', 'Momento de Bienestar para Dos', 'bienestar', 'Experiencia de relajación compartida, ideal para regalar o disfrutar en pareja.', 45, 99, true, null),
  ('b5', 'Ritual de Relax para Dos', 'bienestar', 'Ritual de bienestar extendido para dos personas con masaje y tratamiento facial.', 105, 199, true, null),
  ('b6', 'Tarjeta de Regalo', 'bienestar', 'Regala una experiencia única en Clínica AestheticA a quien más quieras.', 60, 60, true, null)
on conflict (id) do nothing;
