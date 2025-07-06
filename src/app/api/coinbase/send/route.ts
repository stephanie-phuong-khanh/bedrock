import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getUserTokens } from "../../auth/[...nextauth]/route";
import tokenStore from "../../../../lib/tokenStore";

export async function POST(request: NextRequest) {
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
    console.log("Session user ID:", session.user.id);
    const userTokens = getUserTokens(session.user.id);
    
    if (!userTokens?.accessToken) {
      console.log("No tokens found for user ID:", session.user.id);
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 }
      );
    }
    
    console.log("Found tokens for user ID:", session.user.id);

    // Parse request body
    const { accountId, type, to, amount, currency, description, network, idem } = await request.json();
    
    // Validate required fields
    if (!accountId || !type || !to || !amount || !currency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get 2FA token from headers if present
    const twoFactorToken = request.headers.get("CB-2FA-TOKEN");
    
    // Prepare headers
    let headers: HeadersInit = {
      "Authorization": `Bearer ${userTokens.accessToken}`,
      "Content-Type": "application/json",
    };
    
    // Add 2FA token if present
    if (twoFactorToken) {
      console.log("Including 2FA token in request", twoFactorToken);
      headers["CB-2FA-TOKEN"] = twoFactorToken;
      
      // Add CB-VERSION header for all requests
      headers["CB-VERSION"] = "2023-04-01";
      
      console.log("Using idempotency key for 2FA retry:", idem);
    } else {
      // Add CB-VERSION header for all requests
      headers["CB-VERSION"] = "2023-04-01";
    }

    // Format the request body according to Coinbase API requirements
    interface SendRequestBody {
        type: string;
        to: string;
        amount: string;
        currency: string;
        description: string;
        idem: string;
        network?: string;
    }
    
    const requestBody: SendRequestBody = {
        type: "send",
        to: to,
        amount: amount,
        currency: currency,
        description: description || "Sent via Bedrock Pay",
        idem: idem
    };
    
    // Only add network if provided
    if (network) {
        requestBody.network = network;
    }
    
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    // Make the request to Coinbase API to send crypto
    const response = await fetch(`https://api.coinbase.com/v2/accounts/${accountId}/transactions`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Check if there was an error
    if (!response.ok) {
      console.error("Coinbase API error:", data, "Status:", response.status);
      
      // If this is a 2FA required error (status 402), pass it through to the client
      if (response.status === 402 || 
          (data.errors && 
           data.errors[0] && 
           data.errors[0].id === "two_factor_required")) {
        console.log("2FA required detected, status:", response.status);
        return NextResponse.json(
          { 
            errors: data.errors,
            requires2FA: true 
          },
          { status: 402 } // Always return 402 for 2FA required
        );
      }
      
      return NextResponse.json(
        { error: data.errors?.[0]?.message || "Failed to send crypto" },
        { status: response.status }
      );
    }
    
    // Return the transaction data to the client
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error sending crypto:", error);
    return NextResponse.json(
      { error: "Failed to send crypto" },
      { status: 500 }
    );
  }
}
