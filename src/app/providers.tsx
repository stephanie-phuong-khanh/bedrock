'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { 
  DynamicContextProvider
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { cssOverrides } from "@/lib/dynamicStyles";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DynamicContextProvider
        settings={{
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "",
          initialAuthenticationMode: 'connect-and-sign', // default option
          walletConnectors: [EthereumWalletConnectors],
          cssOverrides,
        }}
      >
        {children}
      </DynamicContextProvider>
    </SessionProvider>
  );
}
