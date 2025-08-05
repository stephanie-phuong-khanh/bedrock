import { z } from 'zod';
import { SUPPORTED_CURRENCY_SYMBOLS, SUPPORTED_NETWORK_IDS } from "@/constants/crypto";

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email'),
	auth_provider: z.string().min(1, 'Auth provider is required'),
	auth_provider_id: z.string().min(1, 'Auth provider ID is required'),
	avatar_url: z.string().url().nullable().optional(),
});

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  email: z.string().email('Invalid email'),
});
export const updateVendorSchema = createVendorSchema.partial();
export const vendorSchema = createVendorSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
});

export const insertInvoiceSchema = z.object({
	user_id: z.string().uuid(),
	supabase_uid: z.string().uuid(),
  storage_path: z.string().min(1, 'File path is required'),
  ocr_data: z.record(z.any()).nullable(),
});
export const updateInvoiceSchema = insertInvoiceSchema.partial();

export const invoiceSchema = insertInvoiceSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(), // ISO timestamp string
  updated_at: z.string(), // ISO timestamp string
});
export const invoiceWithSignedUrlSchema = invoiceSchema.extend({
  signedUrl: z.string().url(),
});

export const insertPaymentSchema = z.object({
  user_id: z.string().uuid(),
  supabase_uid: z.string().uuid(),
  vendor_id: z.string().uuid(),
  invoice_id: z.string().uuid().nullable(),
  invoice_number: z.string().max(255).nullable().optional(),
  invoice_date: z.string().datetime().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
  amount: z.number(),
  currency: z.enum(SUPPORTED_CURRENCY_SYMBOLS),
  sender_wallet_address: z.string().max(255),
  receiver_wallet_address: z.string().max(255),
  payment_network: z.enum(SUPPORTED_NETWORK_IDS),
  tx_hash: z.string().max(255).nullable().optional(),
  paid_date: z.string().datetime().nullable().optional(),
  memo: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  status: z.enum(['PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED']).default('PENDING'),
});
export const createPaymentInputSchema = insertPaymentSchema.omit({
  user_id: true,
  supabase_uid: true,
});
export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;
export const updatePaymentSchema = insertPaymentSchema.partial();
export const paymentSchema = insertPaymentSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
});
