'use client'

import { useState } from 'react'
import { Calendar, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppointmentsTable, type AppointmentRow } from './appointments-table'
import { WeekCalendar } from './week-calendar'

export function CitasView({ appointments }: { appointments: AppointmentRow[] }) {
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar')

  return (
    <div>
      <div className="mb-4 flex justify-end gap-1">
        <Button
          variant={mode === 'calendar' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('calendar')}
        >
          <Calendar />
          Calendario
        </Button>
        <Button
          variant={mode === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('list')}
        >
          <List />
          Lista
        </Button>
      </div>

      {mode === 'calendar' ? (
        <WeekCalendar appointments={appointments} />
      ) : (
        <AppointmentsTable appointments={appointments} />
      )}
    </div>
  )
}
