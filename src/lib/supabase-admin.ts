import { createClient } from '@supabase/supabase-js'

// These environment variables need to be set in your Vercel project settings
// or in a .env.local file during local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

// Create an admin client for server-side operations that bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Ensure the vendor tax files storage bucket exists
export async function ensureVendorTaxFilesBucket() {
  const { error } = await supabaseAdmin.storage.getBucket('vendor-tax-files');
  
  if (error && error.message.includes('does not exist')) {
    await supabaseAdmin.storage.createBucket('vendor-tax-files', {
      public: false, // Keep files private
      fileSizeLimit: 10485760, // 10MB limit
    });
    console.log('Created vendor-tax-files bucket');
  }
}
