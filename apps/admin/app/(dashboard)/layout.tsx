import { AppShell } from '@/components/app-shell'
import { verifySession } from '@/lib/dal'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email } = await verifySession()

  return <AppShell userEmail={email}>{children}</AppShell>
}
