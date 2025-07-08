'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Vendor } from '../types/supabase';

export default function PaymentTab() {
  const { data: session } = useSession() as { data: Session | null };
  const supabase = createClientComponentClient();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form fields
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [network, setNetwork] = useState<string>('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceFilePath, setInvoiceFilePath] = useState<string | null>(null);
  const [invoiceFileUrl, setInvoiceFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Check if all required fields are filled
  const isFormComplete = selectedVendor && 
    amount.trim() !== '' && 
    currency !== '' && 
    walletAddress.trim() !== '' && 
    network !== '';

  // Fetch vendors on component mount
  useEffect(() => {
    async function fetchVendors() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    }
    
    fetchVendors();
  }, [session, supabase]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed');
        setInvoiceFile(null);
        return;
      }
      
      setInvoiceFile(file);
      setUploadError(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed');
        setInvoiceFile(null);
        return;
      }
      
      setInvoiceFile(file);
      setUploadError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const deleteInvoice = async () => {
    if (!invoiceFilePath || !session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/upload/invoice?filePath=${encodeURIComponent(invoiceFilePath)}&userId=${encodeURIComponent(session.user.id)}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete invoice');
      }
      
      // Reset invoice state after successful deletion
      setInvoiceFile(null);
      setInvoiceFilePath(null);
      setInvoiceFileUrl(null);
      
      console.log('Invoice deleted successfully');
      
    } catch (err: unknown) {
      console.error('Error deleting invoice:', err);
      // Still reset the state on the client side even if the server deletion fails
      setInvoiceFile(null);
      setInvoiceFilePath(null);
      setInvoiceFileUrl(null);
    }
  };

  const uploadInvoice = async () => {
    if (!invoiceFile || !session?.user?.id) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('file', invoiceFile);
      formData.append('userId', session.user.id);
      
      const response = await fetch('/api/upload/invoice', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload invoice');
      }
      
      setInvoiceFilePath(result.filePath);
      setInvoiceFileUrl(result.fileUrl);
      
      // Log the file URL to console
      console.log('Invoice uploaded successfully. File URL:', result.fileUrl);
      
    } catch (err: unknown) {
      console.error('Error uploading invoice:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload invoice');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Upload invoice if one is selected but not yet uploaded
    if (invoiceFile && !invoiceFilePath) {
      await uploadInvoice();
    }
    
    // Here you would handle the payment submission
    alert('Payment process would be completed here');
  };

  return (
    <div className="w-full">
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Vendor Selection Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Select vendor</h2>
          <p className="text-gray-500 text-sm mb-4">Choose an existing vendor or create a new one</p>
          
          <select
            id="vendor-select"
            className="w-full py-2 px-3 border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
            value={selectedVendor?.id || ''}
            onChange={handleVendorSelect}
            disabled={isLoading}
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
            onClick={() => {}}  // Dummy button as requested
          >
            <span className="mr-2">+</span> Create new vendor
          </button>
        </div>
        
        {/* Payment Details Section */}
        <div className={`${!selectedVendor ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-xl font-semibold mb-2">Payment details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload invoice (optional)
                </label>
                <div 
                  className={`border-2 border-dashed ${uploadError ? 'border-red-300' : 'border-gray-300'} rounded-md p-6 flex flex-col items-center justify-center bg-gray-100 relative ${invoiceFileUrl ? 'h-96' : ''}`}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : invoiceFileUrl ? (
                    <div className="w-full h-full flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-700 font-medium">Invoice Preview</p>
                        <button 
                          type="button" 
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={deleteInvoice}
                        >
                          Remove
                        </button>
                      </div>
                      <iframe 
                        src={invoiceFileUrl} 
                        className="w-full h-full border-0 rounded"
                        title="Invoice PDF Preview"
                      />
                    </div>
                  ) : invoiceFile ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-700">{invoiceFile.name}</p>
                      <div className="flex mt-2 space-x-2">
                        <button 
                          type="button" 
                          className="text-xs text-blue-500 hover:text-blue-700"
                          onClick={uploadInvoice}
                        >
                          Upload
                        </button>
                        <button 
                          type="button" 
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => setInvoiceFile(null)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        Drag and drop your file here, or<br />
                        <label className="cursor-pointer text-blue-500 hover:text-blue-700">
                          browse files
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF files only</p>
                    </>
                  )}
                  
                  {uploadError && (
                    <p className="mt-2 text-xs text-red-500">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
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
  );
}
