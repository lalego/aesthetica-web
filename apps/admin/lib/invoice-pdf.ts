import 'server-only'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { supabaseAdmin } from './supabase-admin'
import { formatAmount } from './invoices'

// Port de PdfGenerator/InvoiceGenerator de PdfFormFiller: rellena los campos
// AcroForm de formulario.pdf y aplana el formulario.
// La plantilla vive en el bucket privado 'invoice-templates' de Supabase Storage
// (no en el repo, que es público y la plantilla lleva el NIF de la clínica).

const TEMPLATE_BUCKET = 'invoice-templates'
const TEMPLATE_PATH = 'formulario.pdf'

// Nombres de campo de formulario.pdf (PdfFields.java). Mantener en sincronía con la plantilla.
const FIELDS = {
  numero: 'Numero',
  fecha: 'Fecha',
  nombre: 'Nombre',
  dni: 'DNI',
  direccion: 'Direccion',
  codigoPostal: 'CodigoPostal',
  descPrefix: 'Desc',
  totalLinePrefix: 'Total',
  subtotal: 'Subtotal',
  iva: 'IVA 21',
  total: 'Total',
  formaPago: 'Forma', // PdfFormFiller nunca lo rellenaba
  observaciones: 'Observaciones',
} as const

export interface InvoicePdfData {
  number: string
  issued_on: string // YYYY-MM-DD
  customer_name: string
  customer_tax_id: string | null
  customer_address: string | null
  customer_postal_code: string | null
  payment_method: string | null
  observations: string | null
  subtotal: number
  tax: number
  total: number
  items: { description: string; amount: number }[]
}

async function loadTemplate() {
  const { data, error } = await supabaseAdmin.storage.from(TEMPLATE_BUCKET).download(TEMPLATE_PATH)
  if (error || !data) {
    throw new Error(
      `No se encuentra la plantilla ${TEMPLATE_BUCKET}/${TEMPLATE_PATH} en Supabase Storage`
    )
  }
  return new Uint8Array(await data.arrayBuffer())
}

export async function renderInvoicePdf(invoice: InvoicePdfData) {
  const doc = await PDFDocument.load(await loadTemplate())
  const form = doc.getForm()
  const font = await doc.embedFont(StandardFonts.Helvetica)

  const [year, month, day] = invoice.issued_on.split('-')
  const values: Record<string, string> = {
    [FIELDS.numero]: invoice.number,
    [FIELDS.fecha]: `${day}/${month}/${year}`,
    [FIELDS.nombre]: invoice.customer_name,
    [FIELDS.dni]: invoice.customer_tax_id || 'PENDIENTE-IDENTIFICAR',
    [FIELDS.direccion]: invoice.customer_address ?? '',
    [FIELDS.codigoPostal]: invoice.customer_postal_code ?? '',
    [FIELDS.subtotal]: formatAmount(invoice.subtotal),
    [FIELDS.iva]: formatAmount(invoice.tax),
    [FIELDS.total]: formatAmount(invoice.total),
    [FIELDS.formaPago]: invoice.payment_method ?? '',
    [FIELDS.observaciones]: invoice.observations ?? '',
  }
  invoice.items.forEach((item, i) => {
    values[`${FIELDS.descPrefix}${i + 1}`] = item.description
    values[`${FIELDS.totalLinePrefix}${i + 1}`] = formatAmount(item.amount)
  })

  for (const [name, value] of Object.entries(values)) {
    const field = form.getFieldMaybe(name)
    if (field) {
      form.getTextField(name).setText(value)
    } else if (value) {
      console.warn(`[invoice-pdf] Campo no encontrado en la plantilla: '${name}'`)
    }
  }

  form.updateFieldAppearances(font)
  form.flatten()
  return doc.save()
}
