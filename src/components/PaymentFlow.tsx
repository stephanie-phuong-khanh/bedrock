'use client';

import { Invoice, Vendor } from '@/types/supabase';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PaymentFlowProps {
  invoice?: Invoice | null;
  onClose: () => void;
  onUploadInvoice?: (file: File) => Promise<void>;
  onDelete?: (invoiceId: string) => Promise<void>;
}

// Extend the Session type to include the id property on the user object
interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export default function PaymentFlow({ invoice, onClose, onUploadInvoice, onDelete }: PaymentFlowProps) {
  const { data: session } = useSession() as { data: CustomSession | null };
  const supabase = createClientComponentClient();
  
  // Invoice viewer states
  const [isPdf, setIsPdf] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Payment form states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form fields
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [network, setNetwork] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  
  // Check if all required fields are filled
  const isFormComplete = selectedVendor && 
    amount.trim() !== '' && 
    currency !== '' && 
    walletAddress.trim() !== '' && 
    network !== '';
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Determine if the file is a PDF based on file name or content type
  useEffect(() => {
    if (invoice) {
      // Check if the file name ends with .pdf or if the URL contains PDF indicators
      const isPdfFile = 
        invoice.file_name.toLowerCase().endsWith('.pdf') || 
        invoice.file_url.toLowerCase().includes('.pdf') ||
        invoice.file_url.toLowerCase().includes('application/pdf');
      
      setIsPdf(isPdfFile);
      
      // If the invoice has a vendor_id, select that vendor
      if (invoice.vendor_id) {
        const vendor = vendors.find(v => v.id === invoice.vendor_id);
        if (vendor) {
          setSelectedVendor(vendor);
          if (vendor.wallet_address) setWalletAddress(vendor.wallet_address);
          if (vendor.wallet_chain) setNetwork(vendor.wallet_chain);
        }
      }
    }
  }, [invoice, vendors]);
  
  // Fetch vendors on component mount
  useEffect(() => {
    async function fetchVendors() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoadingVendors(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (error) {
          throw error;
        }
        
        setVendors(data || []);
      } catch (err: unknown) {
        console.error('Error fetching vendors:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load vendors');
      } finally {
        setIsLoadingVendors(false);
      }
    }
    
    fetchVendors();
  }, [session, supabase]);
  
  // Set up drag and drop event handlers
  useEffect(() => {
    if (!dropZoneRef.current) return;
    
    const dropZone = dropZoneRef.current;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        await handleFileUpload(e.dataTransfer.files[0]);
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
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      if (onUploadInvoice) {
        await onUploadInvoice(file);
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
  
  const handleVendorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value;
    if (!vendorId) {
      setSelectedVendor(null);
      setWalletAddress('');
      setNetwork('');
      return;
    }
    
    const vendor = vendors.find(v => v.id === vendorId);
    setSelectedVendor(vendor || null);
    
    // Pre-fill wallet address and network if vendor has them
    if (vendor?.wallet_address) {
      setWalletAddress(vendor.wallet_address);
    } else {
      setWalletAddress('');
    }
    
    if (vendor?.wallet_chain) {
      setNetwork(vendor.wallet_chain);
    } else {
      setNetwork('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Here you would handle the payment submission
    alert('Payment process would be completed here');
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Left side - Invoice display or upload interface */}
      <div className="w-1/2 border-r border-gray-200 p-8 overflow-auto">
        {invoice ? (
          /* PDF Viewer when invoice exists */
          <div className="flex flex-col">
            <div className="w-full h-[calc(100vh-180px)] bg-gray-100 rounded-md flex items-center justify-center">
              {isPdf ? (
                <object 
                  data={invoice.file_url}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="mb-4 text-gray-600">Unable to display PDF directly.</p>
                    <a 
                      href={invoice.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Open PDF in new tab
                    </a>
                  </div>
                </object>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">This file type is not supported for preview.</p>
                  <a 
                    href={invoice.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
            
            {/* Delete button */}
            {onDelete && invoice && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => onDelete(invoice.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Invoice
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Invoice upload interface when no invoice exists */
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold mb-8">Select an invoice to upload</h2>
            
            <div 
              ref={dropZoneRef}
              className={`border-2 border-dashed rounded-md p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 max-w-md mx-auto w-full ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={handleBrowseFiles}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-2"></div>
                  <p>Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="mb-2">Drag and drop your invoice here, or</p>
                  <p className="mb-4 text-blue-600 font-medium">browse files</p>
                  <p className="text-sm text-gray-500">PDF files only</p>
                  
                  {uploadError && (
                    <p className="mt-4 text-red-500 text-sm">{uploadError}</p>
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
          </div>
        )}
      </div>
      
      {/* Right side - Payment details */}
      <div className="w-1/2 p-8 overflow-auto relative">
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
        
        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Vendor Selection Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Select vendor</h3>
            <p className="text-gray-500 text-sm mb-4">Choose an existing vendor or create a new one</p>
            
            <select
              id="vendor-select"
              className="w-full py-2 px-3 border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
              value={selectedVendor?.id || ''}
              onChange={handleVendorSelect}
              disabled={isLoadingVendors}
              required
            >
              <option value="">Select a vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} {vendor.email ? `(${vendor.email})` : ''}
                </option>
              ))}
            </select>
            
            <button
              type="button"
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded flex items-center justify-center"
            >
              <span className="mr-2">+</span> Create new vendor
            </button>
          </div>
          
          {/* Payment Details Section */}
          <div className={`${!selectedVendor ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="text-lg font-semibold mb-2">Payment details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="amount"
                    className="w-full py-2 px-3 border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="currency"
                    className="w-full py-2 px-3 border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="wallet-address"
                  className="w-full py-2 px-3 border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment network <span className="text-red-500">*</span>
                </label>
                <select
                  id="network"
                  className="w-full py-2 px-3 border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Solana">Solana</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    className="w-full py-2 px-3 border-b border-gray-300 focus:outline-none focus:border-black bg-transparent appearance-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
                  Memo (Optional)
                </label>
                <textarea
                  id="memo"
                  className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-transparent"
                  rows={3}
                  placeholder="Additional notes about this payment..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                className={`w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded ${!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isFormComplete}
              >
                Review Payment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
