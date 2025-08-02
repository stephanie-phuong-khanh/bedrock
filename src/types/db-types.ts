import { Database } from "@/types/supabase-types";

export type User = Database['public']['Tables']['users']['Row'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];

export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type InsertVendor = Database['public']['Tables']['vendors']['Insert'];
export type UpdateVendor = Database['public']['Tables']['vendors']['Update'];

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceWithSignedUrl = Invoice & { signedUrl: string };
export type InsertInvoice = Database['public']['Tables']['invoices']['Insert'];
export type UpdateInvoice = Database['public']['Tables']['invoices']['Update'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type InsertPayment = Database['public']['Tables']['payments']['Insert'];
export type UpdatePayment = Database['public']['Tables']['payments']['Update'];
export type PaymentEnriched = Payment & {
	vendor: Vendor | null;
	invoice: Invoice | null;
	payment_category: PaymentCategory | null;
};

export type PaymentCategory = Database['public']['Tables']['payment_categories']['Row'];
export type InsertPaymentCategory = Database['public']['Tables']['payment_categories']['Insert'];
