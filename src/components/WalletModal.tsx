'use client';

import { useState, useEffect } from 'react';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WalletModal({ isOpen, onClose, onSuccess }: WalletModalProps) {
  const [mounted, setMounted] = useState(false);
  const { primaryWallet, user } = useDynamicContext();

  // Handle client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // When wallet is connected, call onSuccess callback
  useEffect(() => {
    if (primaryWallet && user && onSuccess) {
      onSuccess();
    }
  }, [primaryWallet, user, onSuccess]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Connect your wallet</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Connect your wallet to complete this payment. You will be able to review the transaction before sending.
          </p>
          
          {/* Dynamic.xyz Widget */}
          <div className="flex justify-center">
            <DynamicWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
