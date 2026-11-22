import { useQuery } from '@tanstack/react-query'
import { fetchAvailableSlots } from '@/services/availabilityService'

export const useAvailableSlots = (date: string, treatmentId: string, variantId?: string | null) =>
  useQuery({
    queryKey: ['slots', date, treatmentId, variantId],
    queryFn: () => fetchAvailableSlots(date, treatmentId, variantId),
    enabled: !!date && !!treatmentId,
  })
