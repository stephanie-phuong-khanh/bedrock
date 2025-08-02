'use client';

import { getBlockExplorerUrl, getNetwork } from '@/constants/crypto';
import { FormInput } from '@/components/forms';
import Button from '@/components/dashboard/Button';
import { Vendor } from '@/types/db-types';

interface CompletedPaymentProps {
  selectedVendor: Vendor | null;
  amount: string;
  currency: string;
  receiverWalletAddress: string;
  paymentNetwork: string;
  paidAt?: Date | null;
  txHash: string;
  onClose: () => void;
}

export default function CompletedPayment({
  selectedVendor,
  amount,
  currency,
  receiverWalletAddress,
  paymentNetwork,
  paidAt,
  txHash,
  onClose,
}: CompletedPaymentProps) {
  const blockExplorerUrl = getBlockExplorerUrl(paymentNetwork, txHash);
  const networkInfo = getNetwork(paymentNetwork);

  return (
    <div className="px-4 pt-2 pb-4 space-y-6">
      {/* Success Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-normal text-gray-900">Payment complete!</h2>
          <p className="text-gray-600 text-sm">Your payment has been successfully processed</p>
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Payment Details - Using FormInput components for consistency */}
      <div className="space-y-4 mt-8">
        {/* Vendor */}
        <FormInput
          label="Vendor"
          id="vendor"
          value={selectedVendor?.name || 'Unknown'}
          onChange={() => {}} // No-op for read-only
          disabled
        />
        
        {/* Amount */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Amount"
            id="amount"
            value={amount}
            onChange={() => {}} // No-op for read-only
            disabled
          />
          <FormInput
            label="Currency"
            id="currency"
            value={currency}
            onChange={() => {}} // No-op for read-only
            disabled
          />
        </div>
        
        {/* Paid to */}
        <FormInput
          label="Paid to"
          id="paid-to"
          value={receiverWalletAddress}
          onChange={() => {}} // No-op for read-only
          disabled
          className="font-mono text-sm"
        />

        {/* Payment Network */}
        <FormInput
          label="Payment Network"
          id="payment-network"
          value={networkInfo?.name || paymentNetwork}
          onChange={() => {}} // No-op for read-only
          disabled
        />
        
        {/* Paid date */}
        <FormInput
          label="Paid date"
          id="paid-date"
          value={paidAt?.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) || 'N/A'}
          onChange={() => {}} // No-op for read-only
          disabled
        />
      </div>

      {/* View Transaction Link */}
      {blockExplorerUrl && (
        <div className="pt-2">
          <a
            href={blockExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-gray-900 hover:text-gray-700 text-sm font-medium underline"
          >
            <span>View transaction</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-4">
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
