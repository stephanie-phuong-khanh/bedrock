import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, supabaseAdmin } from '@/lib/supabase';

// GET /api/invoices/[id] - Get invoice details with signed URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`GET /api/invoices/${id} - Starting request`);
    
    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    // Retrieve the invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .single();

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      return NextResponse.json(
        { error: invoiceError.message },
        { status: invoiceError.code === 'PGRST116' ? 404 : 500 }
      );
    }

    // Generate a signed URL for the invoice file
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('invoices')
      .createSignedUrl(invoice.file_path, 60 * 60); // 1 hour expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Error generating signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }

    // Return invoice details with signed URL
    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        fileUrl: signedUrlData.signedUrl
      }
    });
  } catch (error: unknown) {
    console.error('Error in invoice retrieval:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/invoices/${id} - Starting request`);
    
    const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
    console.log(`Authenticated as user: ${userEmail} (${userId})`);
    
    // Retrieve the invoice record 
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid)
      .single();

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      return NextResponse.json(
        { error: invoiceError.message },
        { status: invoiceError.code === 'PGRST116' ? 404 : 500 }
      );
    }

    // Delete the invoice file from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('invoices')
      .remove([invoice.file_path]);

    if (storageError) {
      console.error('Error deleting invoice file:', storageError);
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      );
    }

    // Delete the invoice record from the database
    const { error: deleteError } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('supabase_uid', supabaseUid);

    if (deleteError) {
      console.error('Error deleting invoice record:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Error in invoice deletion:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
