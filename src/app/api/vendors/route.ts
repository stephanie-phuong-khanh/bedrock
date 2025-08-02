import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { Vendor, InsertVendor } from '@/types/db-types';
import { createVendorSchema } from '@/types/zod';

// GET /api/vendors - Get all vendors for the current user
export async function GET() {
  try {
    console.log('GET /api/vendors - Starting request');

    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    // Fetch vendors for the current user using RLS
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .order('created_at', { ascending: true })
      .returns<Vendor[]>();

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data.length} vendors for user ${userId}`);
    
    // Return in the format the VendorsTab component expects
    return NextResponse.json({ vendors: data });
  } catch (error) {
    console.error('Unexpected error in vendors API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create a new vendor
export async function POST(request: Request) {
  try {
    console.log('POST /api/vendors - Starting request');
    
    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    if (!userId || !userEmail || !supabaseUid) {
      return NextResponse.json(
        { error: 'Unauthorized, no user information in session' },
        { status: 401 }
      );
    }
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    const body = await request.json();
    const parsedVendorData = createVendorSchema.safeParse(body);
    if (!parsedVendorData.success) {
      return NextResponse.json(
        { error: parsedVendorData.error.message },
        { status: 400 }
      );
    }
    const vendorData = parsedVendorData.data;

    const vendorWithUserId: InsertVendor = {
      ...vendorData,
      user_id: userId,
      supabase_uid: supabaseUid
    };
    
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorWithUserId])
      .select()
      .single<Vendor>();
    
    if (error) {
      console.error('Error creating vendor:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    console.log('Vendor created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in vendors API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
