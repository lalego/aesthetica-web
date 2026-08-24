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
  email text not null unique,
  phone text,
  gdpr_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table patients enable row level security;

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

  insert into appointments (patient_id, treatment_id, scheduled_at, duration_min, status, notes)
  values (v_patient_id, p_treatment_id, p_scheduled_at, v_duration_min, 'pending', p_notes)
  returning id into v_appointment_id;

  return v_appointment_id;
end;
$$;

grant execute on function submit_booking(text, text, text, text, timestamptz, text, boolean) to anon;

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
