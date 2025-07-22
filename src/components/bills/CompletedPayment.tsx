'use client';

import { Vendor } from '@/types/supabase';
import { getBlockExplorerUrl, getNetwork } from '../../constants/crypto';
import { FormSection, FormInput } from '../forms';
import Button from '../dashboard/Button';

interface CompletedPaymentProps {
  selectedVendor: Vendor | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAsset: string;
  cryptoAmount: string;
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
  walletAddress,
  network,
  txHash,
  onClose,
}: CompletedPaymentProps) {
  const blockExplorerUrl = getBlockExplorerUrl(network, txHash);
  const networkInfo = getNetwork(network);

  return (
    <div className="px-4 pt-2 pb-4 space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment complete!</h2>
          <p className="text-gray-600 mt-2">Your payment has been successfully processed</p>
        </div>
      </div>

      {/* Payment Details as Form-like Display */}
      <FormSection title="Paid to">
        <FormInput
          label="Vendor"
          id="vendor"
          value={selectedVendor?.name || 'Unknown'}
          onChange={() => {}} // No-op for read-only
          disabled
        />
      </FormSection>

      <FormSection title="Amount">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Amount"
            id="amount"
            value={fiatAmount}
            onChange={() => {}} // No-op for read-only
            disabled
          />
          <FormInput
            label="Currency"
            id="currency"
            value={fiatCurrency}
            onChange={() => {}} // No-op for read-only
            disabled
          />
        </div>
      </FormSection>

      <FormSection title="Asset">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Amount"
            id="cryptoAmount"
            value={`${cryptoAmount} ${cryptoAsset}`}
            onChange={() => {}} // No-op for read-only
            disabled
          />
          <FormInput
            label="Network"
            id="network"
            value={networkInfo?.name || network}
            onChange={() => {}} // No-op for read-only
            disabled
          />
        </div>
      </FormSection>

      <FormSection title="Address">
        <FormInput
          label="Wallet Address"
          id="address"
          value={walletAddress}
          onChange={() => {}} // No-op for read-only
          disabled
          className="font-mono text-sm"
        />
      </FormSection>

      {/* View Transaction Link */}
      {blockExplorerUrl && (
        <div className="pt-2">
          <a
            href={blockExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors duration-200 w-full justify-center"
          >
            <span>View transaction</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          className="px-8"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
