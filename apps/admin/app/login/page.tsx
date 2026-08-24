import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">AestheticA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel de gestión — acceso de staff
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
