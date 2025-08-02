import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { PaymentCategory } from '@/types/db-types';

// GET /api/payment_categories - Get all payment categories for the current user
export async function GET() {
  try {
    console.log('GET /api/payment_categories - Starting request');
    
    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    // Fetch payment categories for the current user using RLS
    const { data, error } = await supabase
      .from('payment_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .order('created_at', { ascending: true })
      .returns<PaymentCategory[]>();

    if (error) {
      console.error('Error fetching payment categories:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data.length} payment categories for user ${userId}`);
    
    // Return in the format the PaymentCategoriesTab component expects
    return NextResponse.json({ paymentCategories: data });
  } catch (error) {
    console.error('Unexpected error in payment categories API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
