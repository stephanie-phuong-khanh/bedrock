'use client';

import { useEffect, useRef, useState } from 'react';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { erc20Abi, parseUnits } from 'viem';
import { 
  CRYPTOCURRENCIES, 
  getTokenContractAddress,
	getBlockExplorerUrl,
} from '../constants/crypto';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorAddress: string; // vendor wallet address
  vendorNetwork: string; // vendor wallet network
  amount: number;    // in token units
  tokenSymbol: string; // e.g. 'USDC'
}

export default function WalletModal({
    isOpen,
    onClose,
    vendorAddress,
    vendorNetwork,
    amount,
    tokenSymbol,
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

      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();

      if (!CRYPTOCURRENCIES[tokenSymbol]?.isEnabled) {
        setError(`Token transfers for ${tokenSymbol} not implemented yet`);
        setIsProcessing(false);
        return;
      }

      // Get the contract address for the current network
      const contractAddress = getTokenContractAddress(tokenSymbol, vendorNetwork);
      
      if (!contractAddress) {
        setError(`${tokenSymbol} contract not configured for network: ${vendorNetwork}`);
        setIsProcessing(false);
        return;
      }
      
      const contract = {
        address: contractAddress,
        abi: erc20Abi,
      };

      // Get token decimals from constants
      const tokenDecimals = CRYPTOCURRENCIES[tokenSymbol].decimals;
      const tokenAmount = parseUnits(amount.toString(), tokenDecimals);

      const { request } = await publicClient.simulateContract({
        ...contract,
        functionName: 'transfer',
        args: [vendorAddress as `0x${string}`, tokenAmount],
        account: await walletClient.getAddresses().then(addresses => addresses[0]),
      });

      const hash = await walletClient.writeContract(request);

      setTxHash(hash);
      console.log('Transaction sent, hash:', hash);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      console.log('Transaction confirmed:', receipt);

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
                <span className="font-mono">{vendorAddress}</span>
              </div>
              <div>
                <strong>Network:</strong>{' '}
                <span className="font-mono">{vendorNetwork}</span>
              </div>
            </div>

            <div className="text-sm space-y-2">
                <strong>Amount:</strong> {amount.toFixed(2)} {tokenSymbol}
            </div>

            {/* Transaction status */}
            {isProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Processing payment...</p>
              </div>
            )}
            
            {/* Transaction hash display for debugging */}
            {txHash && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
                <p className="text-xs font-mono break-all mt-1">{txHash}</p>
                <a 
                  href={getBlockExplorerUrl(vendorNetwork, txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                >
                  View on Etherscan
                </a>
              </div>
            )}

            {/* Error message */}
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
