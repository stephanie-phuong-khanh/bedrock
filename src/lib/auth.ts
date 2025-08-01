import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { supabaseAdmin } from "@/lib/supabase";
import { User, InsertUser } from "@/types/db-types";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (!user.email) return false;

			try {
				const { data: existingUser, error: fetchError } = await supabaseAdmin
					.from("users")
					.select("*")
					.eq("email", user.email)
					.single<User>();

				if (fetchError && fetchError.code !== "PGRST116") {
					console.error("Error checking for existing user:", fetchError);
					return false;
				}

				if (!existingUser) {
					if (!user.name) {
						console.error("User name is missing");
						return false;
					}
					if (!account?.providerAccountId) {
						console.error("Account provider account ID is missing");
						return false;
					}
					
					const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
						email: user.email,
						email_confirm: false,
						user_metadata: {
							auth_provider: "google",
							auth_provider_id: account?.providerAccountId,
						},
					});

					if (authError) {
						console.error("Error creating Supabase Auth User:", authError);
						return false;
					}

					const { error: createError } = await supabaseAdmin
						.from("users")
						.insert<InsertUser>([{
								supabase_uid: authUser.user.id,
								email: user.email,
								name: user.name,
								auth_provider: "google",
								auth_provider_id: account?.providerAccountId,
								avatar_url: user.image,
							}]);

					if (createError) {
						console.error("Error creating user in Supabase:", createError);
						return false;
					}
				}

				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false;
			}
		},

		async jwt({ token, user }) {
			if (!token.supabaseUid && user?.email) {
				try {
					const { data: dbUser, error } = await supabaseAdmin
						.from("users")
						.select("supabase_uid, id")
						.eq("email", user.email)
						.single<User>();

					if (error) {
						console.error("Error fetching supabase_uid in jwt callback:", error);
					}

					if (dbUser?.supabase_uid) {
						token.supabaseUid = dbUser.supabase_uid;
						token.userId = dbUser.id;
					}
				} catch (error) {
					console.error("Error in jwt callback:", error);
				}
			}
			return token;
		},

		async session({ session, token }) {
			if (token?.supabaseUid) {
				session.supabaseUid = token.supabaseUid as string;
				session.userId = token.userId as string;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};
