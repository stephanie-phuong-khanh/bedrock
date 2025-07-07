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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      alert('Please fill out all required fields');
      return;
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
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-100">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Drag and drop your file here, or<br />browse files
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF files only</p>
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
