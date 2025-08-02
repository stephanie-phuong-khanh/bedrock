import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { Payment } from '@/types/db-types';

// GET /api/payments/[id] - Get a specific payment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`GET /api/payments/${id} - Starting request`);

    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);

    // RLS will ensure the user can only access their own payments
    const { data, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .single<Payment>();

    if (paymentError) {
      console.error('Error fetching payment:', paymentError);
      return NextResponse.json(
        { error: paymentError.message },
        { status: paymentError.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    return NextResponse.json({ payment: data });
  } catch (error) {
    console.error('Unexpected error in payments API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
