-- Facturación en apps/admin (sustituye a la app de consola PdfFormFiller).
-- Ejecutar entero en el SQL Editor del proyecto ya existente. Es idempotente.
-- supabase/schema.sql ya incluye estos cambios para proyectos nuevos.

-- ── patients: datos fiscales ──────────────────────────────────────────────
-- Los clientes históricos de PdfFormFiller no tienen email, así que deja de
-- ser obligatorio (el unique sigue valiendo: Postgres permite varios null).
-- submit_booking() sigue haciendo upsert por email igual que antes.

alter table patients alter column email drop not null;
alter table patients add column if not exists tax_id text;
alter table patients add column if not exists address text;
alter table patients add column if not exists postal_code text;

create unique index if not exists patients_tax_id_key on patients (tax_id) where tax_id is not null;

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
