'use client'

import { useState } from 'react'
import { Download, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatEuro } from '@/lib/invoices'

export interface InvoiceRow {
  id: string
  number: string
  issued_on: string
  customer_name: string
  customer_tax_id: string | null
  total: number
  invoice_items: { position: number; description: string }[]
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeZone: 'UTC' })

export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = invoices.filter((invoice) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      invoice.number.toLowerCase().includes(q) ||
      invoice.customer_name.toLowerCase().includes(q) ||
      (invoice.customer_tax_id ?? '').toLowerCase().includes(q)
    )
  })

  const filteredTotal = filtered.reduce((sum, invoice) => sum + Number(invoice.total), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, nombre o DNI…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} facturas · {formatEuro(filteredTotal)}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {invoices.length === 0 ? 'Todavía no hay facturas.' : 'Sin resultados.'}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Conceptos</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium tabular-nums">{invoice.number}</TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(new Date(invoice.issued_on))}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{invoice.customer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {invoice.customer_tax_id ?? 'Sin DNI/NIF'}
                  </div>
                </TableCell>
                <TableCell className="max-w-72 truncate text-muted-foreground">
                  {[...invoice.invoice_items]
                    .sort((a, b) => a.position - b.position)
                    .map((item) => item.description)
                    .join(' · ')}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatEuro(Number(invoice.total))}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <a
                      href={`/facturas/${invoice.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Descargar ${invoice.number}`}
                    >
                      <Download />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
