import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, supabaseAdmin } from '@/lib/supabase';
import { analyzeFromSignedUrl } from '@/lib/ocr-textract';

// POST /api/invoices - Create a new invoice, which uploads the file to Supabase storage
// and creates a record in the invoices table
export async function POST(request: NextRequest) {
	try {
		// Ensure the invoices bucket exists
		await ensureInvoicesBucket();

		// Get form data from the request
		const formData = await request.formData();
		const file = formData.get('file') as File;;
		const vendorId = formData.get('vendorId') as string || null;

		const { supabase, userId, userEmail, supabaseUid } = await createUserSupabaseClient();
		console.log(`Authenticated as user: ${userEmail} (${userId})`);

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type (PDF only)
		if (file.type !== 'application/pdf') {
			return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
		}

		// Create a unique file name with user ID prefix
		const filePath = `${userId}/${Date.now()}-${file.name}`;

		// Convert file to buffer for Supabase storage
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload file to Supabase storage
		const { error } = await supabaseAdmin.storage
			.from('invoices')
			.upload(filePath, buffer, {
				contentType: file.type,
				cacheControl: '3600',
				upsert: false
			});

		if (error) {
			console.error('Error uploading file:', error);
			return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 });
		}

		// Create a signed URL
		const { data: signedUrlData } = await supabaseAdmin.storage
			.from('invoices')
			.createSignedUrl(filePath, 60 * 60); // 1 hour expiry

		if (!signedUrlData?.signedUrl) {
			return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
		}

		// Create a record in the invoices table
		const { data, error: insertError } = await supabase
			.from('invoices')
			.insert({
				user_id: userId,
				vendor_id: vendorId,
				file_path: filePath,
				status: 'uploaded',
				ocr_data: null,
				invoice_number: null,
				supabase_uid: supabaseUid,
			})
			.select()
			.single();

		if (insertError) {
			console.error('Error creating invoice record:', insertError);
			return NextResponse.json(
				{ error: 'Failed to create invoice record: ' + insertError.message },
				{ status: 500 }
			);
		}

		// OCR invoice

		// TODO: Keep going if OCR fails

		try {
			// TODO: Move out of this route handler
			const ocrResult = await analyzeFromSignedUrl(signedUrlData.signedUrl);

			console.log('Extraction result:', ocrResult); // TODO: Remove after dev

			if (ocrResult) {
				data.ocr_data = mapOcrToFormData(ocrResult);
			}

			// Write OCR results to the invoice record
			const { error: updateError } = await supabase
				.from('invoices')
				.update({
					ocr_data: data.ocr_data,
					invoice_number: data.ocr_data.invoiceNumber,
				})
			.eq('id', data.id);

			if (updateError) {
				console.error('Error updating invoice record:', updateError);
				return NextResponse.json(
					{ error: 'Failed to update invoice record: ' + updateError.message },
					{ status: 500 }
				);
			}
		} catch (error) {
			console.error('Error OCRing invoice:', error);
		}

		// Return the complete invoice record with signed URL merged in
		return NextResponse.json({
			success: true,
			invoice: {
				...data,
				fileUrl: signedUrlData.signedUrl
			}
		});
	} catch (error: unknown) {
		console.error('Error in invoice upload:', error);
		return NextResponse.json({ 
			error: 'Internal server error', 
			details: error instanceof Error ? error.message : 'Unknown error' 
		}, { status: 500 });
	}
}


// TODO: Potentially move into OCR utils
function mapOcrToFormData(ocrResult: Record<string, string | null>) : Record<string, string | null> {
	return {
		invoiceNumber: ocrResult['INVOICE_NUMBER'],
		invoiceDate: ocrResult['INVOICE_DATE'],
		dueDate: ocrResult['DUE_DATE'],
		fiatAmount: ocrResult['AMOUNT'],
		fiatCurrency: ocrResult['CURRENCY']
	}
}


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
