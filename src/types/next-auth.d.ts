declare module "next-auth" {
  // Define a type for the Supabase user
  interface SupabaseUser {
    id: string;
    email: string;
    // Add other fields from your Supabase users table as needed
    created_at?: string;
    updated_at?: string;
    // Add any other fields your users table has
  }

  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      supabaseUser?: SupabaseUser
    }
  }
}
