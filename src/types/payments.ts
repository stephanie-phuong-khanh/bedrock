import { Payment } from './supabase';

// Extended types for UI components that include joined data from API responses

// Payment with vendor data (from API JOIN)
export interface PaymentWithVendor extends Payment {
  vendors: {
    name: string;
    email: string;
  } | null;
  invoices: {
    id: string;
    invoice_number: string;
    status: string;
    file_path: string;
    created_at: string;
  } | null;
}

// Payment with flattened vendor data for UI components
export interface PaymentWithVendorName extends Payment {
  vendor_name: string;
  vendor_email?: string;
  invoice_data?: {
    id: string;
    invoice_number: string;
    status: string;
    file_path: string;
    created_at: string;
  } | null;
}
