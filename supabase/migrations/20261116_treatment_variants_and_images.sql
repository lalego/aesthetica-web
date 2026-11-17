-- Variantes reservables (sesiones/bonos) y galería pública de tratamientos.
-- Reejecutable: columnas, bucket, políticas, índices y upserts son idempotentes.

alter table treatments add column if not exists image_urls text[] not null default '{}';

create table if not exists treatment_variants (
  id uuid primary key default gen_random_uuid(),
  treatment_id text not null references treatments(id) on delete cascade,
  name text not null,
  duration_min integer not null check (duration_min > 0),
  price_eur numeric(10, 2) not null check (price_eur >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (treatment_id, name)
);
alter table treatment_variants enable row level security;
revoke all on treatment_variants from public, anon, authenticated;
grant select on treatment_variants to anon, authenticated;
grant all on treatment_variants to service_role;
drop policy if exists "treatment_variants_public_read_active" on treatment_variants;
create policy "treatment_variants_public_read_active"
  on treatment_variants for select to anon, authenticated
  using (is_active and exists (
    select 1 from treatments
    where treatments.id = treatment_variants.treatment_id and treatments.is_active
  ));

alter table appointments add column if not exists variant_id uuid references treatment_variants(id) on delete set null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('treatment-images', 'treatment-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Tarifas actuales y bonos tal como aparecen en Booksy. Se conservan los IDs
-- referenciados por citas, reservas e historial; los textos se pueden ajustar
-- desde el panel una vez aplicada esta migración.
update treatments set name = 'Higiene Facial Alta Cosmética', price_eur = 89 where id = 'f1';
update treatments set name = 'Hydroface Plus — Limpieza Profunda Avanzada', price_eur = 119 where id = 'f2';
update treatments set name = 'Microdermoabrasión con Punta de Diamante', price_eur = 54 where id = 'f3';
update treatments set name = 'Limpieza Facial Hombre con Microdermoabrasión', price_eur = 79 where id = 'f4';
update treatments set price_eur = 129 where id = 'f5';
update treatments set price_eur = 110 where id = 'f6';
update treatments set price_eur = 120 where id = 'f7';
update treatments set price_eur = 70 where id = 'f8';
update treatments set price_eur = 75 where id = 'f9';
update treatments set price_eur = 55 where id = 'f10';
update treatments set price_eur = 40.50 where id = 'f11';
update treatments set price_eur = 150 where id = 'f12';
update treatments set price_eur = 90 where id = 'f13';
update treatments set price_eur = 69 where id = 'f14';
update treatments set price_eur = 55 where id = 'f15';
update treatments set price_eur = 20 where id = 'f16';
update treatments set price_eur = 75 where id = 'b1';
update treatments set price_eur = 499 where id = 'b2';
update treatments set price_eur = 699 where id = 'b3';
update treatments set price_eur = 80 where id = 'b6';
update treatments set is_active = false where id = 'c4';
update treatments set is_active = false where id = 'l4';
insert into treatments (id, name, category, description, duration_min, price_eur, is_active, image_url)
values ('f17', 'IPL de Última Generación', 'facial', 'Tratamiento de luz pulsada para rejuvenecimiento facial, manchas, cuperosis, acné y arrugas. Bonos de cinco sesiones con descuento.', 90, 120, true, null)
on conflict (id) do update set name = excluded.name, category = excluded.category,
  description = excluded.description, duration_min = excluded.duration_min, price_eur = excluded.price_eur,
  is_active = true;
update treatments set price_eur = 29 where id = 'c1';
update treatments set price_eur = 35 where id = 'c2';
update treatments set price_eur = 70 where id = 'c3';
update treatments set price_eur = 80 where id = 'c4';
update treatments set name = 'Masaje Relajante con Aromaterapia', duration_min = 50, price_eur = 65 where id = 'c5';
update treatments set name = 'Abdomen de Acero Estándar', price_eur = 50 where id = 'c6';
update treatments set name = 'Abdomen de Acero Premium', price_eur = 60 where id = 'c7';
update treatments set price_eur = 80 where id = 'c8';
update treatments set price_eur = 55 where id = 'c9';
update treatments set price_eur = 50 where id = 'c10';
update treatments set name = 'Depilación láser por zona', price_eur = 20 where id = 'l1';
update treatments set name = 'Depilación láser diodo · mujer cuerpo completo', duration_min = 105, price_eur = 890 where id = 'l2';
update treatments set name = 'Depilación láser diodo · hombre cuerpo completo', duration_min = 60, price_eur = 1190 where id = 'l3';

insert into treatment_variants (treatment_id, name, duration_min, price_eur) values
  ('f3', 'Precio promocional', 60, 54), ('f3', 'Precio habitual', 60, 60),
  ('f6', '1 sesión', 50, 110), ('f6', 'Bono 3 sesiones', 90, 295), ('f6', 'Bono 5 sesiones', 90, 465),
  ('f7', '1 sesión', 30, 120), ('f7', 'Bono 3 sesiones', 90, 300),
  ('f17', 'Rejuvenecimiento · 1 sesión', 90, 120), ('f17', 'Rejuvenecimiento · 5 sesiones', 90, 480),
  ('f17', 'Manchas · 1 sesión', 90, 130), ('f17', 'Manchas · 5 sesiones', 90, 520),
  ('f17', 'Vascular/cuperosis · 1 sesión', 90, 140), ('f17', 'Vascular/cuperosis · 5 sesiones', 90, 560),
  ('f17', 'Acné/piel grasa · 1 sesión', 90, 110), ('f17', 'Acné/piel grasa · 5 sesiones', 90, 440),
  ('f17', 'Arrugas y estrías · 1 sesión', 90, 150), ('f17', 'Arrugas y estrías · 5 sesiones', 90, 600),
  ('f8', '1 sesión', 30, 70), ('f8', 'Bono 6 sesiones', 75, 378),
  ('f9', '1 sesión', 30, 75), ('f9', 'Bono 8 sesiones', 30, 405),
  ('f12', '1 sesión', 30, 150), ('f12', 'Bono 3 sesiones', 75, 350),
  ('f13', '1 sesión', 30, 90), ('f13', 'Bono 3 sesiones', 90, 250),
  ('f14', '1 sesión', 30, 69), ('f14', 'Bono 3 sesiones', 90, 180),
  ('f15', '1 sesión', 30, 55), ('f15', 'Bono 3 sesiones', 30, 140),
  ('c1', '1 sesión', 30, 29), ('c1', 'Bono 5 sesiones', 30, 119), ('c1', 'Bono 10 sesiones', 30, 209),
  ('c3', '1 hora', 60, 70), ('c3', '1 hora 30 min', 90, 80),
  ('c6', '1 sesión estándar', 60, 50), ('c6', 'Bono 5 sesiones estándar', 60, 240), ('c6', 'Bono 10 sesiones estándar', 60, 380),
  ('c7', '1 sesión premium', 90, 60), ('c7', 'Bono 5 sesiones premium', 90, 300), ('c7', 'Bono 10 sesiones premium', 90, 480),
  ('c8', '1 sesión', 80, 80), ('c8', 'Bono 5 sesiones', 80, 350), ('c8', 'Bono 10 sesiones', 80, 499),
  ('c9', '1 sesión', 30, 55), ('c9', 'Bono 3 sesiones', 30, 140), ('c9', 'Bono 5 sesiones', 30, 250),
  ('c10', 'Peeling corporal', 75, 50), ('c10', 'Peeling + masaje + mascarilla facial', 90, 69),
  ('cap1', 'Bono intensivo · 8 sesiones', 90, 750), ('cap1', 'Bono completo · 12 sesiones', 90, 950),
  ('b1', 'Bono 3 sesiones', 90, 250), ('b1', 'Bono 5 sesiones', 90, 350),
  ('b6', 'Tarjeta regalo · 1 hora', 60, 80), ('b6', 'Tarjeta regalo · 1 hora 30 min', 90, 100),
  ('l1', 'Zona mini mujer', 30, 20), ('l1', 'Zona pequeña mujer', 30, 40),
  ('l1', 'Zona mediana mujer', 30, 60), ('l1', 'Zona grande mujer', 30, 80), ('l1', 'Cuerpo completo mujer', 90, 140),
  ('l1', 'Zona mini hombre', 30, 30), ('l1', 'Zona pequeña hombre', 30, 60),
  ('l1', 'Zona mediana hombre', 30, 90), ('l1', 'Zona grande hombre', 30, 120), ('l1', 'Cuerpo completo hombre', 90, 180)
on conflict (treatment_id, name) do update set
  duration_min = excluded.duration_min, price_eur = excluded.price_eur, is_active = true;

-- Desactiva solo las opciones antiguas de estos tratamientos que ya no constan
-- en Booksy, sin borrar IDs que pudieran estar guardados en citas.
update treatment_variants set is_active = false
where (treatment_id, name) not in (
  select treatment_id, name from (values
    ('f3','Precio promocional'), ('f3','Precio habitual'), ('f6','1 sesión'), ('f6','Bono 3 sesiones'), ('f6','Bono 5 sesiones'),
    ('f7','1 sesión'), ('f7','Bono 3 sesiones'), ('f17','Rejuvenecimiento · 1 sesión'), ('f17','Rejuvenecimiento · 5 sesiones'),
    ('f17','Manchas · 1 sesión'), ('f17','Manchas · 5 sesiones'), ('f17','Vascular/cuperosis · 1 sesión'), ('f17','Vascular/cuperosis · 5 sesiones'),
    ('f17','Acné/piel grasa · 1 sesión'), ('f17','Acné/piel grasa · 5 sesiones'), ('f17','Arrugas y estrías · 1 sesión'), ('f17','Arrugas y estrías · 5 sesiones'),
    ('f8','1 sesión'), ('f8','Bono 6 sesiones'),
    ('f9','1 sesión'), ('f9','Bono 8 sesiones'), ('f12','1 sesión'), ('f12','Bono 3 sesiones'),
    ('f13','1 sesión'), ('f13','Bono 3 sesiones'), ('f14','1 sesión'), ('f14','Bono 3 sesiones'),
    ('f15','1 sesión'), ('f15','Bono 3 sesiones'), ('c1','1 sesión'), ('c1','Bono 5 sesiones'),
    ('c1','Bono 10 sesiones'), ('c3','1 hora'), ('c3','1 hora 30 min'), ('c6','1 sesión estándar'),
    ('c6','Bono 5 sesiones estándar'), ('c6','Bono 10 sesiones estándar'), ('c7','1 sesión premium'),
    ('c7','Bono 5 sesiones premium'), ('c7','Bono 10 sesiones premium'), ('c8','1 sesión'),
    ('c8','Bono 5 sesiones'), ('c8','Bono 10 sesiones'), ('c9','1 sesión'), ('c9','Bono 3 sesiones'),
    ('c9','Bono 5 sesiones'), ('c10','Peeling corporal'), ('c10','Peeling + masaje + mascarilla facial'),
    ('cap1','Bono intensivo · 8 sesiones'), ('cap1','Bono completo · 12 sesiones'), ('b1','Bono 3 sesiones'),
    ('b1','Bono 5 sesiones'), ('b6','Tarjeta regalo · 1 hora'), ('b6','Tarjeta regalo · 1 hora 30 min'),
    ('l1','Zona mini mujer'), ('l1','Zona pequeña mujer'), ('l1','Zona mediana mujer'), ('l1','Zona grande mujer'),
    ('l1','Cuerpo completo mujer'), ('l1','Zona mini hombre'), ('l1','Zona pequeña hombre'),
    ('l1','Zona mediana hombre'), ('l1','Zona grande hombre'), ('l1','Cuerpo completo hombre')
  ) as current(treatment_id, name)
  where current.treatment_id = treatment_variants.treatment_id and current.name = treatment_variants.name
) and treatment_id in ('f3','f6','f7','f17','f8','f9','f12','f13','f14','f15','c1','c3','c6','c7','c8','c9','c10','cap1','b1','b6','l1');

-- La firma cambia: elimina explícitamente la versión expuesta con una duración base.
drop function if exists submit_booking(text, text, text, text, timestamptz, text, boolean);
create function submit_booking(
  p_name text, p_email text, p_phone text, p_treatment_id text, p_variant_id uuid,
  p_scheduled_at timestamptz, p_notes text, p_gdpr_consent boolean
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_patient_id uuid; v_duration_min integer; v_appointment_id uuid;
begin
  if not p_gdpr_consent then raise exception 'gdpr_consent es obligatorio'; end if;
  if p_variant_id is null then
    select duration_min into v_duration_min from treatments where id = p_treatment_id and is_active;
  else
    select v.duration_min into v_duration_min from treatment_variants v
      join treatments t on t.id = v.treatment_id
      where v.id = p_variant_id and v.treatment_id = p_treatment_id and v.is_active and t.is_active;
  end if;
  if v_duration_min is null then raise exception 'tratamiento o variante inválidos o inactivos'; end if;
  insert into patients (full_name, email, phone, gdpr_consent, updated_at)
    values (p_name, p_email, p_phone, true, now())
    on conflict (email) do update set full_name = excluded.full_name, phone = excluded.phone,
      gdpr_consent = true, updated_at = now() returning id into v_patient_id;
  if exists (select 1 from appointments where status in ('pending','confirmed')
    and scheduled_at < p_scheduled_at + (v_duration_min || ' minutes')::interval
    and (scheduled_at + (duration_min || ' minutes')::interval) > p_scheduled_at)
  then raise exception 'Ese hueco ya no está disponible, elige otro.'; end if;
  insert into appointments (patient_id, treatment_id, variant_id, scheduled_at, duration_min, status, notes)
    values (v_patient_id, p_treatment_id, p_variant_id, p_scheduled_at, v_duration_min, 'pending', p_notes)
    returning id into v_appointment_id;
  return v_appointment_id;
end; $$;
revoke all on function submit_booking(text,text,text,text,uuid,timestamptz,text,boolean) from public, authenticated, anon;
grant execute on function submit_booking(text,text,text,text,uuid,timestamptz,text,boolean) to anon;

drop function if exists get_available_slots(date, text);
create function get_available_slots(p_date date, p_treatment_id text, p_variant_id uuid default null)
returns setof timestamptz language plpgsql security definer set search_path = public as $$
declare v_duration_min integer; v_dow integer; v_open time; v_close time; v_slot timestamptz; v_close_at timestamptz;
begin
  if p_variant_id is null then
    select duration_min into v_duration_min from treatments where id = p_treatment_id and is_active;
  else
    select v.duration_min into v_duration_min from treatment_variants v
      join treatments t on t.id = v.treatment_id
      where v.id = p_variant_id and v.treatment_id = p_treatment_id and v.is_active and t.is_active;
  end if;
  if v_duration_min is null then return; end if;
  v_dow := extract(dow from p_date);
  if v_dow = 0 then return; elsif v_dow = 6 then v_open := time '10:00'; v_close := time '18:00';
  else v_open := time '10:00'; v_close := time '20:00'; end if;
  v_slot := (p_date + v_open) at time zone 'Europe/Madrid';
  v_close_at := (p_date + v_close) at time zone 'Europe/Madrid';
  while v_slot + (v_duration_min || ' minutes')::interval <= v_close_at loop
    if v_slot > now() and not exists (select 1 from appointments where status in ('pending','confirmed')
      and scheduled_at < v_slot + (v_duration_min || ' minutes')::interval
      and (scheduled_at + (duration_min || ' minutes')::interval) > v_slot) then return next v_slot; end if;
    v_slot := v_slot + interval '30 minutes';
  end loop;
end; $$;
revoke all on function get_available_slots(date,text,uuid) from public, authenticated, anon;
grant execute on function get_available_slots(date,text,uuid) to anon;
