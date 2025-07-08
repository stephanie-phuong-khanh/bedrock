import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Ensure the invoices bucket exists
async function ensureInvoicesBucket() {
  const { error } = await supabaseAdmin.storage.getBucket('invoices');
  
  if (error && error.message.includes('does not exist')) {
    await supabaseAdmin.storage.createBucket('invoices', {
      public: false, // Keep files private
      fileSizeLimit: 10485760, // 10MB limit
    });
    console.log('Created invoices bucket');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the invoices bucket exists
    await ensureInvoicesBucket();

    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const vendorId = formData.get('vendorId') as string || null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Create a unique file name with user ID prefix
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    // Convert file to buffer for Supabase storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload file to Supabase storage using supabaseAdmin (service role)
    const { error } = await supabaseAdmin.storage
      .from('invoices')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 });
    }

    // Create a signed URL that will work even with RLS enabled
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from('invoices')
      .createSignedUrl(fileName, 60 * 60); // 1 hour expiry

    if (!signedUrlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }

    // Create a record in the invoices table
    const invoiceId = `INV-${Date.now()}`;
    const { error: insertError } = await supabaseAdmin
      .from('invoices')
      .insert({
        id: invoiceId,
        user_id: userId,
        vendor_id: vendorId, // Use the vendor ID if provided
        file_url: fileName, // Store the path to the file in Supabase storage
        status: 'uploaded',
        ocr_data: null, // Will be populated later if OCR processing is implemented
        invoice_number: null // Will be populated later if extracted from the invoice
      });

    if (insertError) {
      console.error('Error creating invoice record:', insertError);
      return NextResponse.json({ error: 'Failed to create invoice record: ' + insertError.message }, { status: 500 });
    }

    // Return the file path, signed URL, and invoice ID
    return NextResponse.json({
      success: true,
      filePath: fileName,
      fileUrl: signedUrlData.signedUrl,
      invoiceId: invoiceId
    });
  } catch (error: unknown) {
    console.error('Error in invoice upload:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the file path from the request
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    const userId = searchParams.get('userId');
    const invoiceId = searchParams.get('invoiceId');

    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Security check: ensure the file belongs to the user
    if (!filePath.startsWith(`${userId}/`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the file from Supabase storage
    const { error } = await supabaseAdmin.storage
      .from('invoices')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({ error: 'Failed to delete file: ' + error.message }, { status: 500 });
    }

    // If invoiceId is provided, delete the invoice record from the database
    if (invoiceId) {
      const { error: deleteError } = await supabaseAdmin
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', userId); // Additional security check

      if (deleteError) {
        console.error('Error deleting invoice record:', deleteError);
        return NextResponse.json({ error: 'Failed to delete invoice record: ' + deleteError.message }, { status: 500 });
      }
      
      console.log(`Invoice record ${invoiceId} deleted successfully`);
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
