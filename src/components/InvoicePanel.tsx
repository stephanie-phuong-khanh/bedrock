'use client';

import { useState, useEffect, useRef } from 'react';
import { Invoice } from '@/types/supabase';

interface InvoicePanelProps {
  invoice?: Invoice | null;
  onUploadInvoice?: (file: File) => Promise<void>;
  onDelete?: (invoiceId: string) => Promise<void>;
}

export default function InvoicePanel({ invoice, onUploadInvoice, onDelete }: InvoicePanelProps) {
  const [isPdf, setIsPdf] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Determine if the file is a PDF based on file name or content type
  useEffect(() => {
    if (invoice) {
      const isPdfFile = 
        invoice.file_name.toLowerCase().endsWith('.pdf') || 
        invoice.file_url.toLowerCase().includes('.pdf') ||
        invoice.file_url.toLowerCase().includes('application/pdf');
      
      setIsPdf(isPdfFile);
    }
  }, [invoice]);
  
  // Set up drag and drop event handlers
  useEffect(() => {
    if (!dropZoneRef.current) return;
    
    const dropZone = dropZoneRef.current;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        await handleFileUpload(e.dataTransfer.files[0]);
      }
    };
    
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.includes('pdf')) {
      setUploadError('Only PDF files are allowed');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      if (onUploadInvoice) {
        await onUploadInvoice(file);
      }
    } catch (error) {
      console.error('Error uploading invoice:', error);
      setUploadError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-1/2 border-r border-gray-200 p-8 overflow-auto">
      {invoice ? (
        /* PDF Viewer when invoice exists */
        <div className="flex flex-col">
          <div className="w-full h-[calc(100vh-180px)] bg-gray-100 rounded-md flex items-center justify-center">
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
          
          {/* Delete button */}
          {onDelete && invoice && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => onDelete(invoice.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Invoice
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Invoice upload interface when no invoice exists */
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-bold mb-8">Select an invoice to upload</h2>
          
          <div 
            ref={dropZoneRef}
            className={`border-2 border-dashed rounded-md p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 max-w-md mx-auto w-full ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={handleBrowseFiles}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-2"></div>
                <p>Uploading...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="mb-2">Drag and drop your invoice here, or</p>
                <p className="mb-4 text-blue-600 font-medium">browse files</p>
                <p className="text-sm text-gray-500">PDF files only</p>
                
                {uploadError && (
                  <p className="mt-4 text-red-500 text-sm">{uploadError}</p>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileInputChange}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
