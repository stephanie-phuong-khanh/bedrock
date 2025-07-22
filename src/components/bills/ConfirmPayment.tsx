'use client';

import { DynamicEmbeddedWidget, DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Vendor } from '@/types/supabase';
import { useState } from 'react';
import { formatTruncatedAddress, formatStyledAddress } from '@/lib/wallet-utils';
import { FormSection } from '../forms';
import Button from '../dashboard/Button';

interface ConfirmPaymentProps {
  selectedVendor: Vendor | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAsset: string;
  cryptoAmount: string;
  fxRate: number;
  walletAddress: string;
  network: string;
  memo: string;
  onBack: () => void;
  onConfirm: () => void;
  isProcessingPayment?: boolean;
  paymentError?: string | null;
  paymentSuccess?: boolean;
  txHash?: string | null;
}

export default function ConfirmPayment({
  selectedVendor,
  fiatAmount,
  fiatCurrency,
  cryptoAsset,
  cryptoAmount,
  fxRate,
  walletAddress,
  network,
  memo,
  onBack,
  onConfirm,
  isProcessingPayment = false,
  paymentError = null,
  paymentSuccess = false,
  txHash = null
}: ConfirmPaymentProps) {
  const { primaryWallet } = useDynamicContext();
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div className="px-4 pt-2 pb-4 space-y-8 relative">
      {/* Payment Processing Overlay */}
      {isProcessingPayment && (
        <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Awaiting wallet confirmation</h3>
            <p className="text-gray-600 mb-2">Please check your wallet to sign the transaction</p>
            <p className="text-sm text-red-600 font-medium">Please do not close or refresh the browser</p>
          </div>
        </div>
      )}

      {/* Success State */}
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-green-800">Payment Successful!</h3>
          </div>
          <p className="text-green-700 mb-2">Your payment has been confirmed on the blockchain.</p>
          {txHash && (
            <p className="text-sm text-green-600">
              Transaction: <span className="font-mono">{txHash}</span>
            </p>
          )}
        </div>
      )}

      {/* Error State */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-2">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-red-800">Payment Failed</h3>
          </div>
          <p className="text-red-700">{paymentError}</p>
        </div>
      )}

      <FormSection title="Payment Details">
        {/* Vendor and Wallet Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900">{selectedVendor?.name || 'Unknown Vendor'}</p>
            <p className="text-sm text-gray-500">Recipient</p>
          </div>
          <div className="text-right">
            {formatStyledAddress(walletAddress)}
            <p className="text-gray-500 text-sm">{network}</p>
          </div>
        </div>
        
        {/* Payment Amounts */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Amount</span>
            <span className="font-medium text-gray-900">{fiatAmount} {fiatCurrency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Asset</span>
            <span className="font-medium text-gray-900">{cryptoAmount} {cryptoAsset}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Exchange Rate</span>
            <span className="text-gray-500">{fxRate} {fiatCurrency}/{cryptoAsset}</span>
          </div>
        </div>
        
        {memo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Memo</h4>
            <p className="text-gray-900">{memo}</p>
          </div>
        )}
      </FormSection>
      
      {!primaryWallet ? (
        <div className="flex justify-center pt-6">
          <DynamicWidget variant="modal" innerButtonComponent={<>Connect Wallet</>}/>
        </div>
      ) : (
        <div className="flex justify-between items-center pt-6">
          <Button
            variant="secondary"
            size="md"
            onClick={onBack}
            disabled={isProcessingPayment}
          >
            Back
          </Button>

          <div className="relative">
            <div className="flex">
              <Button
                variant="primary"
                size="md"
                onClick={onConfirm}
                disabled={isProcessingPayment || paymentSuccess}
                className="rounded-r-none"
              >
                {paymentSuccess ? 'Payment Complete' : `Pay from ${formatTruncatedAddress(primaryWallet.address)}`}
              </Button>
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                disabled={isProcessingPayment || paymentSuccess}
                className="px-3 py-2 bg-[var(--color-primary)] text-white rounded-r-lg hover:bg-[var(--color-primary-hover)] border-l border-gray-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                <button
                  onClick={() => {
                    setShowWalletDropdown(false);
                    setShowWalletModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center rounded-lg"
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
        </div>
      )}
      
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
