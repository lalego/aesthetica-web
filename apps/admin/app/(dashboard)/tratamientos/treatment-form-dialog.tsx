'use client'

import { useState, useTransition } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Pencil, Plus, Loader2, Trash2 } from 'lucide-react'
import type { Treatment, TreatmentCategory, TreatmentVariant } from '@aesthetica/shared'
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
import { saveTreatment, uploadTreatmentImage } from './actions'

const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  facial: 'Facial',
  corporal: 'Corporal',
  laser: 'Láser',
  capilar: 'Capilar',
  bienestar: 'Bienestar',
}

interface TreatmentFormDialogProps {
  treatment?: Treatment
  triggerIcon?: ReactNode
  triggerLabel?: string
  triggerClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
  fullPage?: boolean
}

export function TreatmentFormDialog({ treatment, triggerIcon, triggerLabel, triggerClassName, open: controlledOpen, onOpenChange, hideTrigger, fullPage }: TreatmentFormDialogProps) {
  const isEdit = !!treatment
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
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
  const [imageUrls, setImageUrls] = useState<string[]>(treatment?.image_urls ?? (treatment?.image_url ? [treatment.image_url] : []))
  const [variants, setVariants] = useState<Array<Pick<TreatmentVariant, 'id' | 'name' | 'duration_min' | 'price_eur' | 'is_active'>>>(
    (treatment?.variants ?? []).map(({ id, name, duration_min, price_eur, is_active }) => ({ id, name, duration_min, price_eur, is_active }))
  )
  const [uploading, setUploading] = useState(false)

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
          image_urls: imageUrls,
          variants,
        })
        if (!fullPage) setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el tratamiento')
      }
    })
  }

  return (
    <Dialog open={fullPage || open} modal={!fullPage} onOpenChange={setOpen}>
      {!hideTrigger && <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon-sm" className={triggerClassName} aria-label={triggerLabel ?? 'Editar tratamiento'}>
            {triggerIcon ?? <Pencil />}
          </Button>
        ) : (
          <Button className={triggerClassName} aria-label={triggerLabel}>
            {triggerIcon ?? <Plus />}
            {!triggerIcon && 'Nuevo tratamiento'}
          </Button>
        )}
      </DialogTrigger>}
      <DialogContent inline={fullPage} hideOverlay={fullPage} hideClose={fullPage} className={fullPage ? '!block !relative !left-auto !top-auto !max-w-none !translate-x-0 !translate-y-0 -mx-4 -my-4 min-h-full w-[calc(100%+2rem)] overflow-visible rounded-none border-0 bg-[#f6f6f6] p-0 shadow-none md:-mx-6 md:-my-6 md:w-[calc(100%+3rem)]' : 'max-h-[90vh] overflow-y-auto'}>
        {fullPage && <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-5 md:px-8"><Link href="/tratamientos" className="inline-flex items-center gap-3 font-medium"><ArrowLeft className="size-5" />Editar tratamiento</Link><Button type="submit" form="treatment-form" disabled={isPending || uploading || variants.some((variant) => !variant.name.trim() || variant.duration_min < 1 || variant.price_eur < 0)} className="bg-neutral-900 px-8 text-white hover:bg-neutral-800">{isPending ? <Loader2 className="animate-spin" /> : 'GUARDAR'}</Button></div>}
        {!fullPage && <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tratamiento' : 'Nuevo tratamiento'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza los datos del tratamiento.'
              : 'Se añadirá al catálogo público en cuanto lo guardes como activo.'}
          </DialogDescription>
        </DialogHeader>}

        <form id="treatment-form" onSubmit={handleSubmit} className={fullPage ? 'my-0 w-full space-y-5 bg-background p-5 sm:p-7 md:p-9' : 'space-y-4'}>
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
              rows={9}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={10000}
              placeholder="Describe el protocolo, sus pasos y beneficios…"
            />
          </div>

          <div className="space-y-2">
            <Label>Fotos del tratamiento</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading || imageUrls.length >= 8} onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              event.target.value = ''
              if (!files.length) return
              if (imageUrls.length + files.length > 8) { setError('Puedes añadir hasta 8 fotos por tratamiento'); return }
              setError(null)
              setUploading(true)
              startTransition(async () => {
                try {
                  const urls: string[] = []
                  for (const file of files) {
                    const data = new FormData()
                    data.set('file', file)
                    urls.push(await uploadTreatmentImage(data))
                  }
                  setImageUrls((current) => [...current, ...urls])
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'No se pudieron subir las fotos')
                } finally {
                  setUploading(false)
                }
              })
            }} />
            <p className="text-xs text-muted-foreground">Hasta 8 fotos en JPG, PNG, WebP o AVIF; máximo 5 MB por imagen.</p>
            {imageUrls.length > 0 && <div className="grid grid-cols-4 gap-2">{imageUrls.map((url, index) => <div key={url} className="relative"><Image src={url} width={320} height={160} unoptimized alt={`Foto ${index + 1}`} className="h-20 w-full rounded-md object-cover" /><Button type="button" variant="destructive" size="icon-xs" className="absolute right-1 top-1" aria-label="Quitar foto" onClick={() => setImageUrls((current) => current.filter((item) => item !== url))}><Trash2 /></Button></div>)}</div>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between"><Label>Opciones de sesión y bonos</Label><Button type="button" variant="outline" size="sm" disabled={variants.length >= 20} onClick={() => setVariants((current) => [...current, { id: crypto.randomUUID(), name: '', duration_min: Number(durationMin) || 60, price_eur: 0, is_active: true }])}><Plus /> Añadir opción</Button></div>
            {variants.map((variant, index) => <div key={variant.id} className="grid grid-cols-12 gap-2 rounded-md border p-3">
              <div className="col-span-5 space-y-1"><Label>Nombre de opción</Label><Input value={variant.name} placeholder="1 sesión, bono de 5…" onChange={(event) => setVariants((items) => items.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} /></div>
              <div className="col-span-3 space-y-1"><Label>Minutos</Label><Input type="number" min={1} value={variant.duration_min} onChange={(event) => setVariants((items) => items.map((item, i) => i === index ? { ...item, duration_min: Number(event.target.value) } : item))} /></div>
              <div className="col-span-3 space-y-1"><Label>Precio €</Label><Input type="number" min={0} step="0.01" value={variant.price_eur} onChange={(event) => setVariants((items) => items.map((item, i) => i === index ? { ...item, price_eur: Number(event.target.value) } : item))} /></div>
              <div className="col-span-1 flex items-end"><Button type="button" variant="ghost" size="icon-sm" aria-label="Quitar opción" onClick={() => setVariants((items) => items.filter((_, i) => i !== index))}><Trash2 /></Button></div>
            </div>)}
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

          <DialogFooter className={fullPage ? 'justify-end' : undefined}>
            {!fullPage && <Button type="submit" disabled={isPending || uploading || variants.some((variant) => !variant.name.trim() || variant.duration_min < 1 || variant.price_eur < 0)}>
              {isPending && <Loader2 className="animate-spin" />}
              Guardar
            </Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
