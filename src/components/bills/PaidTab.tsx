'use client';

import { useState } from 'react';
import { InvoiceWithFileUrl } from '@/types/supabase';
import BillsTable from './BillsTable';
import PaymentFlow from './PaymentFlow';
import BillPaymentInitiator from './BillPaymentInitiator';

export default function PaidTab() {
  // Payment flow state for empty state CTA
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceWithFileUrl | null>(null);

  // Handle file upload from empty state CTA
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/invoices', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload invoice');
      }

      const data = await response.json();
      if (data.success) {
        setCurrentInvoice(data.invoice);
        setShowPaymentFlow(true);
      }
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert('Failed to upload invoice. Please try again.');
    }
  };

  // Handle pay without invoice
  const handlePayWithoutInvoice = () => {
    setCurrentInvoice(null);
    setShowPaymentFlow(true);
  };

  // Handle payment flow close
  const handlePaymentFlowClose = () => {
    setShowPaymentFlow(false);
    setCurrentInvoice(null);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setShowPaymentFlow(false);
    setCurrentInvoice(null);
    // BillsTable will automatically refresh via its own useEffect
  };

  // Empty state component for when no payments exist
  const emptyStateComponent = (
    <BillPaymentInitiator
      onFileSelect={handleFileUpload}
      onPayWithoutInvoice={handlePayWithoutInvoice}
    />
  );

  return (
    <>
      <BillsTable
        emptyStateComponent={emptyStateComponent}
      />

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <PaymentFlow
          invoice={currentInvoice}
          onClose={handlePaymentFlowClose}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
