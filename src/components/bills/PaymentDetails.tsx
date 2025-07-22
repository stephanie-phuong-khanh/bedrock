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
      width={payment.invoice_id ? 'full' : 'wide'}
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
        <div className="px-4 pt-2 pb-4 space-y-6">
          <FormSection title="Payment Summary">
            {/* Amount Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-gray-900">{payment.fiat_amount} {payment.fiat_currency}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              {/* Asset */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Asset</span>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">$</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{payment.crypto_amount} {payment.crypto_asset}</p>
                    <p className="text-xs text-gray-500">USD Coin</p>
                  </div>
                </div>
              </div>

              {/* Network */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Network</span>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">E</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {getPaymentNetworkNameFromId(payment.payment_network)}
                  </span>
                </div>
              </div>

              {/* Vendor */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Paid to</span>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {payment.vendor_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{payment.vendor_name}</p>
                    {payment.vendor_email && (
                      <p className="text-xs text-gray-500">{payment.vendor_email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Date Paid</span>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(payment.confirmed_at || payment.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Invoice details */}
          {payment.invoice_data && (
            <FormSection title="Invoice Details">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Invoice #</span>
                  <span className="text-sm font-medium text-gray-900">
                    {payment.invoice_data.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {payment.invoice_data.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(payment.invoice_data.created_at)}
                  </span>
                </div>
              </div>
            </FormSection>
          )}

          {/* Transaction link */}
          {payment.tx_hash && (
            <div className="pt-2">
              <a
                href={getBlockExplorerUrl(payment.payment_network, payment.tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors duration-200"
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
