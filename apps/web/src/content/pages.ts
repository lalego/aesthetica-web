import { CLINIC } from '@/config/clinic'
import type { TreatmentCategory } from '@/types'

// ─────────────────────────────────────────────────────────────────
//  EDITA AQUÍ — título (≤ 60 caracteres), descripción (≤ 155) y H1
//  de las páginas fijas. Los de tratamientos están en landings.ts.
// ─────────────────────────────────────────────────────────────────

export const HOME_PAGE = {
  es: {
    title: 'Estudio de Estética en Ruzafa, Valencia | AestheticA',
    description: 'Estudio de estética avanzada en Ruzafa, Valencia: tratamientos faciales, depilación láser diodo, corporales y masajes. Reserva tu cita online.',
  },
  en: {
    title: 'Beauty & Aesthetics Studio in Ruzafa, Valencia | AestheticA',
    description: 'Advanced aesthetics studio in Ruzafa, Valencia: facials, diode laser hair removal, body treatments and massage. Book your appointment online.',
  },
}

export const HUB_PAGE = {
  es: {
    title: 'Tratamientos de Estética en Valencia (Ruzafa) | AestheticA',
    description: 'Tratamientos faciales, depilación láser diodo, corporales, masajes y packs para novias en nuestro estudio de Ruzafa, Valencia. Precios y reserva online.',
    h1: 'Tratamientos de estética avanzada en Valencia',
    intro: [
      'Todos nuestros tratamientos, con precio y duración. Elige una categoría o reserva directamente: el primer paso siempre es una valoración personalizada en el estudio.',
    ],
  },
  en: {
    title: 'Beauty Treatments in Valencia (Ruzafa) | AestheticA',
    description: 'Facials, diode laser hair removal, body treatments, massage and bridal packages at our studio in Ruzafa, Valencia. Prices and online booking.',
    h1: 'Advanced aesthetic treatments in Valencia',
    intro: [
      'All our treatments with prices and duration. Pick a category or book straight away: the first step is always a personalised assessment at the studio.',
    ],
  },
}

export const ABOUT_PAGE = {
  es: {
    title: 'Sobre Nosotros: Alena Martseniuk | AestheticA Valencia',
    description: 'Conoce a Alena Martseniuk, fundadora del estudio de estética avanzada AestheticA en Ruzafa, Valencia. Más de 25 años de experiencia.',
    h1: 'Alena Martseniuk y el estudio AestheticA',
  },
  en: {
    title: 'About Us: Alena Martseniuk | AestheticA Valencia',
    description: 'Meet Alena Martseniuk, founder of the AestheticA advanced aesthetics studio in Ruzafa, Valencia. Over 25 years of experience.',
    h1: 'Alena Martseniuk and the AestheticA studio',
  },
}

export const CONTACT_PAGE = {
  es: {
    title: 'Contacto y Cómo Llegar | AestheticA Ruzafa, Valencia',
    description: `Estudio de estética en ${CLINIC.address.street}, Ruzafa, Valencia. Teléfono ${CLINIC.contact.phone}, WhatsApp y horario.`,
    h1: 'Contacto: estudio de estética en Ruzafa',
    intro: [
      `Estamos en ${CLINIC.address.full}, a pocos minutos del Mercado de Ruzafa. Llámanos, escríbenos por WhatsApp o reserva online.`,
    ],
  },
  en: {
    title: 'Contact & How to Find Us | AestheticA Ruzafa, Valencia',
    description: `Aesthetics studio at ${CLINIC.address.street}, Ruzafa, Valencia. Phone ${CLINIC.contact.phone}, WhatsApp and opening hours.`,
    h1: 'Contact: aesthetics studio in Ruzafa',
    intro: [
      `You will find us at ${CLINIC.address.full}, a few minutes from Ruzafa Market. Call us, message us on WhatsApp or book online.`,
    ],
  },
}

export const CATEGORY_LABELS: Record<TreatmentCategory, { es: string; en: string }> = {
  facial:    { es: 'Facial',    en: 'Facial' },
  corporal:  { es: 'Corporal',  en: 'Body' },
  laser:     { es: 'Láser',     en: 'Laser' },
  capilar:   { es: 'Capilar',   en: 'Hair' },
  bienestar: { es: 'Bienestar', en: 'Wellness' },
}
// ─────────────────────────────────────────────────────────────────
