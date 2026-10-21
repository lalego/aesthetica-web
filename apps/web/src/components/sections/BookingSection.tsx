import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import type { BookingErrors, BookingSchema } from './bookingValidation'
import { AlertCircle, CalendarDays, Check, CheckCircle, ChevronLeft, ChevronRight, Clock3, Loader2, MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTreatments } from '@/hooks/useTreatments'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { isSlotTakenError, submitBooking } from '@/services/bookingService'
import { useQueryClient } from '@tanstack/react-query'
import { CLINIC } from '@/config/clinic'
import { LOCALES, useLang, type Lang } from '@/i18n'
import { localizeTreatment } from '@/content/treatments-i18n'

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
    steps: ['Tratamiento', 'Día y hora', 'Tus datos'],
    chooseTreatment: '¿Qué tratamiento te interesa?',
    chooseDateTime: 'Selecciona un día y una hora disponible.',
    yourDetails: 'Déjanos tus datos para solicitar la cita.',
    bookingSummary: 'Resumen de tu cita',
    continue: 'Continuar',
    back: 'Volver',
    duration: 'min',
    priceFrom: 'Desde',
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
    steps: ['Treatment', 'Date & time', 'Your details'],
    chooseTreatment: 'Which treatment are you interested in?',
    chooseDateTime: 'Choose an available day and time.',
    yourDetails: 'Leave your details to request an appointment.',
    bookingSummary: 'Appointment summary',
    continue: 'Continue',
    back: 'Back',
    duration: 'min',
    priceFrom: 'From',
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
  uk: {
    errors: {
      name: 'Вкажіть ім’я',
      email: 'Вкажіть правильний email',
      phoneMin: 'Щонайменше 9 цифр',
      phoneFormat: 'Неправильний формат телефону',
      treatment: 'Оберіть процедуру',
      date: 'Оберіть дату',
      pastDate: 'Дата не може бути в минулому',
      time: 'Оберіть час',
      gdpr: 'Щоб продовжити, потрібно погодитися з політикою конфіденційності',
    },
    title: ['Запишіться', 'на прийом'],
    intro: 'Заповніть форму, і ми зв’яжемося з вами протягом 24 годин, щоб підтвердити запис.',
    steps: ['Процедура', 'Дата й час', 'Ваші дані'],
    chooseTreatment: 'Яка процедура вас цікавить?',
    chooseDateTime: 'Оберіть доступні дату та час.',
    yourDetails: 'Залиште контактні дані, щоб записатися.',
    bookingSummary: 'Підсумок запису',
    continue: 'Продовжити',
    back: 'Назад',
    duration: 'хв',
    priceFrom: 'Від',
    successTitle: 'Заявку отримано!',
    successText: 'Ми зв’яжемося з вами протягом 24 годин, щоб підтвердити запис.',
    again: 'Зробити ще один запис',
    name: 'Ім’я та прізвище',
    namePh: 'Олена Коваленко',
    email: 'Email',
    emailPh: 'hello@example.com',
    phone: 'Телефон',
    treatment: 'Процедура',
    treatmentPh: 'Оберіть процедуру…',
    date: 'Бажана дата',
    time: 'Вільний час',
    searching: 'Шукаємо вільний час…',
    noSlots: 'На цей день немає вільного часу, спробуйте іншу дату.',
    notes: 'Примітки чи запитання (необов’язково)',
    notesPh: 'Маєте запитання або бажаний час?',
    gdpr: [
      'Я ознайомилася/ознайомився та погоджуюся з ',
      'Політикою конфіденційності',
      ' (іспанською). Даю згоду на обробку моїх даних для запису на прийом відповідно до GDPR (Регламент (ЄС) 2016/679, RGPD) та іспанського закону LOPDGDD.',
    ],
    sending: 'Надсилаємо…',
    submit: 'Надіслати заявку',
    slotTaken: 'Цей час щойно зайняли. Оберіть інший вільний час і надішліть ще раз.',
    failTitle: 'Не вдалося зареєструвати вашу заявку.',
    failText: 'Можливо, це тимчасова проблема. Спробуйте ще раз за кілька хвилин або запишіться напряму:',
    call: 'Зателефонувати',
  },
} satisfies Record<Lang, { errors: BookingErrors } & Record<string, unknown>>

// ── Validación (zod, cargado bajo demanda) ───────────────────────────────────

const loadValidation = () => import('./bookingValidation')

// El esquema vive en bookingValidation.ts y se descarga al tocar el formulario
// (onFocus) o, como tarde, al enviarlo: zod no hace falta para pintar la página.
const lazyResolver = (errors: BookingErrors): Resolver<BookingSchema> =>
  async (values, context, options) => {
    const { bookingResolver } = await loadValidation()
    return bookingResolver(errors)(values, context, options)
  }

// ── Componente ────────────────────────────────────────────────────────────────

export const BookingSection = () => {
  const lang = useLang()
  const t = COPY[lang]
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'slot_taken'>('idle')
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: treatments = [] } = useTreatments()
  const resolver = useMemo(() => lazyResolver(t.errors), [t])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BookingSchema>({
    resolver,
    defaultValues: { scheduled_at: '' },
  })

  const treatmentId = watch('treatment_id')
  const preferredDate = watch('preferred_date')
  const scheduledAt = watch('scheduled_at')
  const selectedTreatment = treatments.find((treatment) => treatment.id === treatmentId)
  const categoryOptions = [
    { id: 'facial', es: 'Facial', en: 'Facial', uk: 'Обличчя' },
    { id: 'corporal', es: 'Corporal', en: 'Body', uk: 'Тіло' },
    { id: 'laser', es: 'Depilación láser', en: 'Laser hair removal', uk: 'Лазерна епіляція' },
    { id: 'capilar', es: 'Capilar', en: 'Hair', uk: 'Волосся' },
    { id: 'bienestar', es: 'Bienestar', en: 'Wellness', uk: 'Велнес' },
  ] as const

  const continueStep = async () => {
    const valid = step === 0
      ? await trigger('treatment_id')
      : await trigger(['preferred_date', 'scheduled_at'])
    if (valid) setStep((current) => current + 1)
  }

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
      setStep(0)
      setCategory(null)
      reset()
    } catch (err) {
      console.error('[BookingSection]', err)
      // Nunca se muestra éxito si no se guardó: con Supabase pausado, las
      // reservas se perdían sin que nadie se enterase. Los datos del formulario
      // se conservan para reintentar.
      if (isSlotTakenError(err)) {
        setStep(1)
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
          <form onSubmit={handleSubmit(onSubmit)} onFocus={() => void loadValidation()} noValidate className="space-y-5">
            <ol className="mb-8 flex items-center" aria-label={t.steps.join(' · ')}>
              {t.steps.map((label, index) => (
                <li key={label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex min-w-0 flex-col items-center gap-2">
                    <span className={cn('flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors', index < step ? 'border-gold-500 bg-gold-500 text-white' : index === step ? 'border-gold-500 bg-white text-gold-600 ring-4 ring-gold-100' : 'border-cream-300 bg-white text-neutral-400')}>
                      {index < step ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span className={cn('text-center text-xs sm:text-sm', index <= step ? 'text-neutral-800' : 'text-neutral-400')}>{label}</span>
                  </div>
                  {index < t.steps.length - 1 && <span className={cn('mx-2 mb-6 h-px flex-1 sm:mx-4', index < step ? 'bg-gold-400' : 'bg-cream-300')} />}
                </li>
              ))}
            </ol>

            <div className="text-center">
              <h3 className="font-serif text-xl text-neutral-900">
                {step === 0 ? t.chooseTreatment : step === 1 ? t.chooseDateTime : t.yourDetails}
              </h3>
              {step === 1 && selectedTreatment && <p className="mt-1 text-sm text-neutral-600">{localizeTreatment(selectedTreatment, lang).name} · {selectedTreatment.duration_min} {t.duration}</p>}
            </div>

            {step === 0 && (
              <div>
                <input type="hidden" {...register('treatment_id')} />
                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  {categoryOptions.map((item) => (
                    <button key={item.id} type="button" onClick={() => { setCategory(item.id); if (selectedTreatment?.category !== item.id) setValue('treatment_id', '', { shouldValidate: true }) }} className={cn('rounded-full border px-4 py-2 text-sm transition-colors', category === item.id ? 'border-gold-500 bg-gold-500 text-white' : 'border-cream-300 bg-white text-neutral-700 hover:border-gold-400')}>
                      {item[lang]}
                    </button>
                  ))}
                </div>
                {category ? <div className="grid gap-2 sm:grid-cols-2">
                  {treatments.filter((treatment) => treatment.category === category).map((tr) => {
                    const selected = treatmentId === tr.id
                    return (
                      <button key={tr.id} type="button" onClick={() => setValue('treatment_id', tr.id, { shouldValidate: true })} className={cn('flex min-h-16 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors', selected ? 'border-gold-500 bg-gold-50' : 'border-cream-300 bg-white hover:border-gold-400')}>
                        <span className="min-w-0"><span className="block text-sm font-medium text-neutral-900">{localizeTreatment(tr, lang).name}</span><span className="mt-1 block text-xs text-neutral-500">{tr.duration_min} {t.duration}{tr.price_eur != null ? ` · ${t.priceFrom} ${tr.price_eur} €` : ''}</span></span>
                        {selected ? <Check className="h-5 w-5 shrink-0 text-gold-600" /> : <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />}
                      </button>
                    )
                  })}
                </div> : <p className="py-8 text-center text-sm text-neutral-500">{t.chooseTreatment}</p>}
                {errors.treatment_id && <p role="alert" className="mt-2 text-center text-sm text-red-700">{errors.treatment_id.message}</p>}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Field label={t.date} error={errors.preferred_date?.message}>
                  <input {...register('preferred_date')} type="date" min={today} className={inputClass(!!errors.preferred_date)} />
                </Field>
                {treatmentId && preferredDate && (
                  <Field label={t.time} error={errors.scheduled_at?.message}>
                    {slotsLoading ? <p className="text-base text-neutral-600">{t.searching}</p> : slots && slots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {slots.map((iso) => {
                          const label = new Date(iso).toLocaleTimeString(LOCALES[lang], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })
                          const selected = scheduledAt === iso
                          return <button key={iso} type="button" onClick={() => setValue('scheduled_at', iso, { shouldValidate: true })} className={cn('rounded-xl border px-3 py-2.5 text-sm transition-colors', selected ? 'border-gold-500 bg-gold-500 text-white' : 'border-cream-300 bg-white text-neutral-800 hover:border-gold-400')}>{label}</button>
                        })}
                      </div>
                    ) : <p className="text-base text-neutral-600">{t.noSlots}</p>}
                  </Field>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-cream-300 bg-white p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gold-600">{t.bookingSummary}</p>
                  <p className="font-medium text-neutral-900">{selectedTreatment ? localizeTreatment(selectedTreatment, lang).name : ''}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600"><CalendarDays className="h-4 w-4" />{preferredDate} <Clock3 className="ml-2 h-4 w-4" />{scheduledAt ? new Date(scheduledAt).toLocaleTimeString(LOCALES[lang], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }) : ''}</p>
                </div>
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
              </div>
            )}

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

            <div className="flex gap-3 pt-3">
              {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 px-5 py-3 text-sm text-neutral-700 hover:border-gold-400"><ChevronLeft className="h-4 w-4" />{t.back}</button>}
              {step < 2 ? (
                <button type="button" onClick={() => void continueStep()} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-white shadow-md shadow-gold-200 transition-colors hover:bg-gold-600"><span>{t.continue}</span><ChevronRight className="h-4 w-4" /></button>
              ) : (
                <button type="submit" disabled={status === 'loading'} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-white shadow-md shadow-gold-200 transition-colors hover:bg-gold-600">
                  {status === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" />{t.sending}</> : t.submit}
                </button>
              )}
            </div>
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
