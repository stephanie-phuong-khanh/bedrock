'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Ethereum } from "@thirdweb-dev/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with proper configuration for v4
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThirdwebProvider
        activeChain={Ethereum}
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        dAppMeta={{
          name: "Bedrock BillPay",
          description: "Pay bills with crypto",
          logoUrl: "",
          url: "",
          isDarkMode: false,
        }}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThirdwebProvider>
    </SessionProvider>
  );
}
