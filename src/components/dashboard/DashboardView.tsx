'use client';

import { Session } from 'next-auth';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { uploadInvoice } from '@/lib/invoice-utils';
import { InvoiceWithFileUrl } from '@/types/supabase';
import VendorsTab from '../vendors/VendorsTab';
import PaymentFlow from '../payments/PaymentFlow';
import BillsView from '../bills/BillsView';

import InvoiceUpload from '../invoices/InvoiceUpload';
import Sidebar from './Sidebar';

interface DashboardViewProps {
  session: Session | null;
}

export default function DashboardView({ session }: DashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial state from URL parameters
  const [activeSidebarItem, setActiveSidebarItem] = useState(() => {
    return searchParams.get('section') || 'bills';
  });
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceWithFileUrl | null>(null);
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);

  
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
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
    
    // Navigate to Bills section and Paid tab to show the new payment
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', 'bills');
    params.set('tab', 'paid');
    router.push(`?${params.toString()}`, { scroll: false });
    
    // Update local state to match URL
    setActiveSidebarItem('bills');
  };

  // Handle sidebar navigation with URL updates
  const handleSidebarNavigation = (section: string) => {
    setActiveSidebarItem(section);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', section);
    
    // Clear bills-specific parameters when switching to vendors
    if (section === 'vendors') {
      params.delete('tab');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync state with URL changes
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && section !== activeSidebarItem) {
      setActiveSidebarItem(section);
    }
  }, [searchParams, activeSidebarItem]);

  // Get page title based on active sidebar item
  const getPageTitle = () => {
    switch (activeSidebarItem) {
      case 'bills':
        return 'Bills';
      case 'vendors':
        return 'Vendors';
      default:
        return 'Bills';
    }
  };

  // Render main content based on active sidebar item
  const renderMainContent = () => {
    switch (activeSidebarItem) {
      case 'bills':
        return (
          <div className="min-h-[400px]">
            <BillsView />
          </div>
        );
      case 'vendors':
        return (
          <div className="min-h-[400px]">
            <VendorsTab />
          </div>
        );
      default:
        return (
          <div className="min-h-[400px]">
            <BillsView />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <div className="min-h-screen bg-white flex">
        {/* Sidebar */}
        <Sidebar 
          session={session}
          activeItem={activeSidebarItem}
          onItemChange={handleSidebarNavigation}
        />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center relative">
              <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
              <div className="flex items-center space-x-4">
                {/* Pay Bill Button - only show when in Bills section */}
                {activeSidebarItem === 'bills' && (
                  <div className="relative">
                    <button 
                      ref={buttonRef}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      onClick={() => setShowPayBillModal(!showPayBillModal)}
                    >
                      Pay Bill
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
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>
      
      {/* Payment Flow Modal */}
      {showInvoiceUpload && (
        <PaymentFlow
          invoice={currentInvoice}
          onClose={handleCloseInvoiceUpload}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
