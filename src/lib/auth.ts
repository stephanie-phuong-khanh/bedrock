import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { supabaseAdmin } from "@/lib/supabase";
import { User, InsertUser, InsertPaymentCategory } from "@/types/db-types";
import { createUserSchema } from "@/types/zod";
import { DEFAULT_CATEGORY_NAMES } from "@/constants/seed";

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
					const parsedUserData = createUserSchema.safeParse({
						email: user.email,
						name: user.name,
						auth_provider: "google",
						auth_provider_id: account?.providerAccountId,
						avatar_url: user.image,
					});
					
					if (!parsedUserData.success) {
						console.error("Error parsing user data:", parsedUserData.error);
						return false;
					}
					
					const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
						email: user.email,
						email_confirm: false,
						user_metadata: {
							name: user.name,
							auth_provider: "google",
							auth_provider_id: account?.providerAccountId,
						},
					});

					if (authError) {
						console.error("Error creating Supabase Auth User:", authError);
						return false;
					}

					const { data: createdUser, error: createError } = await supabaseAdmin
						.from("users")
						.insert<InsertUser>([{
							...parsedUserData.data,
							supabase_uid: authUser.user.id,
						}])
						.select()
						.single<User>();

					if (createError) {
						console.error("Error creating user in Supabase:", createError);
						return false;
					}

					// Create default categories for the user
					const categoryInserts: InsertPaymentCategory[] = DEFAULT_CATEGORY_NAMES.map(name => ({
						name,
						user_id: createdUser.id,
						supabase_uid: authUser.user.id,
					}));

					const {	error: insertError } = await supabaseAdmin
						.from("payment_categories")
						.insert(categoryInserts);

					if (insertError) {
						console.error("Error creating default categories:", insertError);
						return false;
					}

					console.log("Default categories created successfully for user:", createdUser.id)
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
