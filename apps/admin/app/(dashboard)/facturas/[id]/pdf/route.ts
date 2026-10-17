import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifySession } from '@/lib/dal'
import { renderInvoicePdf } from '@/lib/invoice-pdf'

// El PDF no se guarda: se genera al vuelo desde los datos de la factura, que
// son inmutables (snapshot del cliente + líneas).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await verifySession()
  const { id } = await params

  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .select(
      'number, issued_on, customer_name, customer_tax_id, customer_address, customer_postal_code, payment_method, observations, subtotal, tax, total, invoice_items(position, description, amount)'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!invoice) return new Response('Factura no encontrada', { status: 404 })

  const items = [...invoice.invoice_items]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({ description: item.description, amount: Number(item.amount) }))

  const pdf = await renderInvoicePdf({
    ...invoice,
    subtotal: Number(invoice.subtotal),
    tax: Number(invoice.tax),
    total: Number(invoice.total),
    items,
  })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
