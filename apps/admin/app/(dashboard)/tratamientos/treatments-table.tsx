'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Search } from 'lucide-react'
import type { Treatment, TreatmentCategory } from '@aesthetica/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { setTreatmentActive } from './actions'
import { TreatmentFormDialog } from './treatment-form-dialog'

const CATEGORIES: { id: string; label: string; category?: TreatmentCategory; tone: string }[] = [
  { id: 'all', label: 'Todas las categorías', tone: 'bg-muted-foreground' },
  { id: 'facial', label: 'Estética facial', category: 'facial', tone: 'bg-rose-500' },
  { id: 'corporal', label: 'Estética corporal', category: 'corporal', tone: 'bg-emerald-500' },
  { id: 'laser', label: 'Depilación láser', category: 'laser', tone: 'bg-violet-500' },
  { id: 'capilar', label: 'Estética capilar', category: 'capilar', tone: 'bg-amber-500' },
  { id: 'bienestar', label: 'Otros servicios', category: 'bienestar', tone: 'bg-pink-500' },
  { id: 'novias', label: 'Bono de belleza para novias', category: 'bienestar', tone: 'bg-pink-500' },
  { id: 'pareja', label: 'Ritual romántico en pareja', category: 'bienestar', tone: 'bg-pink-500' },
]
const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
type Sort = 'default' | 'name' | 'name_desc' | 'category' | 'duration' | 'duration_desc' | 'price' | 'price_desc' | 'active'

function belongs(t: Treatment, id: string) {
  const text = `${t.name} ${t.description ?? ''}`.toLowerCase()
  if (id === 'novias') return t.category === 'bienestar' && /novia|boda/.test(text)
  if (id === 'pareja') return t.category === 'bienestar' && /pareja|rom[aá]ntic|dos personas/.test(text)
  if (id === 'bienestar') return t.category === 'bienestar' && !/novia|boda|pareja|rom[aá]ntic|dos personas/.test(text)
  return id === 'all' || t.category === id
}
function duration(value: number) { const h = Math.floor(value / 60); const m = value % 60; return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ') || '—' }

export function TreatmentsTable({ treatments }: { treatments: Treatment[] }) {
  const [newServiceOpen, setNewServiceOpen] = useState(false)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('default')
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c.id, treatments.filter(t => belongs(t, c.id)).length])), [treatments])
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es')
    const list = treatments.filter(t => belongs(t, category) && (!q || `${t.name} ${t.description ?? ''} ${(t.variants ?? []).map(v => v.name).join(' ')}`.toLocaleLowerCase('es').includes(q)))
    const sign = sort.endsWith('_desc') ? -1 : 1
    const key = sort.replace('_desc', '')
    if (key !== 'default') list.sort((a, b) => {
      if (key === 'name') return sign * a.name.localeCompare(b.name, 'es')
      if (key === 'category') return a.category.localeCompare(b.category, 'es') || a.name.localeCompare(b.name, 'es')
      if (key === 'duration') return sign * (a.duration_min - b.duration_min)
      if (key === 'price') return sign * ((a.price_eur ?? Infinity) - (b.price_eur ?? Infinity))
      if (key === 'active') return Number(b.is_active) - Number(a.is_active)
      return 0
    })
    return list
  }, [treatments, category, query, sort])

  return <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
    <nav aria-label="Categorías de tratamientos" className="space-y-1 rounded-xl border p-3">
      {CATEGORIES.map(c => <button key={c.id} onClick={() => setCategory(c.id)} className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm capitalize transition hover:bg-muted ${category === c.id ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground'}`}>
        <span className="flex items-center gap-2"><span className={`size-2 shrink-0 rounded-full ${c.tone}`} />{c.label}</span><span className="text-xs tabular-nums">{counts[c.id] ?? 0}</span>
      </button>)}
    </nav>
    <section className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar tratamientos" className="pl-9" /></div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">Ordenar
          <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="h-9 rounded-md border bg-background px-2 text-foreground">
            <option value="default">Predeterminado</option><option value="name">Nombre A–Z</option><option value="name_desc">Nombre Z–A</option><option value="category">Categoría</option><option value="duration">Duración menor</option><option value="duration_desc">Duración mayor</option><option value="price">Precio menor</option><option value="price_desc">Precio mayor</option><option value="active">Activos primero</option>
          </select>
        </label>
      </div>
      <div className="overflow-hidden rounded-xl border">
        {visible.length ? visible.map(t => <TreatmentRow key={t.id} treatment={t} />) : <p className="p-8 text-center text-sm text-muted-foreground">No hay tratamientos que coincidan.</p>}
      </div>
    </section>
    <div className="fixed bottom-7 right-7 z-20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button size="icon-lg" className="size-14 rounded-full shadow-lg" aria-label="Crear"><Plus /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2 w-72 p-0">
          <DropdownMenuItem className="cursor-pointer justify-center rounded-none border-b py-5 font-semibold uppercase" onSelect={() => setNewServiceOpen(true)}>Nuevo servicio</DropdownMenuItem>
          <DropdownMenuItem className="justify-center rounded-none border-b py-5 font-semibold uppercase" onSelect={() => window.alert('La creación de combos estará disponible al guardar la nueva estructura de combos.')}>Nuevo combo de servicios</DropdownMenuItem>
          <DropdownMenuItem className="justify-center rounded-none py-5 font-semibold uppercase" onSelect={() => window.alert('La creación de categorías estará disponible al guardar la nueva estructura de categorías.')}>Nueva categoría</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <TreatmentFormDialog open={newServiceOpen} onOpenChange={setNewServiceOpen} hideTrigger />
  </div>
}

function TreatmentRow({ treatment: t }: { treatment: Treatment }) {
  const [expanded, setExpanded] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [active, setActive] = useState(t.is_active)
  const [pending, startTransition] = useTransition()
  const cat = CATEGORIES.find(c => c.id === t.category) ?? CATEGORIES[0]
  const variants = (t.variants ?? []).filter(v => v.is_active)
  const changeActive = () => { setActive(!active); startTransition(async () => { try { await setTreatmentActive(t.id, !active) } catch { setActive(active) } }) }
  return <div className={`border-b last:border-b-0 ${!active ? 'opacity-60' : ''}`}>
    <div className="flex items-stretch">
      <span className={`w-1 shrink-0 ${cat.tone}`} />
      <div className="min-w-0 flex-1 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <button className="text-left text-sm font-semibold uppercase tracking-wide hover:underline" onClick={() => variants.length && setExpanded(!expanded)}>{t.name}</button>
            {!active && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">Inactivo</span>}
            {t.description && <div className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground"><p className={descriptionOpen ? '' : 'line-clamp-2'}>{t.description}</p>{t.description.length > 120 && <button className="font-medium text-foreground underline-offset-2 hover:underline" onClick={() => setDescriptionOpen(!descriptionOpen)}>{descriptionOpen ? 'Menos' : 'Más'}</button>}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground"><span className="whitespace-nowrap">{duration(t.duration_min)}</span><span className="min-w-20 text-right font-semibold text-foreground">{t.price_eur == null ? '—' : euro.format(t.price_eur)}{variants.length > 0 ? '+' : ''}</span>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Opciones de ${t.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem disabled={pending} onSelect={changeActive}>{active ? 'Desactivar servicio' : 'Activar servicio'}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Editar ${t.name}`}><Link href={`/tratamientos/${encodeURIComponent(t.id)}`}><ChevronRight className="size-4" /></Link></Button>
          </div>
        </div>
        {variants.length > 0 && <button onClick={() => setExpanded(!expanded)} className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">{expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}{variants.length} opciones</button>}
      </div>
    </div>
    {expanded && variants.map(v => <div key={v.id} className="flex items-center gap-3 border-t bg-muted/30 py-3 pl-8 pr-5 text-sm sm:pl-12"><span className="min-w-0 flex-1">{v.name}</span><span className="whitespace-nowrap text-muted-foreground">{duration(v.duration_min)}</span><span className="min-w-20 text-right font-medium">{euro.format(v.price_eur)}</span></div>)}
  </div>
}
