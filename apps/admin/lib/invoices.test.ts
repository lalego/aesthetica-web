import { describe, expect, it } from 'vitest'
import { computeTotals, formatEuro, seriesForCategory } from './invoices'

describe('invoice calculations', () => {
  it('separa base e IVA de importes que ya incluyen el impuesto', () => {
    expect(computeTotals([50, 50])).toEqual({
      subtotal: 82.64,
      tax: 17.36,
      total: 100,
    })
  })

  it('redondea a céntimos y formatea en español', () => {
    expect(computeTotals([10.005, 2.005]).total).toBe(12.01)
    expect(formatEuro(57.02)).toBe('57,02 €')
  })

  it('elige serie fiscal según la categoría del primer tratamiento', () => {
    expect(seriesForCategory('facial')).toBe('F')
    expect(seriesForCategory('laser')).toBe('F')
    expect(seriesForCategory('corporal')).toBe('C')
    expect(seriesForCategory('bienestar')).toBe('C')
  })
})
