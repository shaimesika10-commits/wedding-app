import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kzipodrumrihbwwzncea.supabase.co'
const supabaseKey = 'sb_publishable_gGG4Y8uQvf3LEcrBlG_EGQ_ySbT4JCR'

export const supabase = createClient(supabaseUrl, supabaseKey)
