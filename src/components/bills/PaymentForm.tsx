'use client';

import { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { Vendor } from '@/types/db-types';
import { getEnabledCryptocurrencies, getEnabledNetworks } from '@/constants/crypto';
import { FormSection, FormInput, FormSelect, FormButtons, FormDateInput, CurrencySelect, NetworkSelect } from '@/components/forms';
import Button from '@/components/dashboard/Button';
import { useUserSession } from "@/context/UserSessionContext";
import { createVendorSchema } from '@/types/zod';
import { PaymentCategory } from '@/types/db-types';

interface PaymentFormProps {
  vendors: Vendor[];
  isLoadingVendors: boolean;
  errorMessage: string | null;
  onSubmit: (formData: PaymentFormData) => void;
  selectedVendor?: Vendor | null;
  onVendorChange?: (vendor: Vendor | null) => void;
  initialFormData?: PaymentFormData | null;
  onVendorCreated?: (vendor: Vendor) => void;
  paymentCategories: PaymentCategory[];
  isLoadingPaymentCategories: boolean;
  selectedCategory?: PaymentCategory | null;
  onCategoryChange?: (category: PaymentCategory | null) => void;
}

export interface PaymentFormData {
  selectedVendor?: Vendor | null;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  amount: string;
  currency: string;
  receiverWalletAddress: string;
  paymentNetwork: string;
  memo?: string;
  selectedCategory?: PaymentCategory | null;
}

export default function PaymentForm({ 
  vendors, 
  isLoadingVendors, 
  errorMessage,
  onSubmit, 
  selectedVendor: initialSelectedVendor,
  onVendorChange,
  initialFormData,
  onVendorCreated,
  paymentCategories,
  isLoadingPaymentCategories,
  selectedCategory: initialSelectedCategory,
  onCategoryChange,
}: PaymentFormProps) {
  const { session } = useUserSession();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(initialSelectedVendor || null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(initialFormData?.invoiceNumber || '');
  const [invoiceDate, setInvoiceDate] = useState<string>(initialFormData?.invoiceDate || '');
  const [dueDate, setDueDate] = useState<string>(initialFormData?.dueDate || '');
  const [amount, setAmount] = useState<string>(initialFormData?.amount || '0');
  const [currency, setCurrency] = useState<string>(initialFormData?.currency || '');
  const [receiverWalletAddress, setReceiverWalletAddress] = useState<string>(initialFormData?.receiverWalletAddress || '');
  const [paymentNetwork, setPaymentNetwork] = useState<string>(initialFormData?.paymentNetwork || '');
  const [memo, setMemo] = useState<string>(initialFormData?.memo || '');
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory | null>(initialSelectedCategory || null);

  // Validation state
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);

  // Vendor creation form state
  const [showVendorForm, setShowVendorForm] = useState<boolean>(false);
  const [newVendorName, setNewVendorName] = useState<string>('');
  const [newVendorEmail, setNewVendorEmail] = useState<string>('');
  const [isCreatingVendor, setIsCreatingVendor] = useState<boolean>(false);

  // Update selectedVendor when prop changes
  useEffect(() => {
    // Compare by ID to handle object reference differences
    const currentId = selectedVendor?.id;
    const newId = initialSelectedVendor?.id;
    
    if (currentId !== newId) {
      setSelectedVendor(initialSelectedVendor || null);
    }
  }, [initialSelectedVendor, selectedVendor]);

  // Update all state fields when initialFormData changes
  useEffect(() => {
    if (initialFormData) {
      setSelectedVendor(initialFormData.selectedVendor || null);
      setAmount(initialFormData.amount || '0');
      setCurrency(initialFormData.currency || '');
      setReceiverWalletAddress(initialFormData.receiverWalletAddress || '');
      setPaymentNetwork(initialFormData.paymentNetwork || '');
      setMemo(initialFormData.memo || '');
      setInvoiceNumber(initialFormData.invoiceNumber || '');
      setInvoiceDate(initialFormData.invoiceDate || '');
      setDueDate(initialFormData.dueDate || '');
      setSelectedCategory(initialFormData.selectedCategory || null);
    }
  }, [initialFormData]);

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
    setReceiverWalletAddress(value);
    validateWalletAddress(value);
  };

  // Check if all required fields are filled
  const isFormComplete = selectedVendor && 
    parseFloat(amount) > 0 && 
    currency !== '' && 
    receiverWalletAddress.trim() !== '' && 
    paymentNetwork !== '' && 
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    if (!categoryId) {
      setSelectedCategory(null);
      onCategoryChange?.(null);
      return;
    }
    
    const category = paymentCategories.find(c => c.id === categoryId);
    setSelectedCategory(category || null);
    onCategoryChange?.(category || null);
  };

  // Handle showing vendor creation form
  const handleCreateVendorClick = () => {
    setShowVendorForm(true);
  };

  // Handle canceling vendor creation
  const handleCancelVendorCreation = () => {
    setShowVendorForm(false);
    setNewVendorName('');
    setNewVendorEmail('');
  };

  // Handle creating new vendor
  const handleCreateVendor = async () => {
    const vendorPayload = {
      name: newVendorName.trim(),
      email: newVendorEmail.trim(),
    };

    const createVendorParsed = createVendorSchema.safeParse(vendorPayload);

    if (!createVendorParsed.success) {
      alert(createVendorParsed.error.message);
      return;
    }

    setIsCreatingVendor(true);
    
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createVendorParsed.data),
      });

      if (!response.ok) {
        throw new Error('Failed to create vendor');
      }

      const data = await response.json();
      const newVendor = data; // API returns vendor object directly
      
      // Notify parent component to refresh vendors list and handle selection
      onVendorCreated?.(newVendor);
      
      // Reset form state
      setShowVendorForm(false);
      setNewVendorName('');
      setNewVendorEmail('');
      
    } catch (error) {
      console.error('Error creating vendor:', error);
      alert('Failed to create vendor. Please try again.');
    } finally {
      setIsCreatingVendor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicitly check each required field
    if (!selectedVendor) {
      alert('Please select a vendor');
      return;
    }
    
    if (!amount) {
      alert('Please enter an amount');
      return;
    }
    
    if (!currency) {
      alert('Please select a currency');
      return;
    }
    
    if (!receiverWalletAddress.trim()) {
      alert('Please enter a wallet address');
      return;
    }
    
    if (!paymentNetwork) {
      alert('Please select a payment network');
      return;
    }
    
    if (!isAddressValid) {
      alert('Please enter a valid EVM wallet address');
      return;
    }
    
    // If all validations pass, call onSubmit with form data
    onSubmit({
      selectedVendor,
      invoiceNumber,
      invoiceDate,
      dueDate,
      amount,
      currency,
      receiverWalletAddress,
      paymentNetwork,
      memo,
      selectedCategory,
    });
  };

  return (
    <div className="px-4 pt-2 pb-4">
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
          <div className="flex gap-4 items-end">
            <div className="flex-1">
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
                placeholder="Select a vendor"
                required
                disabled={isLoadingVendors}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              className="py-2.5"
              type="button"
              onClick={handleCreateVendorClick}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add new vendor
            </Button>
          </div>
          
          {/* Inline vendor creation form */}
          {showVendorForm && (
            <div className="mt-4 p-6 border border-gray-200 rounded-lg shadow-sm">
              <div className="space-y-4">
                <FormInput
                  label="Name"
                  id="vendor-name"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="Add name"
                  required
                />
                
                <FormInput
                  label="Email"
                  id="vendor-email"
                  type="email"
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  placeholder="Add email"
                  required
                />
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                      variant="secondary"
                      size="md"
                      type="button"
                      onClick={handleCancelVendorCreation}
                      disabled={isCreatingVendor}
                      className="min-w-[60px] py-2"
                    >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    type="button"
                    onClick={handleCreateVendor}
                    disabled={isCreatingVendor || !newVendorName.trim() || !newVendorEmail.trim()}
                    className="min-w-[60px] py-2"
                  >
                    {isCreatingVendor ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <FormInput
            label="Invoice #"
            id="invoice-number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Add number"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormDateInput
              label="Invoice date"
              id="invoice-date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              placeholder="Select date"
            />
            
            <FormDateInput
              label="Due date"
              id="due-date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Select date"
            />
          </div>
        </FormSection>
        
        <FormSection title="Payment">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Amount"
              id="amount"
              value={amount}
              onChange={(e) => {
                const rawValue = e.target.value;
                // Allow digits + optional dot + up to 2 decimal digits
                if (/^\d*\.?\d{0,2}$/.test(rawValue)) {
                  setAmount(rawValue);
                }
              }}
              onBlur={() => {
                if (amount !== '') {
                  const num = parseFloat(amount);
                  if (!isNaN(num)) {
                    setAmount(num.toFixed(2));  // Ensures 2 decimal places
                  }
                }
              }}
              placeholder="0.00"
              required
            />
            
            <CurrencySelect
              label="Currency"
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={Object.values(getEnabledCryptocurrencies()).map(crypto => ({
                symbol: crypto.symbol,
                name: crypto.name,
                isEnabled: crypto.isEnabled
              }))}
              placeholder="Select a currency"
              required
            />
          </div>

          
          <FormInput
            label="Pay to"
            id="receiver-wallet-address"
            value={receiverWalletAddress}
            onChange={handleWalletAddressChange}
            placeholder="Add receiver wallet address"
            required
            error={isAddressValid === false ? "Please enter a valid EVM wallet address" : undefined}
          />

          <NetworkSelect
            label="Payment Network"
            id="payment-network"
            value={paymentNetwork}
            onChange={(e) => setPaymentNetwork(e.target.value)}
            options={getEnabledNetworks(session?.user?.email ? { email: session.user.email } : undefined).map(network => ({
              id: network.id,
              name: network.name,
              chainId: network.chainId,
            }))}
            placeholder="Select a network"
            required
          />
        </FormSection>
        
        <FormSection title="Details">
          <FormInput
            label="Memo"
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add memo"
          />

          <FormSelect
            label="Category"
            id="category"
            value={selectedCategory?.id || ''}
            onChange={(e) => handleCategoryChange(e)}
            options={paymentCategories.map(category => ({
              value: category.id,
              label: category.name,
            }))}
            placeholder="Select a category"
            disabled={isLoadingPaymentCategories}
          />

          {/* Hiding department for now */}
          {/* <FormSelect
            label="Department"
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={[]}
            placeholder="Select a department"
          /> */}
        </FormSection>
        
        <FormButtons
          primaryButton={{
            label: "Review Payment",
            type: "submit",
            disabled: !isFormComplete
          }}
          align="right"
          className="pt-4"
        />
      </form>
    </div>
  );
}
