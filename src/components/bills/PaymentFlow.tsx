'use client';

import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { erc20Abi, parseUnits } from 'viem';
import { InvoiceWithFileUrl, PaymentCreationPayload, Vendor } from '@/types/supabase';
import InvoicePanel from '@/components/bills/InvoicePanel';
import PaymentForm, { PaymentFormData } from '@/components/bills/PaymentForm';
import ConfirmPayment from '@/components/bills/ConfirmPayment';
import CompletedPayment from '@/components/bills/CompletedPayment';
import SidePanel from '@/components/dashboard/SidePanel';
import {
  getTokenContractAddress,
  isCryptocurrencyEnabled,
  getCryptocurrencyDecimals,
  getNetwork,
} from '@/constants/crypto';

interface PaymentFlowProps {
  invoice?: InvoiceWithFileUrl | null;
  onClose: () => void;
  onUploadInvoice?: (file: File) => Promise<void>;
  onDelete?: (invoiceId: string) => Promise<void>;
  onPaymentSuccess?: () => void;
}

export default function PaymentFlow({
  invoice,
  onClose,
  onUploadInvoice,
  onDelete,
  onPaymentSuccess
}: PaymentFlowProps) {
  const { primaryWallet } = useDynamicContext();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Payment flow state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
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
  
  // Fetch vendors function (reusable)
  const fetchVendors = async () => {
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
  };

  // Handle vendor creation - refresh vendors list and select new vendor
  const handleVendorCreated = async (newVendor: Vendor) => {
    // Defensive check for undefined newVendor
    if (!newVendor || !newVendor.id) {
      return;
    }
    
    // Refetch vendors to update the dropdown options
    const response = await fetch('/api/vendors', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      const refreshedVendors = data.vendors || [];
      
      // Update vendors list
      setVendors(refreshedVendors);
      
      // Find and select the newly created vendor from the refreshed list
      const foundVendor = refreshedVendors.find((v: Vendor) => v.id === newVendor.id);
      if (foundVendor) {
        setSelectedVendor(foundVendor);
      }
    }
  };
  
  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Handle invoice upload and populate payment form from OCR results
  useEffect(() => {
    if (invoice && invoice.ocr_data) {
      const ocr = invoice.ocr_data as Partial<PaymentFormData>;
      setPaymentData(prev => {
        // Use previous data or sensible defaults if prev is null
        const base: PaymentFormData = prev || {
          selectedVendor: null,
          fiatAmount: '',
          fiatCurrency: '',
          cryptoAsset: '',
          cryptoAmount: '',
          fxRate: 0, // TODO: Revisit this
          walletAddress: '',
          network: '',
          category: '',
          memo: '',
          invoiceNumber: '',
          invoiceDate: '',
          dueDate: '',
        };
        // Only overwrite fields present in OCR
        return {
          ...base,
          ...Object.fromEntries(
            Object.entries(ocr).filter(([, v]) => v !== undefined && v !== null)
          ),
        };
      });
    }
  }, [invoice]);

  
  const handleFormSubmit = (formData: PaymentFormData) => {
    setPaymentData(formData);
    setShowConfirmation(true);
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
      if (!isCryptocurrencyEnabled(paymentData.cryptoAsset)) {
        setPaymentError(`Token transfers for ${paymentData.cryptoAsset} not implemented yet`);
        setIsProcessingPayment(false);
        return;
      }

      // Get contract address for the network
      const contractAddress = getTokenContractAddress(paymentData.cryptoAsset, paymentData.network);
      if (!contractAddress) {
        setPaymentError(`${paymentData.cryptoAsset} contract not configured for network: ${paymentData.network}`);
        setIsProcessingPayment(false);
        return;
      }

      // Setup contract
      const contract = {
        address: contractAddress,
        abi: erc20Abi,
      };

      // Convert amount to token units
      const tokenDecimals = getCryptocurrencyDecimals(paymentData.cryptoAsset);
      const tokenAmount = parseUnits(paymentData.cryptoAmount, tokenDecimals);

      // Get the wallet's current chain ID
      const walletChainId = walletClient.chain?.id;
      const targetNetwork = getNetwork(paymentData.network);
      
      // Check if wallet is connected to the correct network
      if (!targetNetwork) {
        setPaymentError(`Unsupported network: ${paymentData.network}`);
        setIsProcessingPayment(false);
        return;
      }

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

      // Validate amount conversions
      const fiatAmountNum = parseFloat(paymentData.fiatAmount);
      const cryptoAmountNum = parseFloat(paymentData.cryptoAmount);
      
      if (isNaN(fiatAmountNum) || isNaN(cryptoAmountNum)) {
        throw new Error('Invalid amount format - amounts must be valid numbers');
      }
      
      if (fiatAmountNum <= 0 || cryptoAmountNum <= 0) {
        throw new Error('Invalid amount - amounts must be greater than zero');
      }

      // Record payment in database
      const paymentRecord: PaymentCreationPayload = {
        vendor_id: selectedVendor.id,
        invoice_id: invoice?.id || null,
        fiat_amount: fiatAmountNum,
        fiat_currency: paymentData.fiatCurrency,
        crypto_asset: paymentData.cryptoAsset,
        crypto_amount: cryptoAmountNum,
        fx_rate: paymentData.fxRate,
        payment_network: paymentData.network,
        sender_wallet_address: primaryWallet.address,
        receiver_wallet_address: paymentData.walletAddress,
        tx_hash: hash,
        confirmed_at: confirmedAt.toISOString(),
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
      setShowCompleted(true);
      
      // Don't call onPaymentSuccess here - let user see CompletedPayment first
    } catch (error: unknown) {
      console.error('Payment failed:', error);
      
      // Parse error message for user-friendly display
      let errorMessage = 'Payment failed';
      
      if (error instanceof Error) {
        const errorText = error.message;
        
        // Handle specific contract errors
        if (errorText.includes('transfer amount exceeds balance')) {
          errorMessage = `Insufficient ${paymentData.cryptoAsset} balance in your wallet. Please add more funds and try again.`;
        } else if (errorText.includes('ERC20: transfer to the zero address')) {
          errorMessage = 'Invalid recipient address. Please check the wallet address and try again.';
        } else if (errorText.includes('ERC20: approve to the zero address')) {
          errorMessage = 'Invalid token approval. Please try again.';
        } else if (errorText.includes('User rejected the request') || errorText.includes('user rejected transaction')) {
          errorMessage = 'Transaction was cancelled. Please try again when ready.';
        } else if (errorText.includes('insufficient funds for gas')) {
          errorMessage = 'Insufficient ETH for gas fees. Please add ETH to your wallet and try again.';
        } else if (errorText.includes('nonce too low') || errorText.includes('replacement transaction underpriced')) {
          errorMessage = 'Transaction conflict detected. Please wait a moment and try again.';
        } else if (errorText.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          // For other errors, use the original message but clean it up
          errorMessage = errorText;
        }
      }
      
      setPaymentError(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleVendorChange = (vendor: Vendor | null) => {
    setSelectedVendor(vendor);
  };

  const handleClose = () => {
    // If payment was completed successfully, notify parent before closing
    if (showCompleted && paymentSuccess) {
      onPaymentSuccess?.();
    }
    onClose();
  };

  const handleBack = () => {
    setShowConfirmation(false);
    setPaymentError(null); // Clear any previous errors when going back
  };

  // Dynamic title based on current step
  const getTitle = () => {
    if (showCompleted) {
      return "Payment confirmed";
    }
    if (!showConfirmation && !showCompleted) {
      return "New bill";
    }
    return "Pay bill";
  };

  // Determine if we should show the InvoicePanel
  const shouldShowInvoicePanel = () => {
    // Always show during PaymentForm step (when not in confirmation or completed)
    if (!showConfirmation && !showCompleted) {
      return true;
    }
    // Only show during ConfirmPayment and CompletedPayment if an invoice is provided
    return invoice !== null && invoice !== undefined;
  };

  const showInvoicePanel = shouldShowInvoicePanel();

  return (
    <SidePanel
      isOpen={true}
      onClose={onClose}
      layout={showInvoicePanel ? "dual" : "single"}
      title={getTitle()}
      width={showInvoicePanel ? "full" : "half"}
      leftContent={showInvoicePanel ? (
        <InvoicePanel 
          invoice={invoice}
          onUploadInvoice={showConfirmation || showCompleted ? undefined : onUploadInvoice}
          onDelete={showConfirmation || showCompleted ? undefined : onDelete}
        />
      ) : undefined}
      rightContent={
        <div className="p-6">
          {!showConfirmation && !showCompleted && (
            <PaymentForm
              vendors={vendors}
              isLoadingVendors={isLoadingVendors}
              errorMessage={errorMessage}
              onSubmit={handleFormSubmit}
              selectedVendor={selectedVendor}
              onVendorChange={handleVendorChange}
              initialFormData={paymentData}
              onVendorCreated={handleVendorCreated}
            />
          )}
          
          {showConfirmation && !showCompleted && paymentData && (
            <ConfirmPayment
              selectedVendor={paymentData.selectedVendor}
              fiatAmount={paymentData.fiatAmount}
              fiatCurrency={paymentData.fiatCurrency}
              cryptoAsset={paymentData.cryptoAsset}
              cryptoAmount={paymentData.cryptoAmount}
              walletAddress={paymentData.walletAddress}
              network={paymentData.network}
              memo={paymentData.memo}
              category={paymentData.category}
              invoiceNumber={paymentData.invoiceNumber}
              invoiceDate={paymentData.invoiceDate}
              dueDate={paymentData.dueDate}
              onBack={handleBack}
              onConfirm={handleConfirmPayment}
              isProcessingPayment={isProcessingPayment}
              paymentError={paymentError}
              paymentSuccess={paymentSuccess}
              txHash={txHash}
            />
          )}

          {showCompleted && paymentData && txHash && (
            <CompletedPayment
              selectedVendor={paymentData.selectedVendor}
              fiatAmount={paymentData.fiatAmount}
              fiatCurrency={paymentData.fiatCurrency}
              cryptoAsset={paymentData.cryptoAsset}
              cryptoAmount={paymentData.cryptoAmount}
              walletAddress={paymentData.walletAddress}
              network={paymentData.network}
              txHash={txHash}
              onClose={handleClose}
            />
          )}
        </div>
      }
    />
  );
}
