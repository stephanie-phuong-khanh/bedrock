'use client';

import { useState, useEffect } from 'react';
import { getBlockExplorerUrl, getPaymentNetworkNameFromId } from '@/constants/crypto';
import { InvoiceWithSignedUrl } from '@/types/db-types';
import SidePanel from '@/components/dashboard/SidePanel';
import InvoicePanel from '@/components/bills/InvoicePanel';
import { FormSection } from '@/components/forms';
import Button from '@/components/dashboard/Button';
import { invoiceWithSignedUrlSchema } from '@/types/zod';
import { PaymentEnriched } from '@/types/db-types';

interface PaymentDetailsProps {
  payment: PaymentEnriched | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentDetails({ payment, isOpen, onClose }: PaymentDetailsProps) {
  const [invoice, setInvoice] = useState<InvoiceWithSignedUrl| null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

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

  // Fetch invoice with signed URL when payment changes
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!payment?.invoice_id) {
        setInvoice(null);
        return;
      }

      setIsLoadingInvoice(true);
      try {
        const response = await fetch(`/api/invoices/${payment.invoice_id}`);
        if (!response.ok) {
          console.error('Failed to fetch invoice:', response.statusText);
          return;
        }

        const data = await response.json();
        if (!data.success) {
          console.error('Invoice fetch did not return success:', data.error);
          return;
        }

        const parsed = invoiceWithSignedUrlSchema.safeParse(data.invoice);
        if (!parsed.success) {
          console.error('Invalid invoice data:', parsed.error);
          return;
        }

        setInvoice(parsed.data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setIsLoadingInvoice(false);
      }
    };

    if (isOpen && payment) {
      fetchInvoice();
    }
  }, [payment, isOpen]);

  if (!isOpen || !payment) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      layout={payment.invoice_id ? 'dual' : 'single'}
      title="Payment details"
      width={payment.invoice_id ? 'full' : 'half'}
      leftContent={payment.invoice_id ? (
        isLoadingInvoice ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : invoice ? (
          <InvoicePanel 
            invoice={invoice}
            // No onUploadInvoice or onDelete props = read-only mode
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No invoice available</p>
          </div>
        )
      ) : undefined}
      rightContent={
        <div className="p-8">
          <div className="px-4 pt-2 pb-4 space-y-8 relative">
            {/* Overview Section */}
            <FormSection title="Overview" collapsible defaultExpanded={false}>
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <input
                  type="text"
                  value={`${payment.vendor?.name}`}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>
              
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice #</label>
                <input
                  type="text"
                  value={payment.invoice_number || '(Blank)'}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="cursor-not-allowed">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                  <input
                    type="text"
                    value={formatDate(payment.invoice_date) || '(Blank)'}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="cursor-not-allowed">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="text"
                    value={formatDate(payment.due_date) || '(Blank)'}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
            </FormSection>

            {/* Payment Details Section */}
            <FormSection title="Payment" collapsible defaultExpanded={true}>
              <div className="grid grid-cols-2 gap-4">
                <div className="cursor-not-allowed">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="text"
                    value={payment.amount.toString()}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="cursor-not-allowed">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <input
                    type="text"
                    value={payment.currency}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid to</label>
                <input
                  type="text"
                  value={payment.receiver_wallet_address || 'N/A'}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-mono text-sm"
                  readOnly
                />
              </div>

              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid from</label>
                <input
                  type="text"
                  value={payment.sender_wallet_address || 'N/A'}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-mono text-sm"
                  readOnly
                />
              </div>
              
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
                <input
                  type="text"
                  value={getPaymentNetworkNameFromId(payment.payment_network)}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>
              
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid date</label>
                <input
                  type="text"
                  value={formatDate(payment.paid_date)}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>
            </FormSection>

            {/* Details Section */}
            <FormSection title="Details" collapsible defaultExpanded={false}>
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Memo</label>
                <input
                  type="text"
                  value={payment.memo || '(Blank)'}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={payment.payment_category?.name || '(Blank)'}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>
            </FormSection>

            {/* Transaction link */}
            {payment.tx_hash && (
              <div className="pt-2">
                <a
                  href={getBlockExplorerUrl(payment.payment_network, payment.tx_hash)}
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

            {/* TODO: If no transaction hash, show a button to manually record the transaction hash before saving. */}

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
        </div>
      }
    />
  );
}
