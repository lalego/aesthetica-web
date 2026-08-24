import { AppSidebar } from '@/components/app-sidebar'
import { verifyStaffSession } from '@/lib/dal'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email } = await verifyStaffSession()

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar userEmail={email} />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  )
}
