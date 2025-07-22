'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { uploadInvoice } from '@/lib/invoice-utils';
import { InvoiceWithFileUrl } from '@/types/supabase';
import DraftsTab from './DraftsTab';
import PaidTab from './PaidTab';
import BillPaymentInitiator from './BillPaymentInitiator';
import PaymentFlow from './PaymentFlow';
import Button from '../dashboard/Button';

export default function BillsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab state from URL parameters
  const [activeBillsTab, setActiveBillsTab] = useState(() => {
    return searchParams.get('tab') || 'paid';
  });

  // Pay bill modal state
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceWithFileUrl | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const tabs = [
    { id: 'paid', label: 'Paid' },
    { id: 'drafts', label: 'Drafts', disabled: true }
  ];

  // Handle tab navigation with URL updates
  const handleTabNavigation = (tabId: string) => {
    setActiveBillsTab(tabId);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowPayBillModal(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle file upload from InvoiceUpload component
  const handleFileUpload = async (file: File) => {
    try {
      const invoice = await uploadInvoice(file);
      setCurrentInvoice(invoice);
      setShowPayBillModal(false);
      setShowPaymentFlow(true);
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert('Failed to upload invoice. Please try again.');
    }
  };

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      // Call API to delete invoice
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      // Clear current invoice and close payment flow
      setCurrentInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  // Handle pay without invoice
  const handlePayWithoutInvoice = () => {
    setCurrentInvoice(null);
    setShowPaymentFlow(true);
    setShowPayBillModal(false);
  };

  const handleClosePaymentFlow = () => {
    setShowPaymentFlow(false);
    setCurrentInvoice(null);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentFlow(false);
    setCurrentInvoice(null);
    
    // Navigate to Paid tab to show the new payment
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'paid');
    router.push(`?${params.toString()}`, { scroll: false });
    
    // Update local state to match URL
    setActiveBillsTab('paid');
  };

  // Sync state with URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeBillsTab) {
      setActiveBillsTab(tab);
    }
  }, [searchParams, activeBillsTab]);

  const renderTabContent = () => {
    switch (activeBillsTab) {
      case 'drafts':
        return <DraftsTab />;
      case 'paid':
        return <PaidTab />;
      default:
        return <DraftsTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Pay bill button */}
      <div className="flex justify-between items-center">
        <h1 className="text-page-title">Bills</h1>
        <div className="relative">
          <Button 
            ref={buttonRef}
            size="md"
            onClick={() => setShowPayBillModal(!showPayBillModal)}
          >
            Pay bill
          </Button>
          
          {/* Pay Bill Modal */}
          {showPayBillModal && (
            <div 
              ref={modalRef}
              className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-[450px]"
            >
              <div className="p-6">
                <BillPaymentInitiator
                  onFileSelect={handleFileUpload}
                  onPayWithoutInvoice={handlePayWithoutInvoice}
                  title="Select an invoice to upload"
                  className=""
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabNavigation(tab.id)}
              className={`py-2 px-20 border-b-2 font-medium text-sm transition-colors ${
                tab.disabled
                  ? 'border-transparent text-gray-400 cursor-not-allowed'
                  : activeBillsTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={tab.disabled}
              title={tab.disabled ? 'Coming soon' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <PaymentFlow
          invoice={currentInvoice}
          onClose={handleClosePaymentFlow}
          onUploadInvoice={handleFileUpload}
          onDelete={handleDeleteInvoice}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
