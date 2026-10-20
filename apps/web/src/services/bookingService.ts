import { supabase } from '@/lib/supabase'

export interface BookingFormData {
  name: string
  email: string
  phone: string
  treatment_id: string
  preferred_date: string
  scheduled_at: string // ISO — hora exacta elegida entre los huecos libres
  notes?: string
  gdpr_consent: true
}

export const submitBooking = async (data: BookingFormData): Promise<void> => {
  // Upsert de paciente + creación de cita 'pending' en una sola transacción,
  // vía RPC (ver supabase/schema.sql: submit_booking). patients/appointments
  // no tienen políticas RLS para anon, así que este es el único camino de escritura.
  // submit_booking() vuelve a comprobar que el hueco sigue libre (carrera con
  // otro cliente reservando a la vez) — si no, lanza un error que se propaga aquí.
  const { error } = await supabase.rpc('submit_booking', {
    p_name: data.name,
    p_email: data.email,
    p_phone: data.phone,
    p_treatment_id: data.treatment_id,
    p_scheduled_at: data.scheduled_at,
    p_notes: data.notes ?? null,
    p_gdpr_consent: data.gdpr_consent,
  })

  if (error) throw error
}

// Mensaje del `raise exception` de submit_booking() cuando el hueco se ha
// ocupado entre que se cargaron los huecos libres y se envió el formulario.
const SLOT_TAKEN_MESSAGE = 'Ese hueco ya no está disponible'

/** El envío falló porque otra persona reservó esa hora antes (no es un fallo del sistema). */
export const isSlotTakenError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'message' in err &&
  String(err.message).includes(SLOT_TAKEN_MESSAGE)
