'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { rescheduleAppointment, setAppointmentStatus, type AppointmentStatus } from './actions'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    id: string
    scheduledAt: string
    status: AppointmentStatus
    patientName: string
    treatmentName: string
  }
}

// input[type=date]/[type=time] trabajan en hora local del navegador — como el
// staff está en España, esto ya coincide con la hora que quieren ver/editar.
function toDateInput(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toTimeInput(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function RescheduleDialog({ open, onOpenChange, appointment }: RescheduleDialogProps) {
  const [date, setDate] = useState(() => toDateInput(appointment.scheduledAt))
  const [time, setTime] = useState(() => toTimeInput(appointment.scheduledAt))
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    const newScheduledAt = new Date(`${date}T${time}:00`)

    if (Number.isNaN(newScheduledAt.getTime())) {
      setError('Fecha u hora no válidas.')
      return
    }

    startTransition(async () => {
      try {
        if (newScheduledAt.toISOString() !== appointment.scheduledAt) {
          await rescheduleAppointment(appointment.id, newScheduledAt.toISOString())
        }
        if (status !== appointment.status) {
          await setAppointmentStatus(appointment.id, status)
        }
        onOpenChange(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointment.patientName}</DialogTitle>
          <DialogDescription>{appointment.treatmentName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-date">Fecha</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-time">Hora</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reschedule-status">Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
              <SelectTrigger id="reschedule-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
