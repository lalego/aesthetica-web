import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifySession } from '@/lib/dal'
import { InviteUserDialog } from './invite-user-dialog'
import { UsersTable, type Member } from './users-table'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const { userId } = await verifySession()

  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) throw new Error(error.message)

  const members: Member[] = data.users
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
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <InviteUserDialog />
      </div>
      <UsersTable members={members} currentUserId={userId} />
    </div>
  )
}
