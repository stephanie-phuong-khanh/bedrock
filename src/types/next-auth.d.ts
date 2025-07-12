/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    supabaseUid?: string;
    userId?: string;
  }

  interface JWT {
    supabaseUid?: string;
    userId?: string;
  }
}
