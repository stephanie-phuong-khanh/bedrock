export interface Vendor {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  email: string;
  wallet_address: string | null;
  wallet_chain: string | null;
  tax_file_url: string | null;
}

export type NewVendor = Omit<Vendor, 'id' | 'created_at'>;

// Payment entity from database
export interface Payment {
  id: string;
  created_at: string;
  user_id: string;
  vendor_id: string;
  invoice_id: string | null;
  amount: number;
  currency: string;
  payment_network: string;
  sender_wallet_address: string;
  receiver_wallet_address: string;
  tx_hash: string | null;
  confirmed_at: string | null;
  supabase_uid: string;
}

// Invoice entity from database (actual schema)
export interface Invoice {
  id: string;
  created_at: string;
  user_id: string;
  vendor_id: string | null;
  file_path: string | null;
  ocr_data: any; // JSONB
  status: string;
  invoice_number: string | null;
  supabase_uid: string;
}

export type NewPayment = Omit<Payment, 'id' | 'created_at'>;
export type NewInvoice = Omit<Invoice, 'id' | 'created_at'>;
