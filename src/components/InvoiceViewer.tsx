import { Invoice } from '@/types/supabase';
import { useState, useEffect } from 'react';

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoiceViewer({ invoice, onClose }: InvoiceViewerProps) {
  const [isPdf, setIsPdf] = useState(true);
  
  // Determine if the file is a PDF based on file name or content type
  useEffect(() => {
    // Check if the file name ends with .pdf or if the URL contains PDF indicators
    const isPdfFile = 
      invoice.file_name.toLowerCase().endsWith('.pdf') || 
      invoice.file_url.toLowerCase().includes('.pdf') ||
      invoice.file_url.toLowerCase().includes('application/pdf');
    
    setIsPdf(isPdfFile);
  }, [invoice.file_name, invoice.file_url]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Left side - Invoice display */}
      <div className="w-1/2 border-r border-gray-200 p-8 overflow-auto">
        {/* PDF Viewer */}
        <div className="w-full h-[calc(100vh-120px)] bg-gray-100 rounded-md flex items-center justify-center">
          {isPdf ? (
            <object 
              data={invoice.file_url}
              type="application/pdf"
              className="w-full h-full"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <p className="mb-4 text-gray-600">Unable to display PDF directly.</p>
                <a 
                  href={invoice.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Open PDF in new tab
                </a>
              </div>
            </object>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">This file type is not supported for preview.</p>
              <a 
                href={invoice.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Payment details */}
      <div className="w-1/2 p-8 overflow-auto relative">
        {/* Close button positioned at the top right of the payment panel */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-4xl font-bold mb-6">Pay Bill</h2>
      </div>
    </div>
  );
}
