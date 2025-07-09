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

export type NewInvoice = Omit<Invoice, 'id' | 'created_at'>;
