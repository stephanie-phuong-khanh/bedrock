'use client';

import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

export default function ConnectWalletButton() {
    return (
        <DynamicWidget
            variant="modal"
            innerButtonComponent={<>Connect Wallet</>}
        />
    )
}
