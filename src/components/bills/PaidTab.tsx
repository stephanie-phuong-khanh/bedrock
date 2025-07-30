'use client';

import { useState } from 'react';
import { InvoiceWithFileUrl } from '@/types/supabase';
import BillsTable from '@/components/bills/BillsTable';
import PaymentFlow from '@/components/bills/PaymentFlow';
import BillPaymentInitiator from '@/components/bills/BillPaymentInitiator';
import { uploadInvoice } from '@/lib/invoice-utils';

interface PaidTabProps {
  refreshPaidBillsTableTrigger?: number;
}

export default function PaidTab({ refreshPaidBillsTableTrigger }: PaidTabProps) {
  // Payment flow state for empty state CTA
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceWithFileUrl | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file upload from empty state CTA
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const invoice = await uploadInvoice(file);
      setCurrentInvoice(invoice);
      setShowPaymentFlow(true);
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert('Failed to upload invoice. Please try again.');
    } finally {
      setIsUploading(false);
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
      isLoading={isUploading}
    />
  );

  return (
    <>
      <BillsTable
        emptyStateComponent={emptyStateComponent}
        refreshTrigger={refreshPaidBillsTableTrigger}
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
