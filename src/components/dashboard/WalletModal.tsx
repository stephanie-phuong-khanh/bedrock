'use client';

import { DynamicEmbeddedWidget } from '@dynamic-labs/sdk-react-core';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-700/50 backdrop-blur-[2px] flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <DynamicEmbeddedWidget />
      </div>
    </div>
  );
}
