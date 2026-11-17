export type TreatmentCategory = 'facial' | 'corporal' | 'laser' | 'capilar' | 'bienestar'

export interface Treatment {
  id: string
  name: string
  category: TreatmentCategory
  description: string | null
  duration_min: number
  price_eur: number | null
  is_active: boolean
  image_url: string | null
  image_urls?: string[]
  variants?: TreatmentVariant[]
  created_at: string
}

export interface TreatmentVariant {
  id: string
  treatment_id: string
  name: string
  duration_min: number
  price_eur: number
  is_active: boolean
  created_at?: string
}
