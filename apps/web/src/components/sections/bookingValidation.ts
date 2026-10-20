import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Validación del formulario de reserva. Va en su propio módulo porque
// BookingSection lo carga con import() al usar el formulario: zod era ~10 %
// del JS y no hace falta para pintar la página.

export interface BookingErrors {
  name: string
  email: string
  phoneMin: string
  phoneFormat: string
  treatment: string
  date: string
  pastDate: string
  time: string
  gdpr: string
}

const makeBookingSchema = (e: BookingErrors) =>
  z.object({
    name: z.string().min(2, e.name),
    email: z.string().email(e.email),
    phone: z
      .string()
      .min(9, e.phoneMin)
      .regex(/^[+\d\s()-]{9,}$/, e.phoneFormat),
    treatment_id: z.string().min(1, e.treatment),
    preferred_date: z
      .string()
      .min(1, e.date)
      .refine((d) => new Date(d) >= new Date(new Date().toDateString()), {
        message: e.pastDate,
      }),
    scheduled_at: z.string().min(1, e.time),
    notes: z.string().optional(),
    gdpr_consent: z.literal(true, {
      errorMap: () => ({ message: e.gdpr }),
    }),
  })

export type BookingSchema = z.infer<ReturnType<typeof makeBookingSchema>>

export const bookingResolver = (errors: BookingErrors): Resolver<BookingSchema> =>
  zodResolver(makeBookingSchema(errors))
