import { Invoice } from '@/types/supabase';

/**
 * Uploads an invoice file to Supabase storage using the API route with service role
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @param vendorId Optional vendor ID to associate with the invoice
 * @returns The created invoice record or null if upload failed
 */
export async function uploadInvoice(file: File, userId: string, vendorId?: string): Promise<Invoice | null> {
  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    if (vendorId) {
      formData.append('vendorId', vendorId);
    }
    
    // Send the file to the API route that uses the service role
    const response = await fetch('/api/upload/invoice', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error uploading invoice:', errorData);
      return null;
    }
    
    const data = await response.json();
    
    // Create an Invoice object from the API response
    const invoice: Invoice = {
      id: data.invoiceId,
      created_at: new Date().toISOString(),
      user_id: userId,
      file_url: data.fileUrl,
      file_name: file.name,
      vendor_id: vendorId || null,
      amount: null,
      due_date: null,
      status: 'pending'
    };
    
    return invoice;
  } catch (error) {
    console.error('Unexpected error during invoice upload:', error);
    return null;
  }
}

/**
 * Deletes an invoice and its associated file using the API route with service role
 * @param invoiceId The ID of the invoice to delete
 * @param filePath The storage path of the file to delete
 * @param userId The ID of the user deleting the invoice
 */
export async function deleteInvoice(invoiceId: string, filePath: string, userId: string): Promise<boolean> {
  try {
    // Create the query parameters
    const params = new URLSearchParams({
      filePath,
      userId,
      invoiceId
    });
    
    // Send the delete request to the API route
    const response = await fetch(`/api/upload/invoice?${params.toString()}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error deleting invoice:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error during invoice deletion:', error);
    return false;
  }
}
