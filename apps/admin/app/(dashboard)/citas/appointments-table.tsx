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
import type { BillingTreatment } from '@/lib/invoices'
import { InvoiceFormDialog } from '../facturas/invoice-form-dialog'
import { setAppointmentStatus, type AppointmentStatus } from './actions'

interface AppointmentInvoice {
  id: string
  number: string
}

export interface AppointmentRow {
  id: string
  scheduled_at: string
  duration_min: number
  status: AppointmentStatus
  notes: string | null
  patient_id: string
  treatment_id: string
  patients: {
    full_name: string
    email: string | null
    phone: string | null
    tax_id: string | null
    address: string | null
    postal_code: string | null
  } | null
  treatments: { name: string } | null
  // invoices.appointment_id es unique: PostgREST lo devuelve como objeto, pero
  // según la versión puede llegar como array de 0–1 elementos.
  invoices: AppointmentInvoice | AppointmentInvoice[] | null
}

function invoiceOf(appointment: AppointmentRow): AppointmentInvoice | null {
  const { invoices } = appointment
  return Array.isArray(invoices) ? (invoices[0] ?? null) : invoices
}

const madridDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' })

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

interface AppointmentsTableProps {
  appointments: AppointmentRow[]
  treatments: BillingTreatment[]
}

export function AppointmentsTable({ appointments, treatments }: AppointmentsTableProps) {
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
          <TableHead>Factura</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <AppointmentRowItem
            key={appointment.id}
            appointment={appointment}
            treatments={treatments}
          />
        ))}
      </TableBody>
    </Table>
  )
}

interface AppointmentRowItemProps {
  appointment: AppointmentRow
  treatments: BillingTreatment[]
}

function AppointmentRowItem({ appointment, treatments }: AppointmentRowItemProps) {
  const invoice = invoiceOf(appointment)
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
      <TableCell>
        {invoice ? (
          <a
            href={`/facturas/${invoice.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium tabular-nums underline-offset-4 hover:underline"
          >
            {invoice.number}
          </a>
        ) : status === 'completed' && appointment.patients ? (
          <InvoiceFormDialog
            patients={[{ id: appointment.patient_id, ...appointment.patients }]}
            treatments={treatments}
            appointment={{
              id: appointment.id,
              patientId: appointment.patient_id,
              treatmentId: appointment.treatment_id,
              date: madridDate.format(new Date(appointment.scheduled_at)),
            }}
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}
