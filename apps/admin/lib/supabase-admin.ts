import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente con service_role: bypassa RLS. Solo se importa desde Server
// Components / Server Actions — nunca desde un archivo 'use client'.
// patients/appointments no tienen políticas RLS para anon/authenticated
// a propósito (ver supabase/schema.sql), así que el panel admin necesita
// este acceso elevado para gestionar citas, pacientes y tratamientos.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})
