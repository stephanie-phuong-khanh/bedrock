'use client';

import { InvoiceWithSignedUrl } from '@/types/db-types';
import BillsTable from '@/components/bills/BillsTable';
import PaymentFlow from '@/components/bills/PaymentFlow';
import BillPaymentInitiator from '@/components/bills/BillPaymentInitiator';
import { uploadInvoice } from '@/lib/invoice-utils';

interface PaidTabProps {
  refreshPaidBillsTableTrigger?: number;
  showPaymentFlow: boolean;
  setShowPaymentFlow: (show: boolean) => void;
  currentInvoice: InvoiceWithSignedUrl | null;
  setCurrentInvoice: (invoice: InvoiceWithSignedUrl | null) => void;
  initiallyUploadingInvoice: boolean;
  setInitiallyUploadingInvoice: (show: boolean) => void;
  onClosePaymentFlow: () => void;
  onDelete?: (invoiceId: string) => Promise<void>;
}

export default function PaidTab({
  refreshPaidBillsTableTrigger,
  showPaymentFlow,
  setShowPaymentFlow,
  currentInvoice,
  setCurrentInvoice,
  initiallyUploadingInvoice,
  setInitiallyUploadingInvoice,
  onClosePaymentFlow,
  onDelete,
}: PaidTabProps) {
  // Handle file upload from BillPaymentInitiator is different from handleFileUpload in BillsView
  const handleFileUpload = async (file: File) => {
    try {
      setShowPaymentFlow(true);
      setInitiallyUploadingInvoice(true);

      const invoice = await uploadInvoice(file);
      setCurrentInvoice(invoice);
      setInitiallyUploadingInvoice(false);
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert('Failed to upload invoice. Please try again.');
    }
  };

  // Handle pay without invoice from empty state CTA is different from handlePayWithoutInvoice in BillsView
  const handlePayWithoutInvoice = () => {
    setCurrentInvoice(null);
    setShowPaymentFlow(true);
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
        refreshTrigger={refreshPaidBillsTableTrigger}
      />

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <PaymentFlow
          invoice={currentInvoice}
          onClose={onClosePaymentFlow}
          onUploadInvoice={handleFileUpload}
          onDelete={onDelete}
          onPaymentSuccess={handlePaymentSuccess}
          initiallyUploadingInvoice={initiallyUploadingInvoice}
        />
      )}
    </>
  );
}
