import { Loader2 } from 'lucide-react'
import { AuthDispatcher } from './auth-dispatcher'

export default function RootPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <AuthDispatcher />
    </div>
  )
}
