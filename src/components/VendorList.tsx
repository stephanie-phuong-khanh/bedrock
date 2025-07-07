'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Vendor } from '@/types/supabase';
import VendorForm from './VendorForm';
import { Session } from 'next-auth';

// Extend the Session type to include the id property on the user object
interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export default function VendorList() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();
  
  const loadVendors = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, supabase]);
  
  useEffect(() => {
    loadVendors();
  }, [loadVendors]);
  
  const handleVendorAdded = () => {
    loadVendors();
    setIsModalOpen(false);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading vendors...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Vendors</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Add New Vendor
        </button>
      </div>
      
      {vendors.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No vendors found. Add your first vendor to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Doc</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.wallet_address.substring(0, 6)}...{vendor.wallet_address.substring(vendor.wallet_address.length - 4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.wallet_chain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.tax_file_url ? (
                      <a href={vendor.tax_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        View Document
                      </a>
                    ) : (
                      <span className="text-gray-400">No document</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal for adding a new vendor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Vendor</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <VendorFormWrapper onVendorAdded={handleVendorAdded} />
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component to handle the vendor form submission
function VendorFormWrapper({ onVendorAdded }: { onVendorAdded: () => void }) {
  const [formKey, setFormKey] = useState(0);
  
  const handleSuccess = () => {
    // Increment key to reset the form
    setFormKey(prev => prev + 1);
    // Notify parent component
    onVendorAdded();
  };
  
  return (
    <div key={formKey}>
      <VendorForm onSuccess={handleSuccess} />
    </div>
  );
}
