'use client';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { cssOverrides } from "@/lib/dynamic-styles";

export default function DynamicWrapper({ children }: { children: React.ReactNode }) {
	return (
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
	);
}
