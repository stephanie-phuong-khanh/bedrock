'use client';

import { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { Vendor } from '@/types/supabase';
import { getEnabledCryptocurrencies, getEnabledFiatCurrencies, getEnabledNetworks } from '../../constants/crypto';
import { FormSection, FormInput, FormSelect, FormButtons, CurrencySelect, NetworkSelect } from '../forms';

interface PaymentFormProps {
  vendors: Vendor[];
  isLoadingVendors: boolean;
  errorMessage: string | null;
  onSubmit: (formData: PaymentFormData) => void;
  selectedVendor?: Vendor | null;
  onVendorChange?: (vendor: Vendor | null) => void;
  initialFormData?: PaymentFormData | null;
}

export interface PaymentFormData {
  selectedVendor: Vendor | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAsset: string;
  cryptoAmount: string;
  fxRate: number;
  walletAddress: string;
  network: string;
  category: string;
  memo: string;
}

export default function PaymentForm({ 
  vendors, 
  isLoadingVendors, 
  errorMessage, 
  onSubmit, 
  selectedVendor: initialSelectedVendor,
  onVendorChange,
  initialFormData
}: PaymentFormProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(initialSelectedVendor || null);
  const [fiatAmount, setFiatAmount] = useState<string>(initialFormData?.fiatAmount || '0');
  const [fiatCurrency, setFiatCurrency] = useState<string>(initialFormData?.fiatCurrency || '');
  const [cryptoAsset, setCryptoAsset] = useState<string>(initialFormData?.cryptoAsset || '');
  const [walletAddress, setWalletAddress] = useState<string>(initialFormData?.walletAddress || '');
  const [network, setNetwork] = useState<string>(initialFormData?.network || '');
  const [category, setCategory] = useState<string>(initialFormData?.category || '');
  const [memo, setMemo] = useState<string>(initialFormData?.memo || '');
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);

  // Initialize wallet address validation if initial data is provided
  useEffect(() => {
    if (initialFormData?.walletAddress) {
      validateWalletAddress(initialFormData.walletAddress);
    }
  }, [initialFormData?.walletAddress]);

  // Update selectedVendor when prop changes
  useEffect(() => {
    if (initialSelectedVendor !== selectedVendor) {
      setSelectedVendor(initialSelectedVendor || null);
    }
  }, [initialSelectedVendor]);

  // Validate wallet address
  const validateWalletAddress = (address: string) => {
    if (!address) {
      setIsAddressValid(null);
      return;
    }
    
    const isValid = isAddress(address);
    setIsAddressValid(isValid);
    return isValid;
  };

  // Handle wallet address change
  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWalletAddress(value);
    validateWalletAddress(value);
  };

  // Check if all required fields are filled
  const isFormComplete = selectedVendor && 
    parseFloat(fiatAmount) > 0 && 
    fiatCurrency !== '' && 
    walletAddress.trim() !== '' && 
    network !== '' && 
    isAddressValid === true;

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value;
    if (!vendorId) {
      setSelectedVendor(null);
      onVendorChange?.(null);
      return;
    }
    
    const vendor = vendors.find(v => v.id === vendorId);
    setSelectedVendor(vendor || null);
    onVendorChange?.(vendor || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicitly check each required field
    if (!selectedVendor) {
      alert('Please select a vendor');
      return;
    }
    
    if (!fiatAmount) {
      alert('Please enter an amount');
      return;
    }
    
    if (!fiatCurrency) {
      alert('Please select a currency');
      return;
    }
    
    if (!walletAddress.trim()) {
      alert('Please enter a wallet address');
      return;
    }
    
    if (!network) {
      alert('Please select a payment network');
      return;
    }
    
    if (!isAddressValid) {
      alert('Please enter a valid EVM wallet address');
      return;
    }
    
    // If all validations pass, call onSubmit with form data
    // TODO: Revisit `cryptoAsset` and `fxRate` once more fiat currencies and crypto assets are supported beyond USD and USDC respectively.
    onSubmit({
      selectedVendor,
      fiatAmount,
      fiatCurrency,
      cryptoAsset,
      cryptoAmount: fiatAmount, // Same as fiat_amount for USD:USDC parity
      fxRate: 1.00, // Hardcoded USD:USDC parity
      walletAddress,
      network,
      category,
      memo
    });
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
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
        
        <FormSection title="Overview">
          <FormSelect
            label="Vendor"
            id="vendor-select"
            value={selectedVendor?.id || ''}
            onChange={handleVendorChange}
            options={vendors.map(vendor => ({
              value: vendor.id,
              label: `${vendor.name}${vendor.email ? ` (${vendor.email})` : ''}`,
              disabled: false
            }))}
            placeholder="Search or add"
            required
            disabled={isLoadingVendors}
          />
        </FormSection>
        
        <FormSection title="Payment">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Amount"
              id="fiat_amount"
              value={fiatAmount}
              onChange={(e) => {
                const rawValue = e.target.value;
                // Allow digits + optional dot + up to 2 decimal digits
                if (/^\d*\.?\d{0,2}$/.test(rawValue)) {
                  setFiatAmount(rawValue);
                }
              }}
              onBlur={() => {
                if (fiatAmount !== '') {
                  const num = parseFloat(fiatAmount);
                  if (!isNaN(num)) {
                    setFiatAmount(num.toFixed(2));  // Ensures 2 decimal places
                  }
                }
              }}
              placeholder="0.00"
              required
            />
            
            <CurrencySelect
              label="Currency"
              id="fiat_currency"
              value={fiatCurrency}
              onChange={(e) => setFiatCurrency(e.target.value)}
              options={Object.values(getEnabledFiatCurrencies()).map(fiat => ({
                symbol: fiat.symbol,
                name: fiat.name,
                flag: fiat.symbol === 'USD' ? '🇺🇸' : undefined,
                isEnabled: fiat.isEnabled
              }))}
              placeholder="Select"
              required
            />
          </div>

          
          <FormInput
            label="Pay to"
            id="wallet-address"
            value={walletAddress}
            onChange={handleWalletAddressChange}
            placeholder="Add wallet address"
            required
            error={isAddressValid === false ? "Please enter a valid EVM wallet address" : undefined}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <CurrencySelect
              label="Asset"
              id="crypto_asset"
              value={cryptoAsset}
              onChange={(e) => setCryptoAsset(e.target.value)}
              options={Object.values(getEnabledCryptocurrencies()).map(crypto => ({
                symbol: crypto.symbol,
                name: crypto.name,
                flag: crypto.symbol === 'USDC' ? '💰' : undefined,
                isEnabled: crypto.isEnabled
              }))}
              placeholder="Select"
              required
            />
            
            <NetworkSelect
              label="Network"
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              options={getEnabledNetworks().map(network => ({
                id: network.id,
                name: network.name,
                chainId: network.chainId,
                isEnabled: network.isEnabled
              }))}
              placeholder="Select"
              required
            />
          </div>
        </FormSection>
        
        <FormSection title="Details">
          <FormSelect
            label="Category"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "Professional Services", label: "Professional Services" },
              { value: "Software & SaaS", label: "Software & SaaS" },
              { value: "Marketing & Advertising", label: "Marketing & Advertising" },
              { value: "Utilities", label: "Utilities" },
              { value: "Office Supplies", label: "Office Supplies" },
              { value: "Other", label: "Other" }
            ]}
            placeholder="Select"
          />
          
          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
              Memo
            </label>
            <textarea
              id="memo"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              rows={3}
              placeholder="Add memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </FormSection>
        
        <FormButtons
          primaryButton={{
            label: "Review Payment",
            type: "submit",
            disabled: !isFormComplete
          }}
          className="pt-4"
        />
      </form>
    </div>
  );
}
