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
