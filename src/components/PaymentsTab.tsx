'use client';

import { useState, useCallback, useEffect } from 'react';
import { NETWORKS } from '@/constants/crypto';
import { PaymentWithVendor, PaymentWithVendorName } from '@/types/payments';
import PaymentDetailsPanel from './PaymentDetailsPanel';

export default function PaymentsTab() {
  const [payments, setPayments] = useState<PaymentWithVendorName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithVendorName | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

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
      
      const data: PaymentWithVendor[] = await response.json();
      
      // Transform the data to include vendor_name and additional details from joined tables
      const paymentsWithVendorNames: PaymentWithVendorName[] = data.map((payment) => ({
        ...payment,
        vendor_name: payment.vendors?.name || 'Unknown Vendor',
        vendor_email: payment.vendors?.email,
        invoice_data: payment.invoices,
      }));
      
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
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    onClick={() => handlePaymentClick(payment)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.vendor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.confirmed_at || payment.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        $ {payment.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-blue-600">
                        {payment.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        {NETWORKS[payment.payment_network]?.name || payment.payment_network}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Side Panel */}
      <PaymentDetailsPanel
        payment={selectedPayment}
        isOpen={showDetailsPanel}
        onClose={handleCloseDetailsPanel}
      />
    </div>
  );
}
