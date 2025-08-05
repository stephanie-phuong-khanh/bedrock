import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { Payment, UpdatePayment } from '@/types/db-types';
import { updatePaymentSchema } from '@/types/zod';

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

// PATCH /api/payments/[id] - Update a specific payment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`PATCH /api/payments/${id} - Starting request`);

    const { supabase, userId, userEmail } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);

    // Get payment data from request
    const body = await request.json();
    const parsedPaymentData = updatePaymentSchema.safeParse(body);
    if (!parsedPaymentData.success) {
      return NextResponse.json(
        { error: parsedPaymentData.error.message },
        { status: 400 }
      );
    }
    const paymentData: UpdatePayment = parsedPaymentData.data;

    // Update the payment
    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating payment:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment: data[0] });
  } catch (error) {
    console.error('Unexpected error in payments API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
