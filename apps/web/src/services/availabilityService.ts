import { supabase } from '@/lib/supabase'

export const fetchAvailableSlots = async (
  date: string,
  treatmentId: string
): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_available_slots', {
    p_date: date,
    p_treatment_id: treatmentId,
  })

  if (error) {
    console.warn('[availabilityService] No se pudieron cargar los huecos:', error.message)
    return []
  }

  return (data as string[]) ?? []
}
