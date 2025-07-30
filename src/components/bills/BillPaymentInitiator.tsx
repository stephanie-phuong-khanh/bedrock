'use client';

import { useState, useRef, DragEvent } from 'react';

interface BillPaymentInitiatorProps {
  onFileSelect: (file: File) => void;
  onPayWithoutInvoice: () => void;
}

export default function BillPaymentInitiator({ 
  onFileSelect, 
  onPayWithoutInvoice, 
}: BillPaymentInitiatorProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
		<div className="flex flex-col h-full">
			<div className="px-6 py-6 space-y-4">
				{/* Header with Icon and Title */}
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 text-gray-600">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<span className="text-sm font-normal text-primary-600">
						Select an invoice to upload
					</span>
				</div>

				{/* Upload Area */}
				<div className="px-6 pt-2 pb-4">
					<div
						className={`border rounded-xl py-12 px-8 text-center transition-all duration-200 shadow-md bg-white hover:bg-gray-100 ${
							isDragOver
								? 'border-blue-400'
								: 'border-gray-200'
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={handleBrowseClick}
					>
						{/* Upload Icon */}
						<div className="mb-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 mx-auto text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
								/>
							</svg>
						</div>

						{/* Upload Text */}
						<div className="space-y-1">
							<p className="text-sm text-gray-600">
								Drop invoice or{' '} browse files
							</p>
							<p className="text-xs text-gray-500">PDF files only</p>
						</div>

						{/* Hidden File Input */}
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf"
							onChange={handleFileInputChange}
								className="hidden"
						/>
					</div>
				</div>
			</div>

			{/* Divider Line */}
			<div className="border-t border-gray-200"></div>

			<div className="flex-1 w-full h-full">
				{/* Pay Without Invoice Option */}
				<button
					onClick={onPayWithoutInvoice}
					className="flex items-center gap-3 w-full h-full py-6 px-6 text-left transition-all duration-200 group hover:bg-gray-100"
				>
					<div className="w-5 h-5 text-gray-600">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
					</div>
					<div className="flex-1 font-normal">
						<span className="text-sm text-primary-600">Pay bill without an invoice</span>
					</div>
					<svg
						className="h-5 w-5 text-gray-400 transition-colors"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			</div>
		</div>
  );
}
