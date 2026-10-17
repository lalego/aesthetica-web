import type { TreatmentCategory } from '@aesthetica/shared'

// Lógica de facturación sin dependencias de servidor: la usan tanto el
// formulario (cliente) como la generación del PDF y las Server Actions.

export const TAX_RATE = 0.21
export const MAX_INVOICE_ITEMS = 3 // la plantilla formulario.pdf tiene 3 líneas

// Serie de la factura según el primer tratamiento, igual que el GroupPrefix de
// services.csv en PdfFormFiller: F = facial, C = corporal.
export const INVOICE_SERIES = ['F', 'C'] as const
export type InvoiceSeries = (typeof INVOICE_SERIES)[number]

const SERIES_BY_CATEGORY: Record<TreatmentCategory, InvoiceSeries> = {
  facial: 'F',
  corporal: 'C',
  laser: 'F',
  capilar: 'F',
  bienestar: 'C',
}

export function seriesForCategory(category: TreatmentCategory): InvoiceSeries {
  return SERIES_BY_CATEGORY[category]
}

/** Los importes llevan IVA incluido; la base se saca dividiendo (TaxCalculator de PdfFormFiller). */
export function computeTotals(amounts: number[]) {
  const total = Math.round(amounts.reduce((sum, a) => sum + a, 0) * 100) / 100
  const subtotal = Math.round((total / (1 + TAX_RATE)) * 100) / 100
  const tax = Math.round((total - subtotal) * 100) / 100
  return { subtotal, tax, total }
}

const amountFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "57,02" — mismo formato que String.format("%.2f") con locale es en PdfFormFiller. */
export function formatAmount(value: number) {
  return amountFormatter.format(value)
}

export function formatEuro(value: number) {
  return `${formatAmount(value)} €`
}

export interface BillingPatient {
  id: string
  full_name: string
  tax_id: string | null
  address: string | null
  postal_code: string | null
}

export interface BillingTreatment {
  id: string
  name: string
  category: TreatmentCategory
  price_eur: number | null
}
