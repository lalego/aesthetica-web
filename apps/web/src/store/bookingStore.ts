// store/bookingStore.ts - Estado global tipo Service
import { create } from 'zustand'

type BookingState = {
  selectedDate: Date | null
  setSelectedDate: (date: Date) => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date })
}))

// hooks/useBookings.ts - "Service" para datos
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('citas').select('*')
      if (error) throw error
      return data
    }
  })
}