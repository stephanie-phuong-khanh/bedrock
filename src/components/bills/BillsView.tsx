'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { uploadInvoice } from '@/lib/invoice-utils';
import { InvoiceWithFileUrl } from '@/types/supabase';
import DraftsTab from './DraftsTab';
import PaidTab from './PaidTab';
import InvoiceUpload from '../invoices/InvoiceUpload';

export default function BillsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab state from URL parameters
  const [activeBillsTab, setActiveBillsTab] = useState(() => {
    return searchParams.get('tab') || 'drafts';
  });

  // Pay bill modal state
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceWithFileUrl | null>(null);
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const tabs = [
    { id: 'drafts', label: 'Drafts' },
    { id: 'paid', label: 'Paid' }
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
      setShowInvoiceUpload(true);
      setShowPayBillModal(false);
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert('Failed to upload invoice. Please try again.');
    }
  };

  // Handle pay without invoice
  const handlePayWithoutInvoice = () => {
    setCurrentInvoice(null);
    setShowInvoiceUpload(true);
    setShowPayBillModal(false);
  };

  const handleCloseInvoiceUpload = () => {
    setShowInvoiceUpload(false);
    setCurrentInvoice(null);
  };

  const handlePaymentSuccess = () => {
    setShowInvoiceUpload(false);
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
        <h1 className="text-3xl font-bold">Bills</h1>
        <div className="relative">
          <button 
            ref={buttonRef}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            onClick={() => setShowPayBillModal(!showPayBillModal)}
          >
            Pay bill
          </button>
          
          {/* Pay Bill Modal */}
          {showPayBillModal && (
            <div 
              ref={modalRef}
              className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-[450px]"
            >
              <div className="p-6">
                <InvoiceUpload
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
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabNavigation(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeBillsTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
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
      {showInvoiceUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Payment Flow</h2>
              <button 
                onClick={handleCloseInvoiceUpload}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            {/* Payment flow content would go here */}
            <p>Payment flow modal content</p>
          </div>
        </div>
      )}
    </div>
  );
}
