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

export interface Payment {
  id: string;
  created_at: string;
  user_id: string;
  vendor_id: string;
  invoice_id: string | null;
  fiat_amount: number;
  fiat_currency: string;
  crypto_asset: string;
  crypto_amount: number;
  fx_rate: number;
  payment_network: string;
  sender_wallet_address: string;
  receiver_wallet_address: string;
  tx_hash: string | null;
  confirmed_at: string | null;
  supabase_uid: string;
}

export interface Invoice {
  id: string;
  created_at: string;
  user_id: string;
  file_url: string;
  file_name: string;
  vendor_id: string | null;
  amount: number | null;
  due_date: string | null;
  status: 'pending' | 'paid' | 'cancelled';
}

export type NewPayment = Omit<Payment, 'id' | 'created_at'>;
export type NewInvoice = Omit<Invoice, 'id' | 'created_at'>;
