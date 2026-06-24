import { supabase } from '@/lib/supabase'
import type { Treatment } from '@/types'

// Datos de ejemplo (seed.sql) — se usan como fallback si Supabase no está configurado
export const MOCK_TREATMENTS: Treatment[] = [
  {
    id: '1',
    name: 'Rellenos dérmicos',
    category: 'facial',
    description: 'Ácido hialurónico para restaurar volumen y suavizar arrugas de forma natural.',
    duration_min: 45,
    price_eur: 350,
    is_active: true,
    image_url: null,
    created_at: '',
  },
  {
    id: '2',
    name: 'Toxina botulínica',
    category: 'facial',
    description: 'Suavizado de líneas de expresión con resultados visibles desde la primera sesión.',
    duration_min: 30,
    price_eur: 280,
    is_active: true,
    image_url: null,
    created_at: '',
  },
  {
    id: '3',
    name: 'Peeling químico',
    category: 'facial',
    description: 'Renovación celular profunda para una piel más luminosa y uniforme.',
    duration_min: 60,
    price_eur: 120,
    is_active: true,
    image_url: null,
    created_at: '',
  },
  {
    id: '4',
    name: 'Criolipólisis',
    category: 'corporal',
    description: 'Eliminación de grasa localizada sin cirugía ni tiempo de recuperación.',
    duration_min: 90,
    price_eur: 490,
    is_active: true,
    image_url: null,
    created_at: '',
  },
  {
    id: '5',
    name: 'Radiofrecuencia',
    category: 'corporal',
    description: 'Reafirmación corporal no invasiva que estimula la producción de colágeno.',
    duration_min: 60,
    price_eur: 180,
    is_active: true,
    image_url: null,
    created_at: '',
  },
  {
    id: '6',
    name: 'Mesoterapia facial',
    category: 'bienestar',
    description: 'Revitalización con cóctel de vitaminas, minerales y ácido hialurónico.',
    duration_min: 50,
    price_eur: 160,
    is_active: true,
    image_url: null,
    created_at: '',
  },
]

export const fetchTreatments = async (): Promise<Treatment[]> => {
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('is_active', true)
    .order('category')

  if (error) {
    console.warn('[treatmentService] Supabase no disponible, usando mock data:', error.message)
    return MOCK_TREATMENTS
  }

  return (data as Treatment[]) ?? MOCK_TREATMENTS
}
