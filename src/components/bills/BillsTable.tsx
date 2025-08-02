'use client';

import { useState, useCallback, useEffect } from 'react';
import PaymentDetails from '@/components/bills/PaymentDetails';
import { getPaymentNetworkNameFromId } from '@/constants/crypto';
import { PaymentEnriched } from '@/types/db-types';

interface BillsTableProps {
  emptyStateComponent?: React.ReactNode;
  filterPredicate?: (payment: PaymentEnriched) => boolean;
  refreshTrigger?: number;
}

export default function BillsTable({ 
  emptyStateComponent,
  filterPredicate,
  refreshTrigger
}: BillsTableProps) {
  const [payments, setPayments] = useState<PaymentEnriched[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentEnriched | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // Function to load bills (payment records)
  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payments', {
        credentials: 'include', // Include cookies with the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load bills');
      }
      
      let paymentsWithVendorAndInvoice: PaymentEnriched[] = await response.json();

      // Apply filter if provided
      if (filterPredicate) {
        paymentsWithVendorAndInvoice = paymentsWithVendorAndInvoice.filter(filterPredicate);
      }
      
      setPayments(paymentsWithVendorAndInvoice);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterPredicate]);
  
  useEffect(() => {
    loadPayments();
  }, [loadPayments, refreshTrigger]);
  
  // Format the date in a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle payment row click
  const handlePaymentClick = (payment: PaymentEnriched) => {
    setSelectedPayment(payment);
    setShowDetailsPanel(true);
  };

  // Handle closing the details panel
  const handleCloseDetailsPanel = () => {
    setShowDetailsPanel(false);
    setSelectedPayment(null);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading bills...</div>;
  }
  
  return (
    <div className="relative">
      {/* Main content */}
      <div>
        {payments.length === 0 ? (
          <div className="max-w-md mx-auto pt-16">
            <div className="p-1 mb-6">
              <h2 className="text-xl font-normal text-primary-600 text-center py-3">
                Upload an invoice to get started
              </h2>
            </div>
            <div className="border border-gray-200 rounded-lg mb-6 bg-gray-50">
              {emptyStateComponent}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Network
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePaymentClick(payment)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.vendor?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.paid_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount} {payment.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getPaymentNetworkNameFromId(payment.payment_network)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Panel */}
      <PaymentDetails
        payment={selectedPayment}
        isOpen={showDetailsPanel}
        onClose={handleCloseDetailsPanel}
      />
    </div>
  );
}
