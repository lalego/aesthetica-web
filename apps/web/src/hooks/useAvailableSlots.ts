import { useQuery } from '@tanstack/react-query'
import { fetchAvailableSlots } from '@/services/availabilityService'

export const useAvailableSlots = (date: string, treatmentId: string) =>
  useQuery({
    queryKey: ['slots', date, treatmentId],
    queryFn: () => fetchAvailableSlots(date, treatmentId),
    enabled: !!date && !!treatmentId,
  })
