import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyStaffSession } from '@/lib/dal'
import { InviteStaffDialog } from './invite-staff-dialog'
import { StaffTable, type StaffMember } from './staff-table'

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const { userId } = await verifyStaffSession()

  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) throw new Error(error.message)

  const members: StaffMember[] = data.users
    .map((user) => ({
      id: user.id,
      email: user.email ?? '(sin email)',
      confirmed: !!user.confirmed_at,
      createdAt: user.created_at,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff</h1>
        <InviteStaffDialog />
      </div>
      <StaffTable members={members} currentUserId={userId} />
    </div>
  )
}
