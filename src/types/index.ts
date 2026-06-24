export type TreatmentCategory = 'facial' | 'corporal' | 'bienestar' | 'capilar'

export interface Treatment {
  id: string
  name: string
  category: TreatmentCategory
  description: string | null
  duration_min: number
  price_eur: number | null
  is_active: boolean
  image_url: string | null
  created_at: string
}
