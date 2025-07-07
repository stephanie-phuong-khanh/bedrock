'use client';

import { useState, useCallback, useEffect } from 'react';
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

export default function VendorsTab() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
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
    setIsSidePanelOpen(false);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading vendors...</div>;
  }
  
  return (
    <div className="relative">
      {/* Main content */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Manage Vendors</h2>
          <button 
            onClick={() => setIsSidePanelOpen(true)}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <span className="mr-1">+</span> Add New Vendor
          </button>
        </div>
        
        {vendors.length === 0 ? (
          <div className="text-center py-8 border border-gray-200 rounded-lg">
            <p className="text-gray-500">No vendors found. Add your first vendor to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Chain</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.wallet_address?.substring(0, 6)}...{vendor.wallet_address?.substring(vendor.wallet_address.length - 4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.wallet_chain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Side panel for adding new vendor */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transform ${
          isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="h-full overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium">Add New Vendor</h2>
            <button 
              onClick={() => setIsSidePanelOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <VendorForm onSuccess={handleVendorAdded} />
        </div>
      </div>
      
      {/* Overlay when side panel is open */}
      {isSidePanelOpen && (
        <div 
          className="fixed inset-0 bg-black/85 z-10"
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}
    </div>
  );
}
