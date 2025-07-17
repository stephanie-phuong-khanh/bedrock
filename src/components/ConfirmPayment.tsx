'use client';

import { DynamicEmbeddedWidget, DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Vendor } from '@/types/supabase';
import { useState } from 'react';

interface ConfirmPaymentProps {
  selectedVendor: Vendor | null;
  amount: number;
  currency: string;
  walletAddress: string;
  network: string;
  memo: string;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ConfirmPayment({
  selectedVendor,
  amount,
  currency,
  walletAddress,
  network,
  memo,
  onBack,
  onConfirm
}: ConfirmPaymentProps) {
  const { primaryWallet } = useDynamicContext();
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold mb-6">Review Payment</h3>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedVendor?.name || 'Unknown Vendor'}</p>
            </div>
            <div className="text-right">
              <p className="font-mono">{walletAddress}</p>
              <p className="text-gray-500 text-sm">{network}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded space-y-2">
            <div className="flex justify-between">
              <p>Amount:</p>
              <p className="font-medium">{amount} {currency}</p>
            </div>
            <div className="flex justify-between">
              <p>USD Equivalent:</p>
              <p>TODO</p>
            </div>
            <div className="flex justify-between">
              <p>Est. Gas Fee:</p>
              <p>TODO</p>
            </div>
          </div>
        </div>
        
        {memo && (
          <div>
            <h4 className="text-lg font-medium mb-2">Memo</h4>
            <div className="bg-gray-50 p-4 rounded">
              <p>{memo}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
        >
          Back
        </button>

        {!primaryWallet ? (
          <DynamicWidget variant="modal" innerButtonComponent={<>Connect Wallet</>}/>
        ) : (
          <div className="relative">
            <div className="flex">
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-black text-white rounded-l hover:bg-gray-800 flex items-center"
              >
                Pay from {formatAddress(primaryWallet.address)}
              </button>
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="px-3 py-2 bg-black text-white rounded-r hover:bg-gray-800 border-l border-gray-600 flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${showWalletDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {showWalletDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-30">
                <button
                  onClick={() => {
                    setShowWalletDropdown(false);
                    setShowWalletModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Change wallet
                </button>
              </div>
            )}
            
            {/* Overlay to close dropdown when clicking outside */}
            {showWalletDropdown && (
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setShowWalletDropdown(false)}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Dynamic Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DynamicEmbeddedWidget/>
          </div>
        </div>
      )}
    </div>
  );
}
