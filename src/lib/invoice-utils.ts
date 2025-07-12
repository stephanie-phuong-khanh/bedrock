import { Invoice } from '@/types/supabase';

/**
 * Uploads an invoice file to Supabase storage using the API route with service role
 * @param file The file to upload
 * @param vendorId Optional vendor ID to associate with the invoice
 * @returns The created invoice record or null if upload failed
 */
export async function uploadInvoice(file: File): Promise<Invoice | null> {
  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append('file', file);

    // Send the file to the API route that uses the service role
    const response = await fetch('/api/invoices', {
      method: 'POST',
      credentials: 'include', // Include cookies with the request
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
      user_id: data.userId,
      file_url: data.fileUrl,
      file_name: file.name,
      vendor_id: null,
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
