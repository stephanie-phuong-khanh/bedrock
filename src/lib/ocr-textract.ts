import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";

const region = process.env.AWS_REGION as string;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;

const textract = new TextractClient({
	region: region,
	credentials: {
		accessKeyId: accessKeyId,
		secretAccessKey: secretAccessKey
	}
});

// This is specific to our test samples of a US invoice and an EU invoice. This is not truly locale-aware.
function normalizeAmountLocaleAware(raw: string): string {
  // Remove currency symbols and whitespace
  let cleaned = raw.replace(/[^\d.,]/g, '').replace(/\s/g, '');

  // Heuristic: if comma comes after dot, assume US; if dot comes after comma, assume EU
  const commaIndex = cleaned.lastIndexOf(',');
  const dotIndex = cleaned.lastIndexOf('.');

  if (commaIndex > dotIndex) {
    // European format: "10 000,00" → "10000.00"
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // US format: "10,000.00" → "10000.00"
    cleaned = cleaned.replace(/,/g, '');
  }

  return cleaned;
}

/**
 * Analyzes a document using Amazon Textract. 
 * 
 * LIMITATION 1:
 * Currently only supports single-page documents and
 * files up to 10 MB in size for JPEG/PNG/image formats and up to 5 MB for PDFs/TIFFs.
 * https://docs.aws.amazon.com/textract/latest/dg/limits-document.html
 * 
 * LIMITATION 2:
 * Uses a synchronous API, which blocks the thread until the analysis is complete.
 * 
 * LIMITATION 3:
 * Because we currently store files in Supabase storage, we download the file from the signed URL
 * and pass it to Textract as a buffer. Ideally we would use S3 as the storage backend for files
 * and upload the file to S3 first, then pass the S3 object URL to Textract. The current implementation
 * is not optimal for speed and scalability.
 * 
 * @param signedUrl The signed URL of the document to analyze
 */
export async function analyzeFromSignedUrl(signedUrl: string) {
	const response = await fetch(signedUrl);
	const arrayBuffer = await response.arrayBuffer(); 
	const buffer = new Uint8Array(arrayBuffer); 

	// Textract's synchronous API
	// Specifically tuned for receipts and invoices
	const command = new AnalyzeExpenseCommand({
		Document: { Bytes: buffer },
	}); 

	const result = await textract.send(command);

	if (!result) {
		console.error('No result returned from Amazon Textract');
		return null;
	}

	const expenseDocs = result.ExpenseDocuments || [];

	if (!expenseDocs || expenseDocs.length === 0) {
		console.error('No expense documents found in the document');
		return null;
	}

	// The ExpenseDocuments array can contain more than one element if the document contains
	// multiple expense documents, such as multiple receipts in one file.
	// Here, raise an error if there are multiple expense documents.
	if (expenseDocs.length > 1) {
		console.error('Multiple expense documents found in the document');
		return null;
	}

	const expenseDoc = expenseDocs[0];
	const summaryFields = expenseDoc.SummaryFields;

	if (!summaryFields || summaryFields.length === 0) {
		console.error('No summary fields found in the document');
		return null;
	}

	// TODO: Map target fields to position in Textract result, to avoid hardcoding edge cases like currency
	const targetFields = {
		INVOICE_NUMBER: 'INVOICE_RECEIPT_ID',
		INVOICE_DATE: 'INVOICE_RECEIPT_DATE',
		DUE_DATE: 'DUE_DATE',
		AMOUNT: 'TOTAL', // $ 2 000.00
		// Currency is a special case because it's part of TOTAL field value but as Currency.Code
		CURRENCY: 'TOTAL', // USD
	}

	const targetFieldValues = Object.entries(targetFields).reduce((acc, [key, value]) => {
		const fieldValues = summaryFields.find((summaryField) => summaryField.Type?.Text === value);
		if (key === 'CURRENCY') {
			acc[key] = fieldValues?.Currency?.Code || null;
			return acc;
		}
		acc[key] = fieldValues?.ValueDetection?.Text || null;
		return acc;
	}, {} as Record<string, string | null>);

	// Parse amount into a string without currency symbol
	if (targetFieldValues.AMOUNT) {
		targetFieldValues.AMOUNT = normalizeAmountLocaleAware(targetFieldValues.AMOUNT);
	}

	return targetFieldValues;
}
