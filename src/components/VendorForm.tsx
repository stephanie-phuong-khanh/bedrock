'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { NewVendor, Vendor } from '@/types/supabase';
import type { Session } from 'next-auth';

interface VendorFormProps {
  onSuccess?: () => void;
  vendor?: Vendor;
  isEditing?: boolean;
}

export default function VendorForm({ onSuccess, vendor, isEditing = false }: VendorFormProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallet_address: '',
    wallet_chain: '',
  });
  
  // Initialize form with vendor data if editing
  useEffect(() => {
    if (vendor && isEditing) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        wallet_address: vendor.wallet_address || '',
        wallet_chain: vendor.wallet_chain || '',
      });
    }
  }, [vendor, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert('You must be logged in to manage vendors');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && vendor) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update({
            name: formData.name,
            email: formData.email,
            wallet_address: formData.wallet_address || null,
            wallet_chain: formData.wallet_chain || null,
          })
          .eq('id', vendor.id)
          .eq('user_id', session.user.id); // Security check
          
        if (error) throw error;
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          alert('Vendor updated successfully!');
        }
      } else {
        // Create new vendor
        const newVendor: NewVendor = {
          user_id: session.user.id,
          name: formData.name,
          email: formData.email,
          wallet_address: formData.wallet_address || null,
          wallet_chain: formData.wallet_chain || null,
          tax_file_url: null,
        };
        
        const { error } = await supabase
          .from('vendors')
          .insert([newVendor]);
          
        if (error) throw error;
        
        // Reset form and show success
        setFormData({
          name: '',
          email: '',
          wallet_address: '',
          wallet_chain: '',
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          alert('Vendor added successfully!');
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} vendor:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'add'} vendor. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-gray-700 mb-2">
          Vendor Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 bg-gray-100 border-0 rounded-none focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 bg-gray-100 border-0 rounded-none focus:outline-none"
        />
      </div>
      
      <div className="mt-8">
        <h3 className="font-medium text-gray-700 mb-4">Preferred Wallet</h3>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            name="wallet_address"
            value={formData.wallet_address}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-gray-100 border-0 rounded-none focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">
            Wallet Chain
          </label>
          <input
            type="text"
            name="wallet_chain"
            value={formData.wallet_chain}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-gray-100 border-0 rounded-none focus:outline-none"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-12">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-16 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-sm shadow-sm focus:outline-none disabled:bg-gray-300"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
