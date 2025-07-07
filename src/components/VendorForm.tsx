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
  
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };
  
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
      
      console.log('NEW VENDOR:', newVendor);

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vendor Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wallet Address *
        </label>
        <input
          type="text"
          name="wallet_address"
          value={formData.wallet_address}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wallet Chain *
        </label>
        <select
          name="wallet_chain"
          value={formData.wallet_chain}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
        >
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
          <option value="arbitrum">Arbitrum</option>
          <option value="optimism">Optimism</option>
          <option value="base">Base</option>
        </select>
      </div>
      
      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tax Form (Optional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-gray-600 hover:text-gray-500"
              >
                <span>Drag and drop your file here, or browse files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PDF files only</p>
          </div>
        </div>
      </div> */}
      
      <div className="flex justify-end mt-8">
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
