import { InvoiceWithFileUrl } from '@/types/supabase';

/**
 * Uploads an invoice file to Supabase storage using the API route with service role
 * @param file The file to upload
 * @returns The created invoice record with fileUrl or null if upload failed
 */
export async function uploadInvoice(file: File): Promise<InvoiceWithFileUrl | null> {
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
      if (errorData.validationErrors) {
        console.error('Validation errors during invoice upload:', errorData.validationErrors);
      } else {
        console.error('Error uploading invoice:', errorData);
      }
      return null;
    }
    
    const data = await response.json();
    
    // Backend validates the Invoice object structure before returning
    // Return the complete Invoice object with fileUrl from the backend
    return data.invoice;
  } catch (error) {
    console.error('Unexpected error during invoice upload:', error);
    return null;
  }
}
