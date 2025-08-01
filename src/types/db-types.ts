import { Database } from "@/types/supabase-types";

export type User = Database['public']['Tables']['users']['Row'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];

export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type InsertVendor = Database['public']['Tables']['vendors']['Insert'];
export type UpdateVendor = Database['public']['Tables']['vendors']['Update'];
