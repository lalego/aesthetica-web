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
  // 1. Upsert paciente (por email)
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .upsert(
      {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        gdpr_consent: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (patientError) throw patientError

  // 2. Crear cita pendiente
  const scheduledAt = new Date(data.preferred_date)
  scheduledAt.setHours(10, 0, 0, 0) // hora por defecto: 10:00

  const { error: appointmentError } = await supabase.from('appointments').insert({
    patient_id: patient.id,
    treatment_id: data.treatment_id,
    scheduled_at: scheduledAt.toISOString(),
    duration_min: 60, // se actualizará desde el tratamiento real
    status: 'pending',
    notes: data.notes ?? null,
  })

  if (appointmentError) throw appointmentError
}
