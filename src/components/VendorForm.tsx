'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { NewVendor } from '@/types/supabase';
import type { Session } from 'next-auth';

interface VendorFormProps {
  onSuccess?: () => void;
}

export default function VendorForm({ onSuccess }: VendorFormProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallet_address: '',
    wallet_chain: 'ethereum', // Default value
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert('You must be logged in to add a vendor');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let taxFileUrl = null;
      
      // 1. Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('vendor-tax-files')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL for the file
        const { data: urlData } = supabase.storage
          .from('vendor-tax-files')
          .getPublicUrl(fileName);
          
        taxFileUrl = urlData.publicUrl;
      }
      
      // 2. Insert vendor record
      const newVendor: NewVendor = {
        user_id: session.user.id,
        name: formData.name,
        email: formData.email,
        wallet_address: formData.wallet_address,
        wallet_chain: formData.wallet_chain,
        tax_file_url: taxFileUrl,
      };
      
      const { error } = await supabase
        .from('vendors')
        .insert([newVendor]);
        
      if (error) throw error;
      
      // 3. Reset form and show success
      setFormData({
        name: '',
        email: '',
        wallet_address: '',
        wallet_chain: 'ethereum',
      });
      setFile(null);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        alert('Vendor added successfully!');
      }
      
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Failed to add vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Vendor Name *
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address *
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Wallet Address *
          <input
            type="text"
            name="wallet_address"
            value={formData.wallet_address}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Blockchain *
          <select
            name="wallet_chain"
            value={formData.wallet_chain}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="optimism">Optimism</option>
            <option value="base">Base</option>
          </select>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tax Document (W-9/W-8)
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
        </label>
        <p className="mt-1 text-sm text-gray-500">Upload W-9 for US vendors or W-8 for international vendors</p>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Adding Vendor...' : 'Add Vendor'}
        </button>
      </div>
    </form>
  );
}
