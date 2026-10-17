'use client'

import { useState, useTransition } from 'react'
import { FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  INVOICE_SERIES,
  MAX_INVOICE_ITEMS,
  computeTotals,
  formatEuro,
  seriesForCategory,
  type BillingPatient,
  type BillingTreatment,
  type InvoiceSeries,
} from '@/lib/invoices'
import { createInvoice } from './actions'

// Radix Select no admite value="" en un SelectItem.
const FREE_LINE = '__free'

interface LineState {
  treatmentId: string
  description: string
  amount: string
}

const emptyLine = (): LineState => ({ treatmentId: FREE_LINE, description: '', amount: '' })

export interface InvoiceAppointmentPreset {
  id: string
  patientId: string
  treatmentId: string
  date: string // YYYY-MM-DD
}

interface InvoiceFormDialogProps {
  patients: BillingPatient[]
  treatments: BillingTreatment[]
  /** Si viene, la factura se crea desde esa cita: paciente fijo y primera línea precargada. */
  appointment?: InvoiceAppointmentPreset
}

function TreatmentGroup({ label, treatments }: { label: string; treatments: BillingTreatment[] }) {
  if (treatments.length === 0) return null
  return (
    <>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>{label}</SelectLabel>
        {treatments.map((treatment) => (
          <SelectItem key={treatment.id} value={treatment.id}>
            {treatment.name}
            {treatment.price_eur != null ? ` · ${formatEuro(treatment.price_eur)}` : ''}
          </SelectItem>
        ))}
      </SelectGroup>
    </>
  )
}

function todayInMadrid() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date())
}

function lineFromTreatment(treatment: BillingTreatment | undefined): LineState {
  if (!treatment) return emptyLine()
  return {
    treatmentId: treatment.id,
    description: treatment.name,
    amount: treatment.price_eur != null ? String(treatment.price_eur) : '',
  }
}

export function InvoiceFormDialog({ patients, treatments, appointment }: InvoiceFormDialogProps) {
  const treatmentById = new Map(treatments.map((t) => [t.id, t]))
  const presetTreatment = appointment ? treatmentById.get(appointment.treatmentId) : undefined

  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [patientId, setPatientId] = useState(appointment?.patientId ?? '')
  const [customerName, setCustomerName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [issuedOn, setIssuedOn] = useState(appointment?.date ?? todayInMadrid())
  const [series, setSeries] = useState<InvoiceSeries>(
    presetTreatment ? seriesForCategory(presetTreatment.category) : 'F'
  )
  const [lines, setLines] = useState<LineState[]>([lineFromTreatment(presetTreatment)])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [observations, setObservations] = useState('')

  const fillCustomer = (id: string) => {
    const patient = patients.find((p) => p.id === id)
    setPatientId(id)
    setCustomerName(patient?.full_name ?? '')
    setTaxId(patient?.tax_id ?? '')
    setAddress(patient?.address ?? '')
    setPostalCode(patient?.postal_code ?? '')
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && appointment) fillCustomer(appointment.patientId)
    if (next) setError(null)
  }

  const updateLine = (index: number, patch: Partial<LineState>) => {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  const handleTreatmentChange = (index: number, value: string) => {
    const treatment = treatmentById.get(value)
    updateLine(index, treatment ? lineFromTreatment(treatment) : { treatmentId: FREE_LINE })
    if (index === 0 && treatment) setSeries(seriesForCategory(treatment.category))
  }

  const amounts = lines.map((line) => Number(line.amount.replace(',', '.')) || 0)
  const totals = computeTotals(amounts)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!patientId) {
      setError('Elige un paciente')
      return
    }

    startTransition(async () => {
      try {
        await createInvoice({
          series,
          issued_on: issuedOn,
          patient_id: patientId,
          appointment_id: appointment?.id ?? null,
          customer_name: customerName,
          customer_tax_id: taxId,
          customer_address: address,
          customer_postal_code: postalCode,
          payment_method: paymentMethod,
          observations,
          items: lines.map((line, i) => ({
            description: line.description,
            amount: amounts[i],
            treatment_id: line.treatmentId === FREE_LINE ? null : line.treatmentId,
          })),
        })
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo crear la factura')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {appointment ? (
          <Button variant="outline" size="sm">
            <FileText />
            Facturar
          </Button>
        ) : (
          <Button>
            <Plus />
            Nueva factura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Facturar cita' : 'Nueva factura'}</DialogTitle>
          <DialogDescription>
            El número se asigna al guardar y no se puede cambiar. Los importes llevan el IVA
            (21%) incluido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="patient">Paciente</Label>
              <Select value={patientId} onValueChange={fillCustomer} disabled={!!appointment}>
                <SelectTrigger id="patient" className="w-full">
                  <SelectValue placeholder="Elige un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                      {patient.tax_id ? ` · ${patient.tax_id}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issued-on">Fecha</Label>
              <Input
                id="issued-on"
                type="date"
                value={issuedOn}
                onChange={(e) => setIssuedOn(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="series">Serie</Label>
              <Select value={series} onValueChange={(v) => setSeries(v as InvoiceSeries)}>
                <SelectTrigger id="series" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_SERIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <fieldset className="grid grid-cols-2 gap-4" disabled={!patientId}>
            <div className="space-y-1.5">
              <Label htmlFor="customer-name">Nombre en la factura</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax-id">DNI / NIF</Label>
              <Input
                id="tax-id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Vacío → PENDIENTE-IDENTIFICAR"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postal-code">Código postal</Label>
              <Input
                id="postal-code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label>Líneas</Label>
            {lines.map((line, index) => (
              <div key={index} className="grid grid-cols-[12rem_1fr_6rem_auto] gap-2">
                <Select
                  value={line.treatmentId}
                  onValueChange={(v) => handleTreatmentChange(index, v)}
                >
                  <SelectTrigger className="w-full" aria-label="Tratamiento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FREE_LINE}>Concepto libre</SelectItem>
                    <TreatmentGroup
                      label="Catálogo web"
                      treatments={treatments.filter((t) => t.is_active)}
                    />
                    <TreatmentGroup
                      label="Solo facturación (no visibles en la web)"
                      treatments={treatments.filter((t) => !t.is_active)}
                    />
                  </SelectContent>
                </Select>
                <Input
                  aria-label="Descripción"
                  value={line.description}
                  onChange={(e) => updateLine(index, { description: e.target.value })}
                  placeholder="Descripción"
                  required
                />
                <Input
                  aria-label="Importe con IVA"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={line.amount}
                  onChange={(e) => updateLine(index, { amount: e.target.value })}
                  placeholder="€"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Quitar línea"
                  disabled={lines.length === 1}
                  onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {lines.length < MAX_INVOICE_ITEMS && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLines((current) => [...current, emptyLine()])}
              >
                <Plus />
                Añadir línea
              </Button>
            )}
          </div>

          <dl className="ml-auto w-56 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Base imponible</dt>
              <dd>{formatEuro(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>IVA (21%)</dt>
              <dd>{formatEuro(totals.tax)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{formatEuro(totals.total)}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="payment-method">Forma de pago</Label>
              <Input
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Tarjeta, efectivo, Bizum…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Emitir factura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
