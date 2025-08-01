import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { Vendor, UpdateVendor } from '@/types/db-types';

// GET /api/vendors/[id] - Get a specific vendor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`GET /api/vendors/${id} - Starting request`);

    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);

    // RLS will ensure the user can only access their own vendors
    const { data, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .single<Vendor>();

    if (vendorError) {
      console.error('Error fetching vendor:', vendorError);
      return NextResponse.json(
        { error: vendorError.message },
        { status: vendorError.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    return NextResponse.json({ vendor: data });
  } catch (error) {
    console.error('Unexpected error in vendors API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PATCH /api/vendors/[id] - Update a vendor
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`PATCH /api/vendors/${id} - Starting request`);

    const { supabase, userId, userEmail } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    // Get vendor data from request
    const vendorData: UpdateVendor = await request.json();
    
    // Update the vendor
    // RLS will ensure the user can only update their own vendors
    const { data, error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating vendor:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Vendor not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ vendor: data[0] });
  } catch (error) {
    console.error('Unexpected error in vendors API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete a vendor
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/vendors/${id} - Starting request`);
    
    const { supabase, userId, userEmail } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    // Delete the vendor
    // RLS will ensure the user can only delete their own vendors
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting vendor:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in vendors API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
