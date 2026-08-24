'use client'

import { useState, useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { setAppointmentStatus, type AppointmentStatus } from './actions'

export interface AppointmentRow {
  id: string
  scheduled_at: string
  duration_min: number
  status: AppointmentStatus
  notes: string | null
  patients: { full_name: string; email: string; phone: string | null } | null
  treatments: { name: string } | null
}

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

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function AppointmentsTable({ appointments }: { appointments: AppointmentRow[] }) {
  if (appointments.length === 0) {
    return <p className="text-muted-foreground">Todavía no hay citas.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Paciente</TableHead>
          <TableHead>Tratamiento</TableHead>
          <TableHead>Notas</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <AppointmentRowItem key={appointment.id} appointment={appointment} />
        ))}
      </TableBody>
    </Table>
  )
}

function AppointmentRowItem({ appointment }: { appointment: AppointmentRow }) {
  const [status, setStatus] = useState(appointment.status)
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: string) => {
    const next = value as AppointmentStatus
    const previous = status
    setStatus(next)
    startTransition(async () => {
      try {
        await setAppointmentStatus(appointment.id, next)
      } catch {
        setStatus(previous)
      }
    })
  }

  return (
    <TableRow>
      <TableCell>{dateFormatter.format(new Date(appointment.scheduled_at))}</TableCell>
      <TableCell>
        <div className="font-medium">{appointment.patients?.full_name ?? '—'}</div>
        <div className="text-xs text-muted-foreground">
          {appointment.patients?.email}
          {appointment.patients?.phone ? ` · ${appointment.patients.phone}` : ''}
        </div>
      </TableCell>
      <TableCell>{appointment.treatments?.name ?? '—'}</TableCell>
      <TableCell className="max-w-56 truncate text-muted-foreground">
        {appointment.notes ?? '—'}
      </TableCell>
      <TableCell>
        <Select value={status} onValueChange={handleChange} disabled={isPending}>
          <SelectTrigger className="w-36">
            <SelectValue>
              <Badge variant={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  )
}
