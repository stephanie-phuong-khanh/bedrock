import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET as string

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create an admin client for server-side operations that bypass RLS
// ONLY USE THIS IN SERVER-SIDE CODE
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function createUserSupabaseClient() {
	const session = await getServerSession(authOptions);

	if (!session?.supabaseUid) {
		throw new Error("Unauthorized, no supabaseUid in session");
	}

	console.log('Supabase UID:', session.supabaseUid);

	const jwtPayload = {
		sub: session.supabaseUid,
		role: "authenticated"
	};

	const userToken = jwt.sign(jwtPayload, supabaseJwtSecret, {
		algorithm: "HS256",
		expiresIn: "1h",
	});

	const supabase = createClient(supabaseUrl, supabaseAnonKey, {
		global: {
			headers: {
				Authorization: `Bearer ${userToken}`,
			},
		},
	});

	return {
		supabase,
		userId: session.userId,
		userEmail: session.user?.email,
		supabaseUid: session.supabaseUid
	}
}
