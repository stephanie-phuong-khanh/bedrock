'use client';

import { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { InvoiceWithFileUrl } from '@/types/supabase';

interface InvoicePanelProps {
  invoice?: InvoiceWithFileUrl | null;
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
  
  // Determine if the file is a PDF based on file_path
  useEffect(() => {
    if (invoice && invoice.file_path) {
      const isPdfFile = 
        invoice.file_path.toLowerCase().endsWith('.pdf') || 
        invoice.file_path.toLowerCase().includes('.pdf') ||
        invoice.file_path.toLowerCase().includes('application/pdf');
      
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
    <div className="w-full h-full border-r border-gray-200 bg-gray-50 overflow-auto">
      {invoice ? (
        /* PDF Viewer when invoice exists */
        <div className="h-full relative">
          {/* Delete button - top right */}
          {onDelete && invoice && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => onDelete(invoice.id)}
                className="w-8 h-8 bg-white border-2 border-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors duration-200 shadow-sm"
                title="Delete Invoice"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Minimal PDF Viewer */}
          <div className="h-full overflow-auto p-6">
            {isPdf ? (
              <div className="w-full h-full">
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                  <div className="w-full h-full">
                    <Viewer 
                      fileUrl={invoice.fileUrl}
                      defaultScale={0.9}
                    />
                  </div>
                </Worker>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded">
                <p className="text-gray-600 mb-4">This file type is not supported for preview.</p>
                <a 
                  href={invoice.fileUrl} 
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
      ) : (
        /* Invoice upload interface when no invoice exists */
        <div className="h-full flex items-center justify-center p-8">
          <div className="w-full max-w-lg mx-auto">
            <div 
              ref={dropZoneRef}
              className={`border border-gray-200 shadow-md flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-white aspect-[8.5/11] w-full ${isDragging ? 'border-blue-400 bg-blue-50 shadow-md' : 'hover:border-gray-300 hover:shadow-md'}`}
              onClick={handleBrowseFiles}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="mb-4 font-medium">
                    <span className="text-gray-800">Drop invoice or </span>
                    <span style={{ color: 'var(--color-primary)' }}>browse files</span>
                  </div>
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
        </div>
      )}
    </div>
  );
}
