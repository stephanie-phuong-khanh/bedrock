'use client';

import { useEffect, useRef, useState } from 'react';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { erc20Abi, parseUnits } from 'viem';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  toAddress: string; // vendor wallet address
  network: string; // vendor wallet network
  amount: number;    // in token units
  tokenSymbol: string; // e.g. 'USDC'
  tokenDecimals?: number; // optional, default 6
}

export default function WalletModal({
    isOpen,
    onClose,
    toAddress,
    network,
    amount,
    tokenSymbol,
    tokenDecimals = 6,
}: WalletModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      setError('Wallet not connected or not compatible');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Get wallet clients from Dynamic SDK
      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();

      // Only USDC is supported for now
      if (tokenSymbol !== 'USDC') {
        setError(`Token transfers for ${tokenSymbol} not implemented yet`);
        setIsProcessing(false);
        return;
      }

			// For USDC transfers, we need to interact with the USDC contract
			
			// USDC contract addresses (use the correct one for your network)
			const usdcContractAddresses: Record<string, `0x${string}`> = {
				'ethereum': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`, // Ethereum Mainnet
				// 'polygon': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as `0x${string}`, // Polygon Mainnet
				// 'arbitrum': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' as `0x${string}`, // Arbitrum
				// Add more networks as needed
			};

			// Get the contract address for the current network
			const contractAddress = usdcContractAddresses[network.toLowerCase()];
			
			if (!contractAddress) {
				setError(`USDC contract not configured for network: ${network}`);
				setIsProcessing(false);
				return;
			}
			
			// Create a contract instance
			const contract = {
				address: contractAddress,
				abi: erc20Abi,
			};
			
			// Calculate the amount with proper decimals
			const tokenAmount = parseUnits(amount.toString(), tokenDecimals);
			
			// Prepare the contract write parameters
			const { request } = await publicClient.simulateContract({
				...contract,
				functionName: 'transfer',
				args: [toAddress as `0x${string}`, tokenAmount],
				account: await walletClient.getAddresses().then(addresses => addresses[0]),
			});
			
			// Send the transaction
			const hash = await walletClient.writeContract(request);
      
      setTxHash(hash);
      
      // Wait for transaction receipt
      console.log('Transaction sent, hash:', hash);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      
      console.log('Transaction confirmed:', receipt);
      
      // Close modal after successful transaction
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
      >
        <h2 className="text-lg font-semibold mb-4">Pay with Crypto</h2>

        {/* Wallet connection */}
        {!primaryWallet ? (
          <div className="flex flex-col items-center">
            <DynamicWidget variant="dropdown"/>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary wallet connection */}
            <div className="text-sm space-y-2">
              <div>
                <strong>From (Primary Wallet):</strong>{' '}
                <span className="font-mono">{primaryWallet?.address}</span>
              </div>
              <div>
                <strong>Network:</strong>{' '}
                <span className="font-mono">{primaryWallet?.chain}</span>
              </div>

              <button
                className="text-blue-600 hover:underline"
                onClick={() => {
                  handleLogOut();
                }}
              >
                Disconnect
              </button>
            </div>

            {/* Payment details */}
            <div className="text-sm space-y-2">
              <div>
                <strong>To:</strong>{' '}
                <span className="font-mono">{toAddress}</span>
              </div>
              <div>
                <strong>Network:</strong>{' '}
                <span className="font-mono">{network}</span>
              </div>
            </div>

            <div className="text-sm space-y-2">
                <strong>Amount:</strong> {amount.toFixed(2)} {tokenSymbol}
            </div>

            {/* Transaction status */}
            {txHash && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">Transaction sent!</p>
                <p className="text-xs font-mono text-green-600 truncate">
                  Hash: {txHash}
                </p>
              </div>
            )}
            
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Confirm payment */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full bg-black text-white py-2 rounded hover:bg-gray-800 mt-4 flex items-center justify-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
