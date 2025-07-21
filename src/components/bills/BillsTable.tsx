'use client';

import { useState, useCallback, useEffect } from 'react';
import { PaymentWithVendor, PaymentWithVendorName } from '@/types/payments';
import PaymentDetails from '../payments/PaymentDetails';
import { getPaymentNetworkNameFromId } from '../../constants/crypto';

interface BillsTableProps {
  title?: string;
  emptyStateMessage?: string;
  emptyStateComponent?: React.ReactNode;
  filterPredicate?: (payment: PaymentWithVendorName) => boolean;
}

export default function BillsTable({ 
  title = "Bills", 
  emptyStateMessage = "No bills found",
  emptyStateComponent,
  filterPredicate 
}: BillsTableProps) {
  const [payments, setPayments] = useState<PaymentWithVendorName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithVendorName | null>(null);
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
      
      const data: PaymentWithVendor[] = await response.json();
      
      // Transform the data to include vendor_name and additional details from joined tables
      let paymentsWithVendorNames: PaymentWithVendorName[] = data.map((payment) => ({
        ...payment,
        vendor_name: payment.vendors?.name || 'Unknown Vendor',
        vendor_email: payment.vendors?.email,
        invoice_data: payment.invoices,
      }));

      // Apply filter if provided
      if (filterPredicate) {
        paymentsWithVendorNames = paymentsWithVendorNames.filter(filterPredicate);
      }
      
      setPayments(paymentsWithVendorNames);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterPredicate]);
  
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);
  
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
  const handlePaymentClick = (payment: PaymentWithVendorName) => {
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
        {payments.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        )}
        
        {payments.length === 0 ? (
          <div className="py-16">
            {emptyStateComponent || (
              <div className="text-center">
                <p className="text-gray-500">{emptyStateMessage}</p>
              </div>
            )}
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
                    Asset
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
                      <div className="text-sm text-gray-900">{payment.vendor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.fiat_amount} {payment.fiat_currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.crypto_asset}
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
