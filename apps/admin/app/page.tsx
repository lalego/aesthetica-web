import { AuthDispatcher } from './auth-dispatcher'

export default function RootPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AuthDispatcher />
    </div>
  )
}
