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

    // Get the public URL for the file
    const fileUrl = supabaseAdmin.storage.from('invoices').getPublicUrl(fileName).data.publicUrl;

    // Return the file URL and path
    return NextResponse.json({
      success: true,
      filePath: fileName,
      fileUrl: fileUrl
    });
  } catch (error: unknown) {
    console.error('Error in invoice upload:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
