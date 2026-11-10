-- Notifica nuevas citas mediante un endpoint privado alojado en Vercel.
-- Las credenciales de webhook se guardan en Supabase Vault, nunca en SQL plano.
create extension if not exists pgcrypto;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create or replace function public.notify_new_booking()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url text;
  v_token text;
  v_timestamp text;
begin
  select decrypted_secret into v_url
  from vault.decrypted_secrets
  where name = 'booking_notification_url'
  limit 1;

  select decrypted_secret into v_token
  from vault.decrypted_secrets
  where name = 'booking_notification_secret'
  limit 1;

  if v_url is null or v_token is null then
    raise warning 'Booking notifications are not configured';
    return new;
  end if;

  v_timestamp := floor(extract(epoch from clock_timestamp()))::text;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Booking-Timestamp', v_timestamp,
      'X-Booking-Signature', encode(hmac(v_timestamp || '.' || new.id::text, v_token, 'sha256'), 'hex')
    ),
    body := jsonb_build_object('appointment_id', new.id)
  );
  return new;
exception when others then
  raise warning 'Could not enqueue booking notification';
  return new;
end;
$$;

revoke execute on function public.notify_new_booking() from public, anon, authenticated;

drop trigger if exists appointments_notify_new_booking on public.appointments;
create trigger appointments_notify_new_booking
  after insert on public.appointments
  for each row execute function public.notify_new_booking();
