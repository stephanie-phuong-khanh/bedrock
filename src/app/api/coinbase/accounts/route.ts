import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getUserTokens } from "../../auth/[...nextauth]/route";
import tokenStore from "../../../../lib/tokenStore";

export async function GET(request: NextRequest) {
  try {
    // Get the session from the server side
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get tokens from server-side storage
    const userTokens = getUserTokens(session.user.id);
    
    if (!userTokens?.accessToken) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 }
      );
    }

    // Make the request to Coinbase API from the server side
    const response = await fetch("https://api.coinbase.com/v2/accounts", {
      headers: {
        Authorization: `Bearer ${userTokens.accessToken}`,
        "CB-VERSION": "2023-04-01",
      },
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the data to the client
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching Coinbase accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
