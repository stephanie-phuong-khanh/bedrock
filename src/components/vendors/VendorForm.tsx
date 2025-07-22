'use client';

import { useState, useEffect } from 'react';
import type { Vendor } from '@/types/supabase';
import { FormSection, FormInput, FormButtons } from '../forms';

interface VendorFormProps {
  onSuccess?: () => void;
  vendor?: Vendor;
  isEditing?: boolean;
}

export default function VendorForm({ onSuccess, vendor, isEditing = false }: VendorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  // Initialize form with vendor data if editing, or reset if adding new
  useEffect(() => {
    if (vendor && isEditing) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
      });
    } else {
      // Reset form for "Add New" mode
      setFormData({
        name: '',
        email: '',
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
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && vendor) {
        // Update existing vendor
        const response = await fetch(`/api/vendors/${vendor.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies with the request
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update vendor');
        }
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          alert('Vendor updated successfully!');
        }
      } else {
        // Create new vendor
        const newVendor = {
          name: formData.name,
          email: formData.email,
        };
        
        const response = await fetch('/api/vendors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies with the request
          body: JSON.stringify(newVendor),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create vendor');
        }
        
        // Reset form and show success
        setFormData({
          name: '',
          email: '',
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
    <div className="px-4 pt-2 pb-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection>
          <FormInput
            label="Vendor Name"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)}
            required
            placeholder="Enter vendor name"
          />
          
          <FormInput
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)}
            required
            placeholder="Enter email address"
          />
        </FormSection>
        
        <FormButtons
          primaryButton={{
            label: isSubmitting ? 'Saving...' : (isEditing ? 'Update Vendor' : 'Add Vendor'),
            type: 'submit',
            disabled: isSubmitting,
            loading: isSubmitting
          }}
          align="right"
        />
      </form>
    </div>
  );
}
