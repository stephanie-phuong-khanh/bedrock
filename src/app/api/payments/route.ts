import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';

// GET /api/payments - Get all payments for the current user
export async function GET() {
  try {
    console.log('GET /api/payments - Starting request');
    
    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .order('created_at', { ascending: true });

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
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    const paymentData = await request.json();
    const paymentWithUserId = {
      ...paymentData,
      user_id: userId,
      supabase_uid: supabaseUid,
    };
    
    // Insert the payment
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentWithUserId])
      .select()
      .single();
      
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
