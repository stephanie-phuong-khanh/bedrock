'use client';

import { signOut } from "next-auth/react";
import { Session } from 'next-auth';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { uploadInvoice } from '@/lib/invoice-utils';
import { Invoice } from '@/types/supabase';
import VendorsTab from './VendorsTab';
import PaymentsTab from './PaymentsTab';
import PaymentFlow from './PaymentFlow';
import ConnectWalletButton from './ConnectWalletButton';

interface DashboardViewProps {
  session: Session | null;
}

export default function DashboardView({ session }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('payments');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
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
  
  // Set up drag and drop event listeners
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;
    
    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleDragOver = (e: DragEvent) => {
      preventDefault(e);
      dropZone.classList.add('bg-gray-100');
    };
    
    const handleDragLeave = (e: DragEvent) => {
      preventDefault(e);
      dropZone.classList.remove('bg-gray-100');
    };
    
    const handleDrop = (e: DragEvent) => {
      preventDefault(e);
      dropZone.classList.remove('bg-gray-100');
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    };
    
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.includes('pdf')) {
      setUploadError('Only PDF files are allowed');
      return;
    }
    
    if (!session?.userId) {
      setUploadError('You must be logged in to upload invoices');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const invoice = await uploadInvoice(file);

      if (invoice) {
        setShowPayBillModal(false);
        setCurrentInvoice(invoice);
      } else {
        setUploadError('Failed to upload invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading invoice:', error);
      setUploadError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };
  
  const closePaymentFlow = () => {
    setCurrentInvoice(null);
    setShowInvoiceUpload(false);
  };
  
  const handlePayWithoutInvoice = () => {
    setShowPayBillModal(false);
    setShowInvoiceUpload(true);
  };
  
  const handleInvoiceDelete = async (invoiceId: string) => {
    if (!session?.userId || !currentInvoice) return;
    
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies with the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting invoice:', errorData);
        return;
      }

      setCurrentInvoice(null);
      setShowInvoiceUpload(true);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
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
                  onClick={() => signOut()}
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
                      <p className="mb-4 font-medium">Select an invoice to upload</p>
                      
                      <div 
                        ref={dropZoneRef}
                        className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200"
                        onClick={handleBrowseFiles}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-2"></div>
                            <p>Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </div>
                            <p className="mb-1">Drag and drop your invoice here, or</p>
                            <p className="mb-2 text-blue-600 font-medium">browse files</p>
                            <p className="text-sm text-gray-500">PDF files only</p>
                            
                            {uploadError && (
                              <p className="mt-2 text-red-500 text-sm">{uploadError}</p>
                            )}
                            
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              className="hidden" 
                              accept=".pdf"
                              onChange={handleFileInputChange}
                            />
                          </>
                        )}
                      </div>
                      
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <button 
                          className="w-full flex items-center justify-between py-3"
                          onClick={handlePayWithoutInvoice}
                        >
                          <span>Pay bill without an invoice</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                <PaymentsTab />
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
      
      {/* Full-screen Payment Flow */}
      {(currentInvoice || showInvoiceUpload) && (
        <PaymentFlow 
          invoice={currentInvoice} 
          onClose={closePaymentFlow}
          onDelete={handleInvoiceDelete}
          onUploadInvoice={async (file: File) => {
            const invoice = await uploadInvoice(file);
            if (invoice) {
              setCurrentInvoice(invoice);
              setShowInvoiceUpload(false);
            } else {
              throw new Error('Failed to upload invoice');
            }
          }}
        />
      )}
    </div>
  );
}
