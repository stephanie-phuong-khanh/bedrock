'use client';

import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { erc20Abi, parseUnits } from 'viem';
import { Invoice, Vendor } from '@/types/supabase';
import InvoicePanel from './InvoicePanel';
import PaymentForm, { PaymentFormData } from './PaymentForm';
import ConfirmPayment from './ConfirmPayment';
import { 
  CRYPTOCURRENCIES, 
  getTokenContractAddress,
  NETWORKS
} from '../constants/crypto';

interface PaymentFlowProps {
  invoice?: Invoice | null;
  onClose: () => void;
  onUploadInvoice?: (file: File) => Promise<void>;
  onDelete?: (invoiceId: string) => Promise<void>;
}

export default function PaymentFlow({ invoice, onClose, onUploadInvoice, onDelete }: PaymentFlowProps) {
  const { primaryWallet } = useDynamicContext();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Payment flow state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  
  // Payment execution states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Set selected vendor if invoice has a vendor_id
  useEffect(() => {
    if (invoice && invoice.vendor_id && vendors.length > 0) {
      const vendor = vendors.find(v => v.id === invoice.vendor_id);
      if (vendor) {
        setSelectedVendor(vendor);
      }
    }
  }, [invoice, vendors]);
  
  // Fetch vendors on component mount
  useEffect(() => {
    async function fetchVendors() {
      try {
        setIsLoadingVendors(true);
        
        // Use the API endpoint instead of direct Supabase access
        const response = await fetch('/api/vendors', {
          credentials: 'include', // Include cookies with the request
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load vendors');
        }
        
        const data = await response.json();
        setVendors(data.vendors || []);
      } catch (err: unknown) {
        console.error('Error fetching vendors:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load vendors');
      } finally {
        setIsLoadingVendors(false);
      }
    }
    
    fetchVendors();
  }, []);
  
  const handleFormSubmit = (formData: PaymentFormData) => {
    setPaymentData(formData);
    setShowConfirmation(true);
  };
  
  const handleBack = () => {
    setShowConfirmation(false);
  };

  const handleConfirmPayment = async () => {
    // Reset states at the beginning of each attempt
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    if (!paymentData || !selectedVendor || !primaryWallet) {
      setPaymentError('Missing payment data or wallet connection');
      setIsProcessingPayment(false);
      return;
    }

    if (!isEthereumWallet(primaryWallet)) {
      setPaymentError('Wallet not connected or not compatible');
      setIsProcessingPayment(false);
      return;
    }

    try {
      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();

      // Validate token is enabled
      if (!CRYPTOCURRENCIES[paymentData.currency]?.isEnabled) {
        setPaymentError(`Token transfers for ${paymentData.currency} not implemented yet`);
        setIsProcessingPayment(false);
        return;
      }

      // Get contract address for the network
      const contractAddress = getTokenContractAddress(paymentData.currency, paymentData.network);
      if (!contractAddress) {
        setPaymentError(`${paymentData.currency} contract not configured for network: ${paymentData.network}`);
        setIsProcessingPayment(false);
        return;
      }

      // Setup contract
      const contract = {
        address: contractAddress,
        abi: erc20Abi,
      };

      // Convert amount to token units
      const tokenDecimals = CRYPTOCURRENCIES[paymentData.currency].decimals;
      const tokenAmount = parseUnits(paymentData.amount.toString(), tokenDecimals);

      // Get the wallet's current chain ID
      const walletChainId = walletClient.chain?.id;
      
      // Find the target network's chain ID
      const targetNetwork = NETWORKS[paymentData.network];
      if (!targetNetwork) {
        setPaymentError(`Unsupported network: ${paymentData.network}`);
        setIsProcessingPayment(false);
        return;
      }

      // Check if wallet is on the correct network
      if (walletChainId !== targetNetwork.chainId) {
        console.log('Network mismatch detected:', {
          walletChainId,
          targetChainId: targetNetwork.chainId,
          targetNetwork: paymentData.network
        });
        setPaymentError(`Please switch your wallet to ${targetNetwork.name} (Chain ID: ${targetNetwork.chainId}) to proceed with the payment.`);
        setIsProcessingPayment(false);
        return;
      }

      console.log('Network validation passed:', {
        walletChainId,
        targetNetwork: paymentData.network
      });

      // Simulate transaction
      const { request } = await publicClient.simulateContract({
        ...contract,
        functionName: 'transfer',
        args: [paymentData.walletAddress as `0x${string}`, tokenAmount],
        account: primaryWallet.address as `0x${string}`,
      });

      // Send transaction
      const hash = await walletClient.writeContract(request);
      setTxHash(hash);
      console.log('Transaction sent, hash:', hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed:', receipt);

      // Get block timestamp
      const block = await publicClient.getBlock({ blockHash: receipt.blockHash });
      const confirmedAt = new Date(Number(block.timestamp) * 1000);

      // Record payment in database
      const paymentRecord = {
        vendor_id: selectedVendor.id,
        invoice_id: invoice?.id || null,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_network: paymentData.network,
        sender_wallet_address: primaryWallet.address,
        receiver_wallet_address: paymentData.walletAddress,
        tx_hash: hash,
        confirmed_at: confirmedAt,
      };

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(paymentRecord),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record payment');
      }

      const data = await response.json();
      console.log('Payment record created:', data);
      
      setPaymentSuccess(true);
    } catch (error: unknown) {
      console.error('Payment failed:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleVendorChange = (vendor: Vendor | null) => {
    setSelectedVendor(vendor);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/85 z-10"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`fixed inset-y-0 right-0 ${(!showConfirmation || invoice) ? 'w-5/6' : 'w-full md:w-2/3 lg:w-1/2'} bg-white shadow-xl z-20 flex`}>
        {/* Invoice Panel - positioned to the left within the modal */}
        {(!showConfirmation || invoice) && (
          <div className="w-1/2 border-r border-gray-200">
            <InvoicePanel 
              invoice={invoice}
              onUploadInvoice={showConfirmation ? undefined : onUploadInvoice}
              onDelete={showConfirmation ? undefined : onDelete}
            />
          </div>
        )}

        {/* Payment Panel - positioned on the right within the modal */}
        <div className={`${(!showConfirmation || invoice) ? 'w-1/2' : 'w-full'} relative`}>
          <div className="h-full overflow-y-auto p-8">
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
            
            {showConfirmation && paymentData ? (
              <ConfirmPayment
                selectedVendor={paymentData.selectedVendor}
                amount={paymentData.amount}
                currency={paymentData.currency}
                walletAddress={paymentData.walletAddress}
                network={paymentData.network}
                memo={paymentData.memo}
                onBack={handleBack}
                onConfirm={handleConfirmPayment}
                isProcessingPayment={isProcessingPayment}
                paymentError={paymentError}
                paymentSuccess={paymentSuccess}
                txHash={txHash}
              />
            ) : (
              <PaymentForm
                vendors={vendors}
                isLoadingVendors={isLoadingVendors}
                errorMessage={errorMessage}
                onSubmit={handleFormSubmit}
                selectedVendor={selectedVendor}
                onVendorChange={handleVendorChange}
                initialFormData={paymentData}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
