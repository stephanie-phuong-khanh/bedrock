import { createClient } from '@supabase/supabase-js'

// These environment variables need to be set in your Vercel project settings
// or in a .env.local file during local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

// Create an admin client for server-side operations that bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
