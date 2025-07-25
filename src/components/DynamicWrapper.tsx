'use client'

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ReactNode } from "react";

export function DynamicWrapper({ children }: { children: ReactNode }) {
  return (
    <DynamicContextProvider
        settings={{
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "",
          initialAuthenticationMode: 'connect-and-sign', // default option
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        {children}
      </DynamicContextProvider>
  );
}
