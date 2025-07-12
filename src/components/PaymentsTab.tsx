'use client';

import { useState, useCallback, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

// Define the Payment type based on the schema
type Payment = {
  id: string;
  created_at: string;
  user_id: string;
  vendor_id: string;
  invoice_id: string | null;
  amount: number;
  currency: string;
  payment_network: string;
  sender_wallet_address: string;
  receiver_wallet_address: string;
  tx_hash: string | null;
  confirmed_at: string | null;
};

// Define a type for payments with vendor name included
type PaymentWithVendorName = Payment & {
  vendor_name?: string;
};

export default function PaymentsTab() {
  const [payments, setPayments] = useState<PaymentWithVendorName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithVendorName | null>(null);

  // Function to load payments
  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payments', {
        credentials: 'include', // Include cookies with the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load payments');
      }
      
      const data = await response.json();
      
      // Fetch vendor names for each payment
      const paymentsWithVendorNames = await Promise.all(
        data.map(async (payment: Payment) => {
          try {
            const vendorResponse = await fetch(`/api/vendors/${payment.vendor_id}`, {
              credentials: 'include',
            });
            
            if (vendorResponse.ok) {
              const vendorData = await vendorResponse.json();
              return {
                ...payment,
                vendor_name: vendorData.name,
              };
            }
            return {
              ...payment,
              vendor_name: 'Unknown Vendor',
            };
          } catch (error) {
            console.error(`Error fetching vendor for payment ${payment.id}:`, error);
            return {
              ...payment,
              vendor_name: 'Unknown Vendor',
            };
          }
        })
      );
      
      setPayments(paymentsWithVendorNames);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);
  
  const handleViewDetails = (payment: PaymentWithVendorName) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };
  
  // Format the amount with the currency symbol
  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'ETH') return `${amount} ETH`;
    if (currency === 'USDC' || currency === 'USDT' || currency === 'DAI') return `${amount} ${currency}`;
    return `${amount} ${currency}`;
  };
  
  // Format the date in a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
  };
  
  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading payments...</div>;
  }
  
  return (
    <div className="relative">
      {/* Main content */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Payments</h2>
        </div>
        
        {payments.length === 0 ? (
          <div className="text-center py-8 border border-gray-200 rounded-lg">
            <p className="text-gray-500">No payments found. Complete a payment to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Network
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.confirmed_at || payment.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.vendor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{payment.payment_network}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleViewDetails(payment)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setShowDetailsModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl z-40 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">Payment Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Vendor</p>
                <p className="font-medium">{selectedPayment.vendor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">{formatAmount(selectedPayment.amount, selectedPayment.currency)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Network</p>
                <p className="font-medium">{selectedPayment.payment_network}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(selectedPayment.confirmed_at || selectedPayment.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-medium">
                  {truncateAddress(selectedPayment.sender_wallet_address)}
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => navigator.clipboard.writeText(selectedPayment.sender_wallet_address)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">To</p>
                <p className="font-medium">
                  {truncateAddress(selectedPayment.receiver_wallet_address)}
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => navigator.clipboard.writeText(selectedPayment.receiver_wallet_address)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </p>
              </div>
              {selectedPayment.tx_hash && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-500">Transaction Hash</p>
                  <p className="font-medium break-all">
                    {selectedPayment.tx_hash}
                    <button 
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      onClick={() => navigator.clipboard.writeText(selectedPayment.tx_hash || '')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </p>
                </div>
              )}
            </div>
            
            {selectedPayment.tx_hash && (
              <div className="flex justify-center">
                <a 
                  href={`https://etherscan.io/tx/${selectedPayment.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                >
                  View on Blockchain Explorer
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
