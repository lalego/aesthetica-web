import { beforeEach, describe, expect, it, vi } from 'vitest'
import { verifySession } from './dal'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, cache: (fn: (...args: never[]) => unknown) => fn }
})
vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}))
vi.mock('./supabase-server', () => ({
  createClient: mocks.createClient,
}))

describe('verifySession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: 'staff-id', email: 'staff@example.test' } },
          error: null,
        }),
      },
    })
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error('REDIRECT:' + path)
    })
  })

  it('devuelve identidad cuando los claims se verifican', async () => {
    await expect(verifySession()).resolves.toEqual({
      userId: 'staff-id',
      email: 'staff@example.test',
    })
  })

  it('redirige cuando faltan claims', async () => {
    mocks.createClient.mockResolvedValueOnce({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { claims: null }, error: null }),
      },
    })

    await expect(verifySession()).rejects.toThrow('REDIRECT:/login')
  })
})
