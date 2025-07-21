'use client';

import { Vendor } from '@/types/supabase';
import { getBlockExplorerUrl, getNetwork } from '../../constants/crypto';

interface CompletedPaymentProps {
  selectedVendor: Vendor | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAsset: string;
  cryptoAmount: string;
  fxRate: number;
  walletAddress: string;
  network: string;
  txHash: string;
  onClose: () => void;
}

export default function CompletedPayment({
  selectedVendor,
  fiatAmount,
  fiatCurrency,
  cryptoAsset,
  cryptoAmount,
  fxRate,
  walletAddress,
  network,
  txHash,
  onClose,
}: CompletedPaymentProps) {
  const blockExplorerUrl = getBlockExplorerUrl(network, txHash);
  const networkInfo = getNetwork(network);

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Complete!</h2>
          <p className="text-gray-600 mt-2">Your payment has been successfully processed</p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Fiat Amount:</span>
            <span className="font-medium">{fiatAmount} {fiatCurrency}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Crypto Amount:</span>
            <span className="font-medium">{cryptoAmount} {cryptoAsset} (exchange rate: {fxRate})</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Vendor:</span>
            <span className="font-medium">{selectedVendor?.name || 'Unknown'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Wallet Address:</span>
            <span className="font-mono text-sm break-all">{walletAddress}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Network:</span>
            <span className="font-medium">{networkInfo?.name || network}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Hash:</span>
            <span className="font-mono text-sm break-all">{txHash}</span>
          </div>
        </div>
      </div>

      {/* View Transaction Link */}
      {blockExplorerUrl && (
        <div className="text-center">
          <a
            href={blockExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Transaction
          </a>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
