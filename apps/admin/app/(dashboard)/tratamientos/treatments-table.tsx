'use client'

import { useState, useTransition } from 'react'
import type { Treatment, TreatmentCategory } from '@aesthetica/shared'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { setTreatmentActive } from './actions'
import { TreatmentFormDialog } from './treatment-form-dialog'

const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  facial: 'Facial',
  corporal: 'Corporal',
  laser: 'Láser',
  capilar: 'Capilar',
  bienestar: 'Bienestar',
}

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export function TreatmentsTable({ treatments }: { treatments: Treatment[] }) {
  if (treatments.length === 0) {
    return <p className="text-muted-foreground">Todavía no hay tratamientos.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Duración</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {treatments.map((treatment) => (
          <TreatmentRow key={treatment.id} treatment={treatment} />
        ))}
      </TableBody>
    </Table>
  )
}

function TreatmentRow({ treatment }: { treatment: Treatment }) {
  const [isActive, setIsActive] = useState(treatment.is_active)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    setIsActive(checked)
    startTransition(async () => {
      try {
        await setTreatmentActive(treatment.id, checked)
      } catch {
        setIsActive(!checked)
      }
    })
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{treatment.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{CATEGORY_LABELS[treatment.category]}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{treatment.duration_min} min</TableCell>
      <TableCell className="text-muted-foreground">
        {treatment.price_eur != null ? eur.format(treatment.price_eur) : '—'}
      </TableCell>
      <TableCell>
        <Switch checked={isActive} onCheckedChange={handleToggle} disabled={isPending} />
      </TableCell>
      <TableCell>
        <TreatmentFormDialog treatment={treatment} />
      </TableCell>
    </TableRow>
  )
}
