import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null

export const roles = {
  customer: 'مشتری',
  representative: 'نماینده',
  consultant: 'مشاور',
  administrator: 'مدیر',
}
export type Role = keyof typeof roles
export const loginReturn = () => window.location.origin + window.location.pathname + window.location.search
