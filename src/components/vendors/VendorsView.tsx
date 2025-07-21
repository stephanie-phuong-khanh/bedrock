'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Vendor } from '@/types/supabase';
import VendorForm from './VendorForm';
import SidePanel from '../dashboard/SidePanel';
import Button from '../dashboard/Button';

export default function VendorsView() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vendors', {
        credentials: 'include', // Include cookies with the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load vendors');
      }
      
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  // Handle external add vendor trigger
  const handleAddVendorClick = () => {
    setCurrentVendor(undefined);
    setIsEditing(false);
    setIsSidePanelOpen(true);
  };

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
  
  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vendors/${vendorToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies with the request
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vendor');
      }
      
      // Refresh the vendors list
      loadVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setVendorToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setVendorToDelete(null);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading vendors...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Add vendor button */}
      <div className="flex justify-between items-center">
        <h1 className="text-page-title">Vendors</h1>
        <Button 
          size="md"
          onClick={handleAddVendorClick}
        >
          Add vendor
        </Button>
      </div>

      {/* Main content */}
      <div className="relative">
        {vendors.length === 0 ? (
          <div className="text-center py-8 border border-gray-200 rounded-lg">
            <p className="text-gray-500">No vendors found. Add your first vendor to get started.</p>
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
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No vendors found. Add your first vendor to get started.
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{vendor.email}</div>
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
                            onClick={() => handleDeleteClick(vendor)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Side Panel for adding/editing vendor */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false);
          // Reset editing state when closing
          if (isEditing) {
            setTimeout(() => {
              setIsEditing(false);
              setCurrentVendor(undefined);
            }, 300); // Wait for animation to complete
          }
        }}
        layout="single"
        title={isEditing ? 'Edit vendor' : 'Add vendor'}
        width="wide"
        rightContent={
          <div className="p-8">
            <VendorForm 
              onSuccess={handleVendorAdded} 
              vendor={currentVendor}
              isEditing={isEditing}
            />
          </div>
        }
      />
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/85 z-30" 
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
            onClick={handleDeleteCancel} 
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl z-40 w-full max-w-md">
            <h3 className="text-xl font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete vendor <span className="font-medium">{vendorToDelete?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
