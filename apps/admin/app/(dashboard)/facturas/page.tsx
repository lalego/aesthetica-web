import { supabaseAdmin } from '@/lib/supabase-admin'
import type { BillingPatient, BillingTreatment } from '@/lib/invoices'
import { InvoiceFormDialog } from './invoice-form-dialog'
import { InvoicesTable, type InvoiceRow } from './invoices-table'

export const dynamic = 'force-dynamic'

export default async function FacturasPage() {
  const [invoices, patients, treatments] = await Promise.all([
    supabaseAdmin
      .from('invoices')
      .select(
        'id, number, issued_on, customer_name, customer_tax_id, total, invoice_items(position, description)'
      )
      .order('seq', { ascending: false }),
    supabaseAdmin
      .from('patients')
      .select('id, full_name, tax_id, address, postal_code')
      .order('full_name'),
    supabaseAdmin
      .from('treatments')
      .select('id, name, category, price_eur')
      .eq('is_active', true)
      .order('category')
      .order('name'),
  ])

  const error = invoices.error ?? patients.error ?? treatments.error
  if (error) throw new Error(error.message)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Facturación</h1>
        <InvoiceFormDialog
          patients={(patients.data ?? []) as BillingPatient[]}
          treatments={(treatments.data ?? []) as BillingTreatment[]}
        />
      </div>
      <InvoicesTable invoices={(invoices.data ?? []) as InvoiceRow[]} />
    </div>
  )
}
