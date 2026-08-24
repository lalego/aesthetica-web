'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export interface Patient {
  id: string
  full_name: string
  email: string
  phone: string | null
  gdpr_consent: boolean
  created_at: string
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })

export function PatientsTable({ patients }: { patients: Patient[] }) {
  const [query, setQuery] = useState('')

  const filtered = patients.filter((p) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.phone ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o teléfono…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {patients.length === 0 ? 'Todavía no hay pacientes registrados.' : 'Sin resultados.'}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>RGPD</TableHead>
              <TableHead>Alta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                <TableCell className="text-muted-foreground">{patient.phone ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={patient.gdpr_consent ? 'success' : 'destructive'}>
                    {patient.gdpr_consent ? 'Consentido' : 'Sin consentir'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(new Date(patient.created_at))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
