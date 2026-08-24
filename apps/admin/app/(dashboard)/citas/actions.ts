'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyStaffSession } from '@/lib/dal'

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export async function setAppointmentStatus(id: string, status: AppointmentStatus) {
  await verifyStaffSession()

  const { error } = await supabaseAdmin.from('appointments').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/citas')
}
