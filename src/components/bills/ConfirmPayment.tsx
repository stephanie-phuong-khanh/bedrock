'use client';

import { DynamicEmbeddedWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { PaymentCategory, Vendor } from '@/types/db-types';
import { useEffect, useState } from 'react';
import { FormSection } from '@/components/forms';
import Button from '@/components/dashboard/Button';
import { getPaymentNetworkNameFromId } from '@/constants/crypto';

interface ConfirmPaymentProps {
  selectedVendor: Vendor;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  amount: string;
  currency: string;
  receiverWalletAddress: string;
  paymentNetwork: string;
  memo?: string;
  selectedCategory?: PaymentCategory | null;
  onBack: () => void;
  onConfirm: () => void;
  isProcessingPayment?: boolean;
  paymentError?: string | null;
  paymentSuccess?: boolean;
  txHash?: string | null;
}

export default function ConfirmPayment({
  selectedVendor,
  invoiceNumber,
  invoiceDate,
  dueDate,
  amount,
  currency,
  receiverWalletAddress,
  paymentNetwork,
  memo,
  selectedCategory,
  onBack,
  onConfirm,
  isProcessingPayment = false,
  paymentError = null,
  paymentSuccess = false,
  txHash = null
}: ConfirmPaymentProps) {
  const { primaryWallet } = useDynamicContext();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletModalWasOpenedByConnectButton, setWalletModalWasOpenedByConnectButton] = useState(false);

  useEffect(() => {
    if (walletModalWasOpenedByConnectButton && primaryWallet !== null) {
      setShowWalletModal(false);
      setWalletModalWasOpenedByConnectButton(false); // reset
    }
  }, [primaryWallet, walletModalWasOpenedByConnectButton]);

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

      {/* Overview Section - Collapsible, starts collapsed */}
      <FormSection title="Overview" collapsible defaultExpanded={false}>
        <div className="cursor-not-allowed">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
          <input
            type="text"
            value={selectedVendor?.name || '(Blank)'}
            disabled
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            readOnly
          />
        </div>
        
        <div className="cursor-not-allowed">
          <label className="block text-sm font-medium text-gray-700 mb-2">Invoice number</label>
          <input
            type="text"
            value={invoiceNumber || '(Blank)'}
            disabled
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            readOnly
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="cursor-not-allowed">
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice date</label>
            <input
              type="date"
              value={invoiceDate || '(Blank)'}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="cursor-not-allowed">
            <label className="block text-sm font-medium text-gray-700 mb-2">Due date</label>
            <input
              type="date"
              value={dueDate || '(Blank)'}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              readOnly
            />
          </div>
        </div>
      </FormSection>

      {/* Payment Details Section - Collapsible, starts OPEN by default */}
      <FormSection title="Payment Details" collapsible defaultExpanded={true}>
        <div className="grid grid-cols-2 gap-4">
          <div className="cursor-not-allowed">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="text"
              value={amount}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="cursor-not-allowed">
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <input
              type="text"
              value={currency}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              readOnly
            />
          </div>
        </div>
        
        <div className="cursor-not-allowed">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pay to</label>
          <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 font-mono text-sm cursor-not-allowed">
            {/* Format full address with bold segments */}
            <span className="font-bold">{receiverWalletAddress.slice(0, 6)}</span>
            {receiverWalletAddress.slice(6, -4)}
            <span className="font-bold">{receiverWalletAddress.slice(-4)}</span>
          </div>
        </div>

        <div className="cursor-not-allowed">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Network</label>
          <input
            type="text"
            value={getPaymentNetworkNameFromId(paymentNetwork)}
            disabled
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            readOnly
          />
        </div>

        {/* Pay from */}
        {primaryWallet && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay from
            </label>
            <div className="relative">
              <div className="flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg bg-purple-50">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center" />
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {/* Format full address with bold segments */}
                    <span className="font-bold">{primaryWallet.address.slice(0, 6)}</span>
                    {primaryWallet.address.slice(6, -4)}
                    <span className="font-bold">{primaryWallet.address.slice(-4)}</span>
                  </span>
                </div>
                <button
                  onClick={() => setShowWalletModal(true)}
                  disabled={isProcessingPayment || paymentSuccess}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </FormSection>

      {/* Details Section - Collapsible, starts collapsed */}
      <FormSection title="Details" collapsible defaultExpanded={false}>
        <div className="cursor-not-allowed">
          <label className="block text-sm font-medium text-gray-700 mb-2">Memo</label>
          <input
            type="text"
            value={memo || '(Blank)'}
            disabled
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            readOnly
          />
        </div>

        <div className="cursor-not-allowed">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <input
            type="text"
            value={selectedCategory?.name || '(Blank)'}
            disabled
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            readOnly
          />
        </div>

        {/* <div className="cursor-not-allowed">
          <label className="block text-sm font-medium text-gray-700 mb-2">Department (TODO)</label>
          <input
            type="text"
            value={departmentId || '(Blank)'}
            disabled
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            readOnly
          />
        </div> */}
      </FormSection>
      
      {/* Action Buttons */}
      <div className="flex justify-end items-center pt-6 gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={onBack}
          disabled={isProcessingPayment}
          className="w-[180px] whitespace-nowrap overflow-hidden text-ellipsis"
        >
          Back
        </Button>

        {!primaryWallet ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setShowWalletModal(true);
              setWalletModalWasOpenedByConnectButton(true);
            }}
            className="w-[180px] whitespace-nowrap overflow-hidden text-ellipsis"
          >
            Connect wallet
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={isProcessingPayment || paymentSuccess}
            className="w-[180px] whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {paymentSuccess ? 'Payment Complete' : 'Complete payment'}
          </Button>
        )}
      </div>
      
      {/* Wallet Modal */}
      {showWalletModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowWalletModal(false)}
        >
          <div 
            className="bg-white rounded-lg w-96 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <DynamicEmbeddedWidget />
          </div>
        </div>
      )}
    </div>
  );
}
