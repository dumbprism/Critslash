import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type WatchlistItem = {
    id: string
    user_id: string
    film_title: string
    film_year: string | null
    film_director: string | null
    film_description: string | null
    film_reason: string | null
    film_poster: string | null
    created_at: string
}
