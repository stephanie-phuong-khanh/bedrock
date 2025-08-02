import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { createPaymentInputSchema, insertPaymentSchema } from '@/types/zod';
import { Payment, PaymentWithVendorAndInvoice } from '@/types/db-types';

// GET /api/payments - Get all payments with joined vendor and invoice data, for the current user
export async function GET() {
  try {
    console.log('GET /api/payments - Starting request');
    
    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    // Fetch payments with joined vendor and invoice data
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        vendor:payments_vendor_id_fkey(*),
        invoice:payments_invoice_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .order('created_at', { ascending: false })
      .returns<PaymentWithVendorAndInvoice[]>();

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data.length} payments for user ${userId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in payments API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: Request) {
  try {
    console.log('POST /api/payments - Starting request');
    
    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    if (!userId || !supabaseUid) {
      return NextResponse.json(
        { error: 'Unauthorized, no user information in session' },
        { status: 401 }
      );
    }
    console.log(`Authenticated as user: ${userEmail} (${userId})`);

    // Validate client payload
    const parsedCreate = createPaymentInputSchema.safeParse(await request.json());
    if (!parsedCreate.success) {
      console.error('Validation error in payment:', parsedCreate.error);
      return NextResponse.json({ error: parsedCreate.error.message }, { status: 400 });
    }

    // Merge with server-only fields & validate again
    const finalPayment = insertPaymentSchema.parse({
      ...parsedCreate.data,
      user_id: userId,
      supabase_uid: supabaseUid,
    });

    // Insert into DB (no need to cast again)
    const { data, error } = await supabase
      .from('payments')
      .insert([finalPayment])
      .select()
      .single<Payment>();
      
    if (error) {
      console.error('Error creating payment:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    console.log(`Created payment ${data.id} for user ${userId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in payments API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
