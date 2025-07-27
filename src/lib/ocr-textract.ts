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

	console.log('Amazon Textract Result: ', result);

	return result;
}
