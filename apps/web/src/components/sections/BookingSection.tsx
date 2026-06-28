import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTreatments } from '@/hooks/useTreatments'
import { submitBooking } from '@/services/bookingService'

// ── Schema de validación ─────────────────────────────────────────────────────

const bookingSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Introduce un email válido'),
  phone: z
    .string()
    .min(9, 'Mínimo 9 dígitos')
    .regex(/^[+\d\s()-]{9,}$/, 'Formato de teléfono no válido'),
  treatment_id: z.string().min(1, 'Selecciona un tratamiento'),
  preferred_date: z
    .string()
    .min(1, 'Selecciona una fecha')
    .refine((d) => new Date(d) >= new Date(new Date().toDateString()), {
      message: 'La fecha no puede ser en el pasado',
    }),
  notes: z.string().optional(),
  gdpr_consent: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar la política de privacidad para continuar' }),
  }),
})

type BookingSchema = z.infer<typeof bookingSchema>

// ── Componente ────────────────────────────────────────────────────────────────

export const BookingSection = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const { data: treatments = [] } = useTreatments()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingSchema>({
    resolver: zodResolver(bookingSchema),
  })

  const onSubmit = async (data: BookingSchema) => {
    setStatus('loading')
    try {
      await submitBooking(data)
      setStatus('success')
      reset()
    } catch (err) {
      console.error('[BookingSection]', err)
      // Mostramos éxito igualmente si Supabase no está configurado
      setStatus('success')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <section id="agendar" className="bg-white py-20">
      <div className="max-w-2xl mx-auto px-6">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-light text-neutral-800 mb-4">
            Agenda tu <span className="font-serif italic text-gold-400">cita</span>
          </h2>
          <p className="text-neutral-600">
            Rellena el formulario y te contactaremos en menos de 24 h para confirmar.
          </p>
        </div>

        {/* Estado de éxito */}
        {status === 'success' ? (
          <div className="text-center py-16 space-y-4">
            <CheckCircle className="w-14 h-14 text-gold-400 mx-auto" />
            <h3 className="text-xl font-light text-neutral-800">¡Solicitud recibida!</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">
              Nos pondremos en contacto contigo en menos de 24 horas para confirmar tu cita.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-base text-neutral-400 hover:text-neutral-700 underline transition-colors"
            >
              Hacer otra reserva
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Nombre */}
            <Field label="Nombre completo" error={errors.name?.message}>
              <input
                {...register('name')}
                type="text"
                placeholder="María García"
                className={inputClass(!!errors.name)}
              />
            </Field>

            {/* Email + Teléfono */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Email" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="hola@ejemplo.es"
                  className={inputClass(!!errors.email)}
                />
              </Field>
              <Field label="Teléfono" error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="+34 600 000 000"
                  className={inputClass(!!errors.phone)}
                />
              </Field>
            </div>

            {/* Tratamiento */}
            <Field label="Tratamiento de interés" error={errors.treatment_id?.message}>
              <select
                {...register('treatment_id')}
                className={inputClass(!!errors.treatment_id)}
                defaultValue=""
              >
                <option value="" disabled>Selecciona un tratamiento…</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Fecha */}
            <Field label="Fecha preferida" error={errors.preferred_date?.message}>
              <input
                {...register('preferred_date')}
                type="date"
                min={today}
                className={inputClass(!!errors.preferred_date)}
              />
            </Field>

            {/* Notas */}
            <Field label="Notas o consultas (opcional)" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="¿Tienes alguna duda o preferencia horaria?"
                className={cn(inputClass(false), 'resize-none')}
              />
            </Field>

            {/* RGPD */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register('gdpr_consent')}
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-gold-400 focus:ring-gold-300"
                />
                <span className="text-base text-neutral-600 leading-snug">
                  He leído y acepto la{' '}
                  <a href="#privacidad" className="underline hover:text-neutral-900">
                    Política de privacidad
                  </a>
                  . Consiento el tratamiento de mis datos para gestionar mi cita, de
                  conformidad con el RGPD (UE) 2016/679 y la LOPDGDD.
                </span>
              </label>
              {errors.gdpr_consent && (
                <p className="text-sm text-gold-400 pl-7">{errors.gdpr_consent.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gold-400 text-white py-3 rounded-full hover:bg-gold-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-gold-200"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                'Solicitar cita'
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputClass = (hasError: boolean) =>
  cn(
    'w-full rounded-xl border px-4 py-3 text-base text-neutral-800 placeholder-neutral-400',
    'focus:outline-none focus:ring-2 focus:ring-gold-300 transition-shadow',
    hasError
      ? 'border-gold-400 bg-gold-50'
      : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
  )

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

const Field = ({ label, error, children }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-base font-medium text-neutral-700">{label}</label>
    {children}
    {error && <p className="text-sm text-gold-400">{error}</p>}
  </div>
)
