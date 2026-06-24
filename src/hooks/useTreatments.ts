import { useQuery } from '@tanstack/react-query'
import { fetchTreatments } from '@/services/treatmentService'

export const useTreatments = () =>
  useQuery({
    queryKey: ['treatments'],
    queryFn: fetchTreatments,
    staleTime: 1000 * 60 * 5, // 5 min — los tratamientos no cambian frecuentemente
  })
