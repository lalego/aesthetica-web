'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifySession } from '@/lib/dal'

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export async function setAppointmentStatus(id: string, status: AppointmentStatus) {
  await verifySession()

  const { error } = await supabaseAdmin.from('appointments').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/citas')
}

export async function rescheduleAppointment(id: string, newScheduledAt: string) {
  await verifySession()

  const { data: current, error: fetchError } = await supabaseAdmin
    .from('appointments')
    .select('duration_min')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const newStart = new Date(newScheduledAt)
  const newEnd = new Date(newStart.getTime() + current.duration_min * 60_000)

  // Trae las citas activas de un margen amplio alrededor del nuevo hueco
  // (ningún tratamiento dura más de unas horas) y comprueba el solape en JS,
  // excluyéndose a sí misma.
  const windowStart = new Date(newStart.getTime() - 4 * 60 * 60_000).toISOString()
  const windowEnd = new Date(newStart.getTime() + 4 * 60 * 60_000).toISOString()

  const { data: nearby, error: nearbyError } = await supabaseAdmin
    .from('appointments')
    .select('id, scheduled_at, duration_min')
    .in('status', ['pending', 'confirmed'])
    .neq('id', id)
    .gte('scheduled_at', windowStart)
    .lte('scheduled_at', windowEnd)
  if (nearbyError) throw new Error(nearbyError.message)

  const overlaps = (nearby ?? []).some((appointment) => {
    const start = new Date(appointment.scheduled_at)
    const end = new Date(start.getTime() + appointment.duration_min * 60_000)
    return start < newEnd && end > newStart
  })

  if (overlaps) {
    throw new Error('Ese hueco se solapa con otra cita.')
  }

  const { error } = await supabaseAdmin
    .from('appointments')
    .update({ scheduled_at: newStart.toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/citas')
}
