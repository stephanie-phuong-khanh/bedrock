'use client';

import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { erc20Abi, parseUnits, PublicClient, WalletClient, WriteContractParameters } from 'viem';
import { CreatePaymentInput, createPaymentInputSchema } from '@/types/zod';
import { InvoiceWithSignedUrl, PaymentCategory } from '@/types/db-types';
import { Vendor } from '@/types/db-types';
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
  SupportedCurrency,
  SupportedNetwork,
} from '@/constants/crypto';

interface PaymentFlowProps {
  invoice?: InvoiceWithSignedUrl | null;
  onClose: () => void;
  onUploadInvoice?: (file: File) => Promise<void>;
  onDelete?: (invoiceId: string) => Promise<void>;
  onPaymentSuccess?: () => void;
  initiallyUploadingInvoice?: boolean;
}

function formatTxnError(error: unknown, currency?: string): string {
  let errorMessage = 'An unexpected error occurred.';

  if (typeof error === 'object' && error !== null) {
    const errorText = JSON.stringify(error).toLowerCase();

    if (errorText.includes('transfer amount exceeds balance')) {
      errorMessage = `Insufficient ${currency || 'token'} balance in your wallet. Please add more funds and try again.`;
    } else if (errorText.includes('erc20: transfer to the zero address')) {
      errorMessage = 'Invalid recipient address. Please check the wallet address and try again.';
    } else if (errorText.includes('erc20: approve to the zero address')) {
      errorMessage = 'Invalid token approval. Please try again.';
    } else if (errorText.includes('user rejected the request') || errorText.includes('user rejected transaction')) {
      errorMessage = 'Transaction was cancelled. Please try again when ready.';
    } else if (errorText.includes('insufficient funds for gas')) {
      errorMessage = 'Insufficient ETH for gas fees. Please add ETH to your wallet and try again.';
    } else if (errorText.includes('nonce too low') || errorText.includes('replacement transaction underpriced')) {
      errorMessage = 'Transaction conflict detected. Please wait a moment and try again.';
    } else if (errorText.includes('network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else {
      errorMessage = errorText;
    }
  }

  return errorMessage;
}

export default function PaymentFlow({
  invoice,
  onClose,
  onUploadInvoice,
  onDelete,
  onPaymentSuccess,
  initiallyUploadingInvoice
}: PaymentFlowProps) {
  const { primaryWallet } = useDynamicContext();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);

  const [paymentCategories, setPaymentCategories] = useState<PaymentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory | null>(null);
  const [isLoadingPaymentCategories, setIsLoadingPaymentCategories] = useState(true);

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
  const [paidAt, setPaidAt] = useState<Date | null>(null);
  
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

  const fetchPaymentCategories = async () => {
    try {
      setIsLoadingPaymentCategories(true);

      // Use the API endpoint instead of direct Supabase access
      const response = await fetch('/api/payment_categories', {
        credentials: 'include', // Include cookies with the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load payment categories');
      }
      
      const data = await response.json();
      setPaymentCategories(data.paymentCategories || []);
    } catch (err: unknown) {
      console.error('Error fetching payment categories:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load payment categories');
    } finally {
      setIsLoadingPaymentCategories(false);
    }
  };

  // Fetch vendors and payment categories on component mount
  useEffect(() => {
    fetchVendors();
    fetchPaymentCategories();
  }, []);

  // Handle invoice upload and populate payment form from OCR results
  useEffect(() => {
    if (invoice && invoice.ocr_data) {
      const ocr = invoice.ocr_data as Partial<PaymentFormData>;
      setPaymentData(prev => {
        // Use previous data or sensible defaults if prev is null
        const base: PaymentFormData = prev || {
          selectedVendor: null,
          amount: '',
          currency: '',
          invoiceNumber: '',
          invoiceDate: '',
          dueDate: '',
          receiverWalletAddress: '',
          paymentNetwork: '',
          memo: '',
          selectedCategory: null,
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

  const waitForReceipt = async (publicClient: PublicClient, txHash: `0x${string}`, maxAttempts = 10) => {
    let attempts = 0;
    let delay = 1000;
  
    while (attempts < maxAttempts) {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        return receipt;
      } catch (err: unknown) {
        if ((err as Error).message.includes('not found')) {
          console.error('Error object:', err);
          await new Promise(res => setTimeout(res, delay));
          attempts++;
          delay *= 2; // exponential backoff
        } else {
          console.error('Error object (thrown):', err);
          throw err; // rethrow unexpected errors
        }
      }
    }
    throw new Error('Transaction receipt not found after max retries');
  };

  const handleConfirmPayment = async () => {
    // Reset states at the beginning of each attempt
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    // Static validation of payment data
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

    // Validate token is enabled
    if (!isCryptocurrencyEnabled(paymentData.currency)) {
      setPaymentError(`Token transfers for ${paymentData.currency} not implemented yet`);
      setIsProcessingPayment(false);
      return;
    }

    // Get contract address for the network
    const contractAddress = getTokenContractAddress(paymentData.currency, paymentData.paymentNetwork);
    if (!contractAddress) {
      setPaymentError(`${paymentData.currency} contract not configured for network: ${paymentData.paymentNetwork}`);
      setIsProcessingPayment(false);
      return;
    }

    // Validate amount conversions
    const amountNum = parseFloat(paymentData.amount);
    if (isNaN(amountNum)) {
      setPaymentError('Invalid amount format - amounts must be valid numbers');
      setIsProcessingPayment(false);
      return;
    }
    if (amountNum <= 0) {
      setPaymentError('Invalid amount - amounts must be greater than zero');
      setIsProcessingPayment(false);
      return;
    }

    const contract = { address: contractAddress, abi: erc20Abi };
    const tokenDecimals = getCryptocurrencyDecimals(paymentData.currency);
    const tokenAmount = parseUnits(paymentData.amount, tokenDecimals);
    const targetNetwork = getNetwork(paymentData.paymentNetwork);

    if (!targetNetwork) {
      setPaymentError(`Unsupported network: ${paymentData.paymentNetwork}`);
      setIsProcessingPayment(false);
      return;
    }

    let publicClient: PublicClient;
    let walletClient: WalletClient;
    try {
      publicClient = await primaryWallet.getPublicClient();
      walletClient = await primaryWallet.getWalletClient();
    } catch (error: unknown) {
      console.error('Error getting wallet client:', error);
      setPaymentError(`Failed to get wallet client: ${error}`);
      setIsProcessingPayment(false);
      return;
    }

    const walletChainId = walletClient.chain?.id;
    if (!walletChainId) {
      setPaymentError('Unable to determine wallet network. Please reconnect your wallet.');
      setIsProcessingPayment(false);
      return;
    }
    if (walletChainId !== targetNetwork.chainId) {
      setPaymentError(`Network mismatch detected between your wallet (${walletChainId}) and target network (${targetNetwork.name}). Please switch your wallet to ${targetNetwork.name} to proceed with the payment.`);
      setIsProcessingPayment(false);
      return;
    }

    // Build and validate Payment record
    let pendingPaymentDataToSubmit: CreatePaymentInput;
    try {
      pendingPaymentDataToSubmit = {
        vendor_id: selectedVendor.id,
        invoice_id: invoice?.id || null,
        invoice_number: paymentData.invoiceNumber?.trim() || null,
        invoice_date: paymentData.invoiceDate? new Date(paymentData.invoiceDate).toISOString() : null,
        due_date: paymentData.dueDate? new Date(paymentData.dueDate).toISOString() : null,
        amount: amountNum,
        currency: paymentData.currency as SupportedCurrency,
        sender_wallet_address: primaryWallet.address,
        receiver_wallet_address: paymentData.receiverWalletAddress,
        payment_network: paymentData.paymentNetwork as SupportedNetwork,
        memo: paymentData.memo?.trim() || null,
        category_id: selectedCategory?.id || null,
        department_id: null,
        status: 'PENDING',
      };
      const parsedPendingPayment = createPaymentInputSchema.safeParse(pendingPaymentDataToSubmit);
      if (!parsedPendingPayment.success) {
        setPaymentError(parsedPendingPayment.error.message);
        setIsProcessingPayment(false);
        return;
      }
    } catch (error: unknown) {
      console.error('Error creating payment:', error);
      setPaymentError(error instanceof Error ? error.message : "Failed to build payment.");
      setIsProcessingPayment(false);
      return;
    }

    let request: WriteContractParameters;
    try {
      const result = await publicClient.simulateContract({
        ...contract,
        functionName: 'transfer',
        args: [paymentData.receiverWalletAddress as `0x${string}`, tokenAmount],
        account: primaryWallet.address as `0x${string}`,
      });
      request = result.request;
    } catch (error: unknown) {
      console.error('Error simulating transaction:', error);
      setPaymentError(formatTxnError(error, paymentData.currency));
      setIsProcessingPayment(false);
      return;
    }

    // Record pending payment 
    // PENDING = User intent exists, but no funds moved
    let paymentId: string;
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(pendingPaymentDataToSubmit),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record payment");
      }
    
      const data = await response.json();
      console.log('Pending payment record created');
      paymentId = data.id;
    } catch (error: unknown) {
      console.error('Error recording payment:', error);
      setPaymentError(`Failed to record payment: ${error}`);
      setIsProcessingPayment(false);
      return;
    }

    // Send transaction
    let hash: `0x${string}`;
    try {
      hash = await walletClient.writeContract(request);
      setTxHash(hash);
    } catch (error: unknown) {
      // Patch the payment record with FAILED status
      await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'FAILED' }),
        headers: { 'Content-Type': 'application/json' },
      });
      console.error('Failed to send transaction:', error);
      setPaymentError(`Failed to send transaction: ${formatTxnError(error, paymentData.currency)}\nPlease check your wallet to confirm whether it was sent.`);
      setIsProcessingPayment(false);
      return;
    }

    // Patch the payment record with tx_hash and SUBMITTED status
    const patchResponse = await fetch(`/api/payments/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        tx_hash: hash,
        status: 'SUBMITTED' // Funds are in-flight, awaiting confirmation
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!patchResponse.ok) {
      console.error('Failed to update payment record status to SUBMITTED', patchResponse);
      setPaymentError(`There was a problem recording your payment. Please check your wallet to confirm whether the payment ${hash} was sent.`);
      setIsProcessingPayment(false);
      return;
    }

    // Confirm transaction
    try {
      const receipt = await waitForReceipt(publicClient, hash);
      const block = await publicClient.getBlock({ blockHash: receipt.blockHash });
      const paidAt = new Date(Number(block.timestamp) * 1000);
      setPaidAt(paidAt);

      // Update payment record with paidAt and CONFIRMED status
      const updateResponse = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paid_date: paidAt.toISOString(),
          status: 'CONFIRMED',
        }),
      });
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Failed to update payment record status to CONFIRMED', updateResponse);
        throw new Error(errorData.error || "Failed to update payment");
      }
    } catch (error: unknown) {
      console.error('Error confirming transaction:', error);
      setPaymentError(`Transaction was submitted, but failed to confirm: ${formatTxnError(error, paymentData.currency)}\nPlease check your wallet to confirm whether it was sent.`);
      setIsProcessingPayment(false);
      return;
    }
    
    setPaymentSuccess(true);
    setShowCompleted(true);
    setIsProcessingPayment(false);
    // Don't call onPaymentSuccess here - let user see CompletedPayment first
  };

  const handleVendorChange = (vendor: Vendor | null) => {
    setSelectedVendor(vendor);
  };

  const handleCategoryChange = (category: PaymentCategory | null) => {
    setSelectedCategory(category);
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
          isUploading={initiallyUploadingInvoice}
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
              paymentCategories={paymentCategories}
              isLoadingPaymentCategories={isLoadingPaymentCategories}
              selectedCategory={paymentData?.selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}
          
          {showConfirmation && !showCompleted && paymentData && paymentData.selectedVendor && (
            <ConfirmPayment
              selectedVendor={paymentData.selectedVendor}
              invoiceNumber={paymentData.invoiceNumber}
              invoiceDate={paymentData.invoiceDate}
              dueDate={paymentData.dueDate}
              amount={paymentData.amount}
              currency={paymentData.currency}
              receiverWalletAddress={paymentData.receiverWalletAddress}
              paymentNetwork={paymentData.paymentNetwork}
              memo={paymentData.memo}
              selectedCategory={paymentData.selectedCategory}
              onBack={handleBack}
              onConfirm={handleConfirmPayment}
              isProcessingPayment={isProcessingPayment}
              paymentError={paymentError}
              paymentSuccess={paymentSuccess}
              txHash={txHash}
            />
          )}

          {showCompleted && paymentData && txHash && paymentData.selectedVendor && (
            <CompletedPayment
              selectedVendor={paymentData.selectedVendor}
              amount={paymentData.amount}
              currency={paymentData.currency}
              receiverWalletAddress={paymentData.receiverWalletAddress}
              paymentNetwork={paymentData.paymentNetwork}
              paidAt={paidAt}
              txHash={txHash}
              onClose={handleClose}
            />
          )}
        </div>
      }
    />
  );
}
