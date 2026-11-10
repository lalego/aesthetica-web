import Link from 'next/link'
import { CalendarCheck, Clock, Euro, Users, type LucideIcon } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatEuro } from '@/lib/invoices'
import { Badge } from '@/components/ui/badge'
import type { AppointmentStatus } from '../citas/actions'

export const dynamic = 'force-dynamic'

const madridDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' })
const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Madrid',
})
const dayFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Europe/Madrid',
})
const issuedFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeZone: 'UTC' })
const todayFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'Europe/Madrid' })

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

const STATUS_BADGE: Record<AppointmentStatus, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
  completed: 'secondary',
}

interface UpcomingAppointment {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  patients: { full_name: string } | null
  treatments: { name: string } | null
}

interface RecentInvoice {
  id: string
  number: string
  issued_on: string
  customer_name: string
  total: number
}

export default async function InicioPage() {
  const now = new Date()
  const today = madridDate.format(now)
  const monthStart = `${today.slice(0, 7)}-01`
  // Margen de un día hacia atrás: "hoy" se decide después en hora de Madrid.
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const [appointments, monthInvoices, patients, newPatients, recentInvoices] = await Promise.all([
    supabaseAdmin
      .from('appointments')
      .select('id, scheduled_at, status, patients(full_name), treatments(name)')
      .gte('scheduled_at', since)
      .neq('status', 'cancelled')
      .order('scheduled_at', { ascending: true }),
    supabaseAdmin.from('invoices').select('total').gte('issued_on', monthStart),
    supabaseAdmin.from('patients').select('id', { count: 'exact', head: true }),
    supabaseAdmin
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart),
    supabaseAdmin
      .from('invoices')
      .select('id, number, issued_on, customer_name, total')
      .order('seq', { ascending: false })
      .limit(5),
  ])

  const error =
    appointments.error ?? monthInvoices.error ?? patients.error ?? newPatients.error ?? recentInvoices.error
  if (error) throw new Error(error.message)

  const all = (appointments.data ?? []) as unknown as UpcomingAppointment[]
  const todays = all.filter(({ scheduled_at }) => madridDate.format(new Date(scheduled_at)) === today)
  const upcoming = all.filter(({ scheduled_at }) => new Date(scheduled_at) >= now)
  const pending = upcoming.filter(({ status }) => status === 'pending')
  const monthTotal = (monthInvoices.data ?? []).reduce((sum, { total }) => sum + Number(total), 0)
  const monthCount = monthInvoices.data?.length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Inicio</h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">{todayFormatter.format(now)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Citas hoy"
          value={String(todays.length)}
          hint={todays.length === 1 ? '1 cita sin cancelar' : `${todays.length} citas sin cancelar`}
          href="/citas"
        />
        <StatCard
          icon={Clock}
          label="Por confirmar"
          value={String(pending.length)}
          hint="Próximas citas pendientes"
          href="/citas"
        />
        <StatCard
          icon={Euro}
          label="Facturado este mes"
          value={formatEuro(monthTotal)}
          hint={monthCount === 1 ? '1 factura' : `${monthCount} facturas`}
          href="/facturas"
        />
        <StatCard
          icon={Users}
          label="Pacientes"
          value={String(patients.count ?? 0)}
          hint={`${newPatients.count ?? 0} nuevos este mes`}
          href="/pacientes"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Próximas citas" href="/citas">
          {upcoming.length === 0 ? (
            <Empty>No hay citas próximas.</Empty>
          ) : (
            upcoming.slice(0, 6).map((appointment) => {
              const date = new Date(appointment.scheduled_at)
              return (
                <li key={appointment.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-20 shrink-0 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{timeFormatter.format(date)}</div>
                    {dayFormatter.format(date)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{appointment.patients?.full_name ?? '—'}</div>
                    <div className="truncate text-xs text-muted-foreground">{appointment.treatments?.name ?? '—'}</div>
                  </div>
                  <Badge variant={STATUS_BADGE[appointment.status]}>{STATUS_LABELS[appointment.status]}</Badge>
                </li>
              )
            })
          )}
        </Panel>

        <Panel title="Últimas facturas" href="/facturas">
          {(recentInvoices.data ?? []).length === 0 ? (
            <Empty>Todavía no hay facturas.</Empty>
          ) : (
            ((recentInvoices.data ?? []) as RecentInvoice[]).map((invoice) => (
              <li key={invoice.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{invoice.customer_name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {invoice.number} · {issuedFormatter.format(new Date(invoice.issued_on))}
                  </div>
                </div>
                <div className="text-sm font-medium tabular-nums">{formatEuro(Number(invoice.total))}</div>
              </li>
            ))
          )}
        </Panel>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  href: string
}

function StatCard({ icon: Icon, label, value, hint, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-ring"
    >
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-sidebar-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </Link>
  )
}

interface PanelProps {
  title: string
  href: string
  children: React.ReactNode
}

function Panel({ title, href, children }: PanelProps) {
  return (
    <section className="rounded-xl border bg-card shadow-xs">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={href} className="text-xs text-primary hover:underline">
          Ver todo
        </Link>
      </div>
      <ul className="divide-y px-4">{children}</ul>
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <li className="py-6 text-center text-sm text-muted-foreground">{children}</li>
}
