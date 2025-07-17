'use client';

import { NETWORKS, getBlockExplorerUrl } from '@/constants/crypto';
import { PaymentWithVendorName } from '@/types/payments';

interface PaymentDetailsPanelProps {
  payment: PaymentWithVendorName | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentDetailsPanel({ payment, isOpen, onClose }: PaymentDetailsPanelProps) {
  // Format the date in a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen || !payment) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Payment details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
            <p className="text-2xl font-semibold text-gray-900">${payment.amount}</p>
          </div>

          {/* Asset */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Asset</h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">$</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{payment.currency}</p>
                <p className="text-xs text-gray-500">USD Coin</p>
              </div>
            </div>
          </div>

          {/* Network */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Network</h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">E</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {NETWORKS[payment.payment_network]?.name || payment.payment_network}
              </p>
            </div>
          </div>

          {/* Paid to */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Paid to</h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {payment.vendor_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{payment.vendor_name}</p>
                {payment.vendor_email && (
                  <p className="text-xs text-gray-500">{payment.vendor_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Paid date */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Paid date</h3>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-900">
                {formatDate(payment.confirmed_at || payment.created_at)}
              </p>
            </div>
          </div>

          {/* Invoice details */}
          {payment.invoice_data && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invoice #</span>
                  <span className="text-sm font-medium text-gray-900">
                    {payment.invoice_data.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {payment.invoice_data.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(payment.invoice_data.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transaction link */}
          {payment.tx_hash && (
            <div>
              <a
                href={getBlockExplorerUrl(payment.payment_network, payment.tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <span>View transaction</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
