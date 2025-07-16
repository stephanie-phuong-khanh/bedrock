'use client';

import { useState, useEffect } from 'react';
import { Invoice, Vendor } from '@/types/supabase';
import InvoicePanel from './InvoicePanel';
import PaymentForm, { PaymentFormData } from './PaymentForm';
import ConfirmPayment from './ConfirmPayment';

interface PaymentFlowProps {
  invoice?: Invoice | null;
  onClose: () => void;
  onUploadInvoice?: (file: File) => Promise<void>;
  onDelete?: (invoiceId: string) => Promise<void>;
}

export default function PaymentFlow({ invoice, onClose, onUploadInvoice, onDelete }: PaymentFlowProps) {
  // Vendor management states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Payment flow state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  
  // Set selected vendor if invoice has a vendor_id
  useEffect(() => {
    if (invoice && invoice.vendor_id && vendors.length > 0) {
      const vendor = vendors.find(v => v.id === invoice.vendor_id);
      if (vendor) {
        setSelectedVendor(vendor);
      }
    }
  }, [invoice, vendors]);
  
  // Fetch vendors on component mount
  useEffect(() => {
    async function fetchVendors() {
      try {
        setIsLoadingVendors(true);
        
        // Use the API endpoint instead of direct Supabase access
        const response = await fetch('/api/vendors', {
          credentials: 'include', // Include cookies with the request
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load vendors');
        }
        
        const data = await response.json();
        setVendors(data.vendors || []);
      } catch (err: unknown) {
        console.error('Error fetching vendors:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load vendors');
      } finally {
        setIsLoadingVendors(false);
      }
    }
    
    fetchVendors();
  }, []);
  
  const handleFormSubmit = (formData: PaymentFormData) => {
    setPaymentData(formData);
    setShowConfirmation(true);
  };
  
  const handleBack = () => {
    setShowConfirmation(false);
  };
  
  const handleConfirmPayment = () => {
    alert('(dummy) Payment confirmed!');
  };

  const handleVendorChange = (vendor: Vendor | null) => {
    setSelectedVendor(vendor);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Left side - Invoice Panel */}
      {/* Show InvoicePanel in PaymentForm step, or in ConfirmPayment step only if invoice exists */}
      {(!showConfirmation || invoice) && (
        <InvoicePanel 
          invoice={invoice}
          onUploadInvoice={showConfirmation ? undefined : onUploadInvoice}
          onDelete={showConfirmation ? undefined : onDelete}
        />
      )}

      {/* Right side - Payment details */}
      <div className={`${(!showConfirmation || invoice) ? 'w-1/2' : 'w-full'} p-8 overflow-auto relative`}>
        {/* Close button positioned at the top right of the payment panel */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-4xl font-bold mb-6">Pay Bill</h2>
        
        {showConfirmation && paymentData ? (
          <ConfirmPayment
            selectedVendor={paymentData.selectedVendor}
            amount={paymentData.amount}
            currency={paymentData.currency}
            walletAddress={paymentData.walletAddress}
            network={paymentData.network}
            category={paymentData.category}
            memo={paymentData.memo}
            onBack={handleBack}
            onConfirm={handleConfirmPayment}
          />
        ) : (
          <PaymentForm
            vendors={vendors}
            isLoadingVendors={isLoadingVendors}
            errorMessage={errorMessage}
            onSubmit={handleFormSubmit}
            selectedVendor={selectedVendor}
            onVendorChange={handleVendorChange}
            initialFormData={paymentData}
          />
        )}
      </div>
    </div>
  );
}
