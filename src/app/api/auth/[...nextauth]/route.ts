import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { SupabaseUser } from "next-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists in Supabase - use admin client to bypass RLS
        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking for existing user:', fetchError);
          return false;
        }

        // If user doesn't exist, create them - use admin client to bypass RLS
        if (!existingUser) {
          const { error: createError } = await supabaseAdmin
            .from('users')
            .insert([
              {
                email: user.email,
                name: user.name,
                avatar_url: user.image,
                auth_provider: 'google',
                auth_provider_id: account?.providerAccountId,
              },
            ]);

          if (createError) {
            console.error('Error creating user in Supabase:', createError);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async session({ session }) {
      if (session?.user?.email) {
        // Get user data from Supabase to enrich the session - use admin client to bypass RLS
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          // Add custom user data to the session
          (session.user as { id?: string }).id = userData.id;
          (session.user as { supabaseUser?: SupabaseUser }).supabaseUser = userData;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
