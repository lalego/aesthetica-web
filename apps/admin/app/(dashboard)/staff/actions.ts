'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyStaffSession } from '@/lib/dal'

export type InviteStaffState = { error?: string; success?: string } | undefined

export async function inviteStaff(
  _prevState: InviteStaffState,
  formData: FormData
): Promise<InviteStaffState> {
  await verifyStaffSession()

  const email = String(formData.get('email') ?? '').trim()
  if (!email) {
    return { error: 'Introduce un email.' }
  }

  // Sin redirectTo: usa el Site URL configurado en Supabase Auth por defecto,
  // igual que al invitar desde el propio dashboard de Supabase.
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/staff')
  return { success: `Invitación enviada a ${email}.` }
}

export async function removeStaff(userId: string) {
  const session = await verifyStaffSession()

  if (userId === session.userId) {
    throw new Error('No puedes eliminar tu propia cuenta desde aquí.')
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/staff')
}
