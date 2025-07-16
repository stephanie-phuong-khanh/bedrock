'use client';

import { Vendor } from '@/types/supabase';

interface ConfirmPaymentProps {
  selectedVendor: Vendor | null;
  amount: number;
  currency: string;
  walletAddress: string;
  network: string;
  category: string;
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
  category,
  memo,
  onBack,
  onConfirm
}: ConfirmPaymentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Confirm Payment</h3>
        <p className="text-gray-600">Review the details before sending your payment</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium mb-2">Paying to</h4>
          <div className="bg-gray-50 p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedVendor?.name || 'Unknown Vendor'}</p>
              <p className="text-gray-500 text-sm">{category || 'Professional services'}</p>
            </div>
            <div className="text-right">
              <p className="font-mono">{walletAddress}</p>
              <p className="text-gray-500 text-sm">{network}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-2">Payment details</h4>
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          (dummy) Confirm &amp; Send Payment
        </button>
      </div>
    </div>
  );
}
