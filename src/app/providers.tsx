'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { 
  DynamicContextProvider
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DynamicContextProvider
        settings={{
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_SANDBOX_ENV_ID || "",
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        {children}
      </DynamicContextProvider>
    </SessionProvider>
  );
}
