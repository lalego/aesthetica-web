'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppointmentRow } from './appointments-table'
import { RescheduleDialog } from './reschedule-dialog'

const ROW_HEIGHT = 32 // px por franja de 30 min
const OPEN_HOUR = 10
const CLOSE_HOUR = 20 // Lun–Vie; Sábado cierra a las 18:00 (ver SAT_CLOSE_HOUR)
const SAT_CLOSE_HOUR = 18
const ROWS = ((CLOSE_HOUR - OPEN_HOUR) * 60) / 30 // 20 franjas de 30 min

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200',
  confirmed:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200',
  cancelled: 'border-border bg-muted text-muted-foreground line-through',
  completed: 'border-border bg-secondary text-secondary-foreground',
}

function startOfWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay() // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function daysBetween(a: Date, b: Date) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcB - utcA) / 86_400_000)
}

const timeFormatter = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' })

export function WeekCalendar({ appointments }: { appointments: AppointmentRow[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [selected, setSelected] = useState<AppointmentRow | null>(null)

  const days = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        return d
      }),
    [weekStart]
  )

  const blocksByDay = useMemo(() => {
    const byDay: { appointment: AppointmentRow; top: number; height: number }[][] = [
      [],
      [],
      [],
      [],
      [],
      [],
    ]

    for (const appointment of appointments) {
      const start = new Date(appointment.scheduled_at)
      const dayIndex = daysBetween(weekStart, start)
      if (dayIndex < 0 || dayIndex > 5) continue

      const minutesFromOpen = (start.getHours() - OPEN_HOUR) * 60 + start.getMinutes()
      const totalMinutes = (CLOSE_HOUR - OPEN_HOUR) * 60
      if (minutesFromOpen < 0 || minutesFromOpen >= totalMinutes) continue

      const top = (minutesFromOpen / 30) * ROW_HEIGHT
      const height = Math.max((appointment.duration_min / 30) * ROW_HEIGHT, ROW_HEIGHT)

      byDay[dayIndex].push({ appointment, top, height })
    }

    return byDay
  }, [appointments, weekStart])

  const goToWeek = (offsetDays: number) => {
    setWeekStart((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + offsetDays)
      return next
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={() => goToWeek(-7)} aria-label="Semana anterior">
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
          Hoy
        </Button>
        <Button variant="outline" size="icon-sm" onClick={() => goToWeek(7)} aria-label="Semana siguiente">
          <ChevronRight />
        </Button>
        <span className="ml-2 text-sm text-muted-foreground">
          {days[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} –{' '}
          {days[5].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="flex overflow-x-auto rounded-lg border">
        {/* Columna de horas */}
        <div className="w-14 shrink-0 border-r">
          <div className="h-9 border-b" />
          {Array.from({ length: ROWS }, (_, i) => (
            <div
              key={i}
              className="border-b text-right text-xs text-muted-foreground"
              style={{ height: ROW_HEIGHT }}
            >
              {i % 2 === 0 && <span className="pr-1.5">{OPEN_HOUR + i / 2}:00</span>}
            </div>
          ))}
        </div>

        {/* Columnas de días */}
        {days.map((day, dayIndex) => {
          const isSaturday = dayIndex === 5
          const closedFromRow = isSaturday ? ((SAT_CLOSE_HOUR - OPEN_HOUR) * 60) / 30 : ROWS

          return (
            <div key={dayIndex} className="min-w-32 flex-1 border-r last:border-r-0">
              <div className="flex h-9 items-center justify-center border-b text-sm font-medium">
                {DAY_LABELS[dayIndex]} {day.getDate()}
              </div>
              <div className="relative" style={{ height: ROWS * ROW_HEIGHT }}>
                {Array.from({ length: ROWS }, (_, i) => (
                  <div
                    key={i}
                    className={i >= closedFromRow ? 'border-b bg-muted/50' : 'border-b'}
                    style={{ height: ROW_HEIGHT }}
                  />
                ))}

                {blocksByDay[dayIndex].map(({ appointment, top, height }) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => setSelected(appointment)}
                    className={`absolute inset-x-0.5 overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-xs leading-tight ${STATUS_STYLES[appointment.status]}`}
                    style={{ top, height }}
                  >
                    <div className="truncate font-medium">
                      {timeFormatter.format(new Date(appointment.scheduled_at))}{' '}
                      {appointment.patients?.full_name ?? '—'}
                    </div>
                    <div className="truncate opacity-80">{appointment.treatments?.name ?? '—'}</div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {appointments.length === 0 && (
        <p className="mt-4 text-muted-foreground">Todavía no hay citas.</p>
      )}

      {selected && (
        <RescheduleDialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
          appointment={{
            id: selected.id,
            scheduledAt: selected.scheduled_at,
            status: selected.status,
            patientName: selected.patients?.full_name ?? '—',
            treatmentName: selected.treatments?.name ?? '—',
          }}
        />
      )}
    </div>
  )
}
