'use client'

import { useState, useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { removeUser } from './actions'

export interface Member {
  id: string
  email: string
  confirmed: boolean
  createdAt: string
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })

export function UsersTable({
  members,
  currentUserId,
}: {
  members: Member[]
  currentUserId: string
}) {
  if (members.length === 0) {
    return <p className="text-muted-foreground">Todavía no hay usuarios invitados.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Alta</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <UserRow key={member.id} member={member} isSelf={member.id === currentUserId} />
        ))}
      </TableBody>
    </Table>
  )
}

function UserRow({ member, isSelf }: { member: Member; isSelf: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRemove = () => {
    setError(null)
    startTransition(async () => {
      try {
        await removeUser(member.id)
        setConfirmOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario')
      }
    })
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {member.email}
        {isSelf && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
      </TableCell>
      <TableCell>
        <Badge variant={member.confirmed ? 'success' : 'warning'}>
          {member.confirmed ? 'Activo' : 'Invitación pendiente'}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {dateFormatter.format(new Date(member.createdAt))}
      </TableCell>
      <TableCell>
        {!isSelf && (
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Eliminar usuario"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar usuario</DialogTitle>
                <DialogDescription>
                  {member.email} perderá el acceso al panel inmediatamente. Esta acción no se
                  puede deshacer.
                </DialogDescription>
              </DialogHeader>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </TableCell>
    </TableRow>
  )
}
