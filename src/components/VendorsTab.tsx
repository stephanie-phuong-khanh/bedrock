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
  const [currentVendor, setCurrentVendor] = useState<Vendor | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
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
    setCurrentVendor(undefined);
    setIsEditing(false);
  };
  
  const handleEditVendor = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setIsEditing(true);
    setIsSidePanelOpen(true);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading vendors...</div>;
  }
  
  return (
    <div className="relative">
      {/* Main content */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Vendors</h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Wallet Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.wallet_address ? (
                        <div className="flex items-center">
                          <span>
                            {vendor.wallet_address.substring(0, 6)}...{vendor.wallet_address.substring(vendor.wallet_address.length - 4)}
                          </span>
                          <button className="ml-2 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.wallet_chain ? (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {vendor.wallet_chain}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <button 
                          className="text-gray-400 hover:text-gray-600 mr-3"
                          onClick={() => handleEditVendor(vendor)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => {/* Delete vendor logic */}}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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
      
      {/* Side panel for adding/editing vendor */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transform ${
          isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="h-full overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium">
              {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            <button 
              onClick={() => {
                setIsSidePanelOpen(false);
                // Reset editing state when closing
                if (isEditing) {
                  setTimeout(() => {
                    setIsEditing(false);
                    setCurrentVendor(undefined);
                  }, 300); // Wait for animation to complete
                }
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <VendorForm 
            onSuccess={handleVendorAdded} 
            vendor={currentVendor}
            isEditing={isEditing}
          />
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
