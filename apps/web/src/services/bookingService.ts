import { supabase } from '@/lib/supabase'

export interface BookingFormData {
  name: string
  email: string
  phone: string
  treatment_id: string
  preferred_date: string
  notes?: string
  gdpr_consent: true
}

export const submitBooking = async (data: BookingFormData): Promise<void> => {
  const scheduledAt = new Date(data.preferred_date)
  scheduledAt.setHours(10, 0, 0, 0) // hora por defecto: 10:00

  // Upsert de paciente + creación de cita 'pending' en una sola transacción,
  // vía RPC (ver supabase/schema.sql: submit_booking). patients/appointments
  // no tienen políticas RLS para anon, así que este es el único camino de escritura.
  const { error } = await supabase.rpc('submit_booking', {
    p_name: data.name,
    p_email: data.email,
    p_phone: data.phone,
    p_treatment_id: data.treatment_id,
    p_scheduled_at: scheduledAt.toISOString(),
    p_notes: data.notes ?? null,
    p_gdpr_consent: data.gdpr_consent,
  })

  if (error) throw error
}
