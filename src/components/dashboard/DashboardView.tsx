'use client';

import { signOut } from "next-auth/react";
import { Session } from 'next-auth';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { uploadInvoice } from '@/lib/invoice-utils';
import { InvoiceWithFileUrl } from '@/types/supabase';
import VendorsTab from '../vendors/VendorsTab';
import PaymentsTab from '../payments/PaymentsTab';
import PaymentFlow from '../payments/PaymentFlow';
import ConnectWalletButton from './ConnectWalletButton';
import InvoiceUpload from '../invoices/InvoiceUpload';

interface DashboardViewProps {
  session: Session | null;
}

export default function DashboardView({ session }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('payments');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceWithFileUrl | null>(null);
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  const [paymentsKey, setPaymentsKey] = useState(0); // Used to force PaymentsTab refresh
  
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
    setPaymentsKey(prev => prev + 1); // Force PaymentsTab refresh
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="relative">
      <div className="min-h-screen bg-white flex">
        {/* Left Panel */}
        <div className="w-20 border-r border-gray-200 min-h-screen flex flex-col items-center">
          {/* Left panel content will go here */}
          
          {/* User Avatar - moved to bottom of left panel */}
          <div className="mt-auto mb-6 relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {session?.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt="User avatar" 
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </button>
            
            {/* User menu popup */}
            {showUserMenu && (
              <div className="absolute bottom-12 left-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="px-8 py-6">
            <div className="flex justify-between items-center relative">
              <h1 className="text-3xl font-bold">Bill Pay</h1>
              <div className="flex items-center space-x-4">
                <ConnectWalletButton />
                
                {/* Pay Bill Button with Modal */}
                <div className="relative">
                  <button 
                    ref={buttonRef}
                    className="bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-16 rounded"
                    onClick={() => setShowPayBillModal(!showPayBillModal)}
                  >
                    Pay Bill
                  </button>
                  
                  {/* Pay Bill Modal */}
                  {showPayBillModal && (
                    <div 
                      ref={modalRef}
                      className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow-lg z-20 w-[450px]"
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
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-8 mr-8 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={`py-4 px-8 font-medium text-sm ${
                  activeTab === 'vendors'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Vendors
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'payments' && (
              <div className="min-h-[400px]">
                <PaymentsTab key={paymentsKey} />
              </div>
            )}
            
            {activeTab === 'vendors' && (
              <div className="min-h-[400px]">
                <VendorsTab />
              </div>
            )}
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
