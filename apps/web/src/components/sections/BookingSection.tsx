import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, CheckCircle, Loader2, MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTreatments } from '@/hooks/useTreatments'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { isSlotTakenError, submitBooking } from '@/services/bookingService'
import { useQueryClient } from '@tanstack/react-query'
import { CLINIC } from '@/config/clinic'
import { useLang, type Lang } from '@/i18n'
import { localizeTreatment } from '@/content/treatments-en'

// ── Textos ────────────────────────────────────────────────────────────────────

const COPY = {
  es: {
    errors: {
      name: 'El nombre es obligatorio',
      email: 'Introduce un email válido',
      phoneMin: 'Mínimo 9 dígitos',
      phoneFormat: 'Formato de teléfono no válido',
      treatment: 'Selecciona un tratamiento',
      date: 'Selecciona una fecha',
      pastDate: 'La fecha no puede ser en el pasado',
      time: 'Selecciona una hora',
      gdpr: 'Debes aceptar la política de privacidad para continuar',
    },
    title: ['Agenda tu', 'cita'],
    intro: 'Rellena el formulario y te contactaremos en menos de 24 h para confirmar.',
    successTitle: '¡Solicitud recibida!',
    successText: 'Nos pondremos en contacto contigo en menos de 24 horas para confirmar tu cita.',
    again: 'Hacer otra reserva',
    name: 'Nombre completo',
    namePh: 'María García',
    email: 'Email',
    emailPh: 'hola@ejemplo.es',
    phone: 'Teléfono',
    treatment: 'Tratamiento de interés',
    treatmentPh: 'Selecciona un tratamiento…',
    date: 'Fecha preferida',
    time: 'Hora disponible',
    searching: 'Buscando huecos…',
    noSlots: 'No hay huecos libres este día, prueba con otra fecha.',
    notes: 'Notas o consultas (opcional)',
    notesPh: '¿Tienes alguna duda o preferencia horaria?',
    gdpr: [
      'He leído y acepto la ',
      'Política de privacidad',
      '. Consiento el tratamiento de mis datos para gestionar mi cita, de conformidad con el RGPD (UE) 2016/679 y la LOPDGDD.',
    ],
    sending: 'Enviando…',
    submit: 'Solicitar cita',
    slotTaken: 'Esa hora se acaba de ocupar. Elige otra de las disponibles y vuelve a enviar.',
    failTitle: 'No hemos podido registrar tu solicitud.',
    failText: 'Puede ser un problema puntual. Vuelve a intentarlo en unos minutos o pide tu cita directamente:',
    call: 'Llamar',
  },
  en: {
    errors: {
      name: 'Name is required',
      email: 'Enter a valid email',
      phoneMin: 'At least 9 digits',
      phoneFormat: 'Invalid phone number format',
      treatment: 'Choose a treatment',
      date: 'Choose a date',
      pastDate: 'The date cannot be in the past',
      time: 'Choose a time',
      gdpr: 'You must accept the privacy policy to continue',
    },
    title: ['Book your', 'appointment'],
    intro: 'Fill in the form and we will contact you within 24 hours to confirm.',
    successTitle: 'Request received!',
    successText: 'We will contact you within 24 hours to confirm your appointment.',
    again: 'Make another booking',
    name: 'Full name',
    namePh: 'Jane Smith',
    email: 'Email',
    emailPh: 'hello@example.com',
    phone: 'Phone',
    treatment: 'Treatment',
    treatmentPh: 'Choose a treatment…',
    date: 'Preferred date',
    time: 'Available time',
    searching: 'Looking for available times…',
    noSlots: 'No times available on this day, please try another date.',
    notes: 'Notes or questions (optional)',
    notesPh: 'Any questions or preferred times?',
    gdpr: [
      'I have read and accept the ',
      'Privacy policy',
      ' (in Spanish). I consent to the processing of my data to manage my appointment, in accordance with the GDPR (Regulation (EU) 2016/679, RGPD) and the Spanish LOPDGDD.',
    ],
    sending: 'Sending…',
    submit: 'Request appointment',
    slotTaken: 'That time has just been taken. Please choose another available time and send again.',
    failTitle: 'We could not register your request.',
    failText: 'It may be a temporary issue. Please try again in a few minutes or book directly:',
    call: 'Call',
  },
}

// ── Schema de validación ─────────────────────────────────────────────────────

const makeBookingSchema = (e: (typeof COPY)[Lang]['errors']) =>
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

type BookingSchema = z.infer<ReturnType<typeof makeBookingSchema>>

// ── Componente ────────────────────────────────────────────────────────────────

export const BookingSection = () => {
  const lang = useLang()
  const t = COPY[lang]
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'slot_taken'>('idle')
  const queryClient = useQueryClient()
  const { data: treatments = [] } = useTreatments()
  const schema = useMemo(() => makeBookingSchema(t.errors), [t])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingSchema>({
    resolver: zodResolver(schema),
    defaultValues: { scheduled_at: '' },
  })

  const treatmentId = watch('treatment_id')
  const preferredDate = watch('preferred_date')
  const scheduledAt = watch('scheduled_at')

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(preferredDate, treatmentId)

  // Si cambian tratamiento o fecha, la hora elegida antes ya no vale.
  useEffect(() => {
    setValue('scheduled_at', '')
  }, [treatmentId, preferredDate, setValue])

  const onSubmit = async (data: BookingSchema) => {
    setStatus('loading')
    try {
      await submitBooking(data)
      setStatus('success')
      reset()
    } catch (err) {
      console.error('[BookingSection]', err)
      // Nunca se muestra éxito si no se guardó: con Supabase pausado, las
      // reservas se perdían sin que nadie se enterase. Los datos del formulario
      // se conservan para reintentar.
      if (isSlotTakenError(err)) {
        setValue('scheduled_at', '')
        await queryClient.invalidateQueries(['slots'])
        setStatus('slot_taken')
      } else {
        setStatus('error')
      }
    }
  }

  // En el cliente y no al renderizar: el HTML prerenderizado llevaría la fecha del build.
  const [today, setToday] = useState<string>()
  useEffect(() => setToday(new Date().toISOString().split('T')[0]), [])

  return (
    <section id="agendar" className="bg-white py-20">
      <div className="max-w-2xl mx-auto px-6">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-light text-neutral-800 mb-4">
            {t.title[0]} <span className="font-serif italic text-gold-400">{t.title[1]}</span>
          </h2>
          <p className="text-neutral-600">{t.intro}</p>
        </div>

        {/* Estado de éxito */}
        {status === 'success' ? (
          <div className="text-center py-16 space-y-4">
            <CheckCircle className="w-14 h-14 text-gold-400 mx-auto" />
            <h3 className="text-xl font-light text-neutral-800">{t.successTitle}</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">{t.successText}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-base text-neutral-400 hover:text-neutral-700 underline transition-colors"
            >
              {t.again}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Nombre */}
            <Field label={t.name} error={errors.name?.message}>
              <input
                {...register('name')}
                type="text"
                placeholder={t.namePh}
                className={inputClass(!!errors.name)}
              />
            </Field>

            {/* Email + Teléfono */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label={t.email} error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t.emailPh}
                  className={inputClass(!!errors.email)}
                />
              </Field>
              <Field label={t.phone} error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="+34 600 000 000"
                  className={inputClass(!!errors.phone)}
                />
              </Field>
            </div>

            {/* Tratamiento */}
            <Field label={t.treatment} error={errors.treatment_id?.message}>
              <select
                {...register('treatment_id')}
                className={inputClass(!!errors.treatment_id)}
                defaultValue=""
              >
                <option value="" disabled>{t.treatmentPh}</option>
                {treatments.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {localizeTreatment(tr, lang).name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Fecha */}
            <Field label={t.date} error={errors.preferred_date?.message}>
              <input
                {...register('preferred_date')}
                type="date"
                min={today}
                className={inputClass(!!errors.preferred_date)}
              />
            </Field>

            {/* Hora disponible */}
            {treatmentId && preferredDate && (
              <Field label={t.time} error={errors.scheduled_at?.message}>
                {slotsLoading ? (
                  <p className="text-base text-neutral-500">{t.searching}</p>
                ) : slots && slots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((iso) => {
                      const label = new Date(iso).toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Europe/Madrid',
                      })
                      const selected = scheduledAt === iso
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => setValue('scheduled_at', iso, { shouldValidate: true })}
                          className={cn(
                            'rounded-full border px-4 py-1.5 text-sm transition-colors',
                            selected
                              ? 'border-gold-400 bg-gold-400 text-white'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-gold-300'
                          )}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-base text-neutral-500">{t.noSlots}</p>
                )}
              </Field>
            )}

            {/* Notas */}
            <Field label={t.notes} error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder={t.notesPh}
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
                  {t.gdpr[0]}
                  <Link to="/privacidad" target="_blank" className="underline hover:text-neutral-900">
                    {t.gdpr[1]}
                  </Link>
                  {t.gdpr[2]}
                </span>
              </label>
              {errors.gdpr_consent && (
                <p className="text-sm text-gold-400 pl-7">{errors.gdpr_consent.message}</p>
              )}
            </div>

            {/* Error de envío: el hueco se ocupó o no se pudo guardar */}
            {status === 'slot_taken' && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 text-base text-neutral-700">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-gold-500" />
                {t.slotTaken}
              </p>
            )}
            {status === 'error' && (
              <div role="alert" className="rounded-xl border border-gold-300 bg-gold-50 px-4 py-4 space-y-3 text-base text-neutral-700">
                <p className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-gold-500" />
                  <span>
                    <strong className="font-medium text-neutral-800">{t.failTitle}</strong> {t.failText}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 pl-7">
                  <a
                    href={CLINIC.contact.phone_href}
                    className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white px-4 py-2 text-sm text-gold-600 hover:bg-gold-100 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {t.call} {CLINIC.contact.phone}
                  </a>
                  <a
                    href={CLINIC.contact.whatsapp_href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white px-4 py-2 text-sm text-gold-600 hover:bg-gold-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading' || !scheduledAt}
              className="w-full bg-gold-400 text-white py-3 rounded-full hover:bg-gold-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-gold-200"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.sending}
                </>
              ) : (
                t.submit
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
