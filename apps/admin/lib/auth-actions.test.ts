import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login, setInitialPassword } from './auth-actions'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn(),
  signInWithPassword: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
}))

vi.mock('./supabase-server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))

const form = (values: Record<string, string>) => {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

describe('auth server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({
      auth: {
        signInWithPassword: mocks.signInWithPassword,
        getUser: mocks.getUser,
        updateUser: mocks.updateUser,
      },
    })
    mocks.signInWithPassword.mockResolvedValue({ error: null })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } } })
    mocks.updateUser.mockResolvedValue({ error: null })
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error('REDIRECT:' + path)
    })
  })

  it('valida campos vacíos antes de llamar a Supabase', async () => {
    await expect(login(undefined, form({ email: ' ', password: '' }))).resolves.toEqual({
      error: 'Introduce email y contraseña.',
    })
    expect(mocks.createClient).not.toHaveBeenCalled()
  })

  it('normaliza el email, no revela credenciales y redirige tras login correcto', async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({ error: new Error('auth error') })
    await expect(
      login(undefined, form({ email: ' staff@example.test ', password: 'wrong' }))
    ).resolves.toEqual({ error: 'Email o contraseña incorrectos.' })

    mocks.signInWithPassword.mockResolvedValueOnce({ error: null })
    await expect(
      login(undefined, form({ email: ' staff@example.test ', password: 'correct' }))
    ).rejects.toThrow('REDIRECT:/citas')
    expect(mocks.signInWithPassword).toHaveBeenLastCalledWith({
      email: 'staff@example.test',
      password: 'correct',
    })
  })

  it('valida la contraseña inicial y exige una sesión invitada', async () => {
    await expect(
      setInitialPassword(undefined, form({ password: 'short', confirmPassword: 'short' }))
    ).resolves.toEqual({ error: 'La contraseña debe tener al menos 8 caracteres.' })
    expect(mocks.createClient).not.toHaveBeenCalled()

    mocks.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(
      setInitialPassword(undefined, form({ password: 'long-enough', confirmPassword: 'long-enough' }))
    ).rejects.toThrow('REDIRECT:/login')

    await expect(
      setInitialPassword(undefined, form({ password: 'long-enough', confirmPassword: 'long-enough' }))
    ).rejects.toThrow('REDIRECT:/citas')
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'long-enough' })
  })
})
