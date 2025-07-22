'use client';

import { useEffect, useRef } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  layout?: 'single' | 'dual';
  title?: string;
  leftContent?: React.ReactNode;  // For invoices or other left-side content
  rightContent: React.ReactNode;  // Main content
  width?: 'full' | 'half';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const WIDTHS = {
  full: 'w-4/5',       // 80% - for dual-panel layouts
  half: 'w-2/5'        // 40% - for single-panel layouts
} as const;

export default function SidePanel({
  isOpen,
  onClose,
  layout = 'single',
  title,
  leftContent,
  rightContent,
  width = layout === 'dual' ? 'full' : 'half',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}: SidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Focus the panel when it opens
    panel.focus();

    // Trap focus within the panel
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/85 z-40 transition-opacity duration-300"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Panel Container */}
      <div 
        ref={panelRef}
        className={`fixed right-0 top-0 h-full ${WIDTHS[width]} z-50 transform transition-transform duration-300 ease-in-out outline-none ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'panel-title' : undefined}
        tabIndex={-1}
      >
        {layout === 'dual' ? (
          // Dual Panel Layout: Left content + Right content
          <div className="flex h-full">
            {/* Left Panel, used currently for invoice preview but can be used for other content */}
            <div className="w-1/2 bg-gray-50 border-r border-gray-200">
              {leftContent}
            </div>
            
            {/* Right Panel (Main Content) */}
            <div className="w-1/2 bg-white flex flex-col">
              {/* Header with title and close button */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                  {title && (
                    <h2 id="panel-title" className="text-lg font-semibold text-gray-900">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Close panel"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {rightContent}
              </div>
            </div>
          </div>
        ) : (
          // Single Panel Layout: Just main content
          <div className="h-full bg-white flex flex-col">
            {/* Header with title and close button */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                {title && (
                  <h2 id="panel-title" className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close panel"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {rightContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
