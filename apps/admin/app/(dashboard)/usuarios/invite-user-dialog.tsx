'use client'

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { inviteUser, type InviteUserState } from './actions'

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState<InviteUserState, FormData>(
    inviteUser,
    undefined
  )

  useEffect(() => {
    if (state?.success) {
      const timeout = setTimeout(() => setOpen(false), 1200)
      return () => clearTimeout(timeout)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Invitar usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar a un usuario</DialogTitle>
          <DialogDescription>
            Le llegará un email para que elija su contraseña y acceda al panel.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="off" />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.success}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Enviar invitación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
