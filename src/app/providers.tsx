'use client';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { UserSessionProvider } from "@/context/UserSessionContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DynamicContextProvider
        settings={{
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "",
          initialAuthenticationMode: 'connect-and-sign', // default option
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <UserSessionProvider>
          {children}
        </UserSessionProvider>
      </DynamicContextProvider>
    </SessionProvider>
  );
}
