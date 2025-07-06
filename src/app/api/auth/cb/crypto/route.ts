import { NextRequest, NextResponse } from "next/server";

/**
 * Custom callback handler for Coinbase OAuth
 * This route exists because Coinbase doesn't allow "coinbase" in redirect URIs
 * It simply redirects to the NextAuth callback handler
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  
  // Redirect to the actual NextAuth callback with the same parameters
  const redirectUrl = `/api/auth/callback/coinbase?code=${code}&state=${state}`;
  
  return NextResponse.redirect(new URL(redirectUrl, request.nextUrl.origin));
}
