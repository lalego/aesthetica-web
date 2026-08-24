'use client'

import { useState, useTransition } from 'react'
import { Pencil, Plus, Loader2 } from 'lucide-react'
import type { Treatment, TreatmentCategory } from '@aesthetica/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { saveTreatment } from './actions'

const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  facial: 'Facial',
  corporal: 'Corporal',
  laser: 'Láser',
  capilar: 'Capilar',
  bienestar: 'Bienestar',
}

interface TreatmentFormDialogProps {
  treatment?: Treatment
}

export function TreatmentFormDialog({ treatment }: TreatmentFormDialogProps) {
  const isEdit = !!treatment
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(treatment?.name ?? '')
  const [category, setCategory] = useState<TreatmentCategory>(treatment?.category ?? 'facial')
  const [description, setDescription] = useState(treatment?.description ?? '')
  const [durationMin, setDurationMin] = useState(String(treatment?.duration_min ?? 60))
  const [priceEur, setPriceEur] = useState(
    treatment?.price_eur != null ? String(treatment.price_eur) : ''
  )
  const [isActive, setIsActive] = useState(treatment?.is_active ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await saveTreatment({
          id: treatment?.id,
          name,
          category,
          description,
          duration_min: Number(durationMin),
          price_eur: priceEur === '' ? null : Number(priceEur),
          is_active: isActive,
        })
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el tratamiento')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon-sm" aria-label="Editar tratamiento">
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus />
            Nuevo tratamiento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tratamiento' : 'Nuevo tratamiento'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza los datos del tratamiento.'
              : 'Se añadirá al catálogo público en cuanto lo guardes como activo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TreatmentCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration">Duración (min)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio (€)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                placeholder="Sin precio fijo"
              />
            </div>

            <div className="flex items-end pb-1.5">
              <Label htmlFor="is-active" className="gap-2">
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                Activo (visible en la web)
              </Label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
