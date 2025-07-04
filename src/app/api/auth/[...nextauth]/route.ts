import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

// Server-side token storage (in-memory)
const tokens = new Map<string, { accessToken: string, refreshToken: string }>();

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "coinbase",
      name: "Coinbase",
      type: "oauth",
      clientId: process.env.COINBASE_CLIENT_ID || "",
      clientSecret: process.env.COINBASE_CLIENT_SECRET || "",
      authorization: {
        url: "https://www.coinbase.com/oauth/authorize",
        params: {
          scope: "wallet:accounts:read wallet:transactions:read wallet:transactions:send",
        },
      },
      token: "https://api.coinbase.com/oauth/token",
      userinfo: "https://api.coinbase.com/v2/user",
      profile(profile: any) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          email: profile.data.email,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (account && user) {
        // Store tokens server-side only
        tokens.set(user.id, {
          accessToken: account.access_token,
          refreshToken: account.refresh_token
        });
        
        // Only store user ID in the JWT, not the tokens
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Don't include tokens in the session sent to client
      if (session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

// Helper function to get tokens by user ID (for server-side use only)
export function getUserTokens(userId: string) {
  return tokens.get(userId);
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
