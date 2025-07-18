export interface Vendor {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  email: string;
  supabase_uid: string;
}

export type NewVendor = Omit<Vendor, 'id' | 'created_at'>;

export interface Payment {
  id: string;
  created_at: string;
  user_id: string;
  vendor_id: string;
  invoice_id: string | null;
  fiat_amount: number;
  fiat_currency: string;
  crypto_amount: number;
  crypto_asset: string;
  fx_rate: number;
  payment_network: string;
  sender_wallet_address: string;
  receiver_wallet_address: string;
  tx_hash: string | null;
  confirmed_at: string | null;
  supabase_uid: string;
}

// Type for payment creation payload (excludes fields set by API)
export type PaymentCreationPayload = Omit<Payment, 'id' | 'created_at' | 'user_id' | 'supabase_uid'>;

export interface Invoice {
  id: string;
  created_at: string;
  user_id: string;
  vendor_id: string | null;
  file_path: string | null;
  ocr_data: unknown | null;
  status: string;
  invoice_number: string | null;
  supabase_uid: string;
}

export type NewInvoice = Omit<Invoice, 'id' | 'created_at'>;

// Type for Invoice objects that include the signed URL from API responses
export interface InvoiceWithFileUrl extends Invoice {
  fileUrl: string;
}
