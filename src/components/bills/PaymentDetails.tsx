'use client';

import { useState, useEffect } from 'react';
import { getBlockExplorerUrl, getPaymentNetworkNameFromId } from '@/constants/crypto';
import { PaymentWithVendorName } from '@/types/payments';
import { Invoice } from '@/types/supabase';
import SidePanel from '../dashboard/SidePanel';
import InvoicePanel from './InvoicePanel';
import { FormSection } from '../forms';

interface PaymentDetailsProps {
  payment: PaymentWithVendorName | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentDetails({ payment, isOpen, onClose }: PaymentDetailsProps) {
  const [invoice, setInvoice] = useState<Invoice & { fileUrl?: string } | null>(null);
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
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInvoice(data.invoice);
          }
        }
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

  // Convert invoice to InvoiceWithFileUrl format for InvoicePanel
  const invoiceForPanel = invoice ? {
    ...invoice,
    fileUrl: invoice.fileUrl || ''
  } : null;

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
        ) : invoiceForPanel ? (
          <InvoicePanel 
            invoice={invoiceForPanel}
            // No onUploadInvoice or onDelete props = read-only mode
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No invoice available</p>
          </div>
        )
      ) : undefined}
      rightContent={
        <div className="p-8 space-y-6">
          {/* Overview Section */}
          <FormSection title="Overview" collapsible defaultExpanded={false}>
            <div className="cursor-not-allowed">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <input
                type="text"
                value={`${payment.vendor_name}`}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>
            
            <div className="cursor-not-allowed">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice #</label>
              <input
                type="text"
                value={payment.invoice_data?.invoice_number || 'INV-2025-10292'}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>
          </FormSection>

          {/* Payment Details Section */}
          <FormSection title="Payment Details" collapsible defaultExpanded={true}>
            <div className="grid grid-cols-2 gap-4">
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="text"
                  value={payment.fiat_amount.toString()}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <input
                  type="text"
                  value={payment.fiat_currency}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
            
            <div className="cursor-not-allowed">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={payment.receiver_wallet_address || '0xC54BA68e29bb591f072DD84dca9327206FfAFb5a'}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-mono text-sm"
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <input
                  type="text"
                  value={`${payment.crypto_amount} ${payment.crypto_asset}`}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
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
            </div>
            
            <div className="cursor-not-allowed">
              <label className="block text-sm font-medium text-gray-700 mb-2">Paid date</label>
              <input
                type="text"
                value={formatDate(payment.confirmed_at || payment.created_at)}
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
        </div>
      }
    />
  );
}
