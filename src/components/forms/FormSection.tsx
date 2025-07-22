'use client';

import { useState } from 'react';

interface FormSectionProps {
  title?: string | null;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function FormSection({ 
  title, 
  children, 
  className = '', 
  collapsible = false,
  defaultExpanded = false 
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div 
          className={`flex items-center justify-between ${
            collapsible ? 'cursor-pointer' : ''
          }`}
          onClick={handleToggle}
        >
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {collapsible && (
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
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
          )}
        </div>
      )}
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
