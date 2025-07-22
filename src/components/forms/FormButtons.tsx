'use client';

import Button from '../dashboard/Button';

interface FormButtonsProps {
  primaryButton: {
    label: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
    type?: 'button';
    disabled?: boolean;
  };
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export default function FormButtons({
  primaryButton,
  secondaryButton,
  align = 'left',
  className = ''
}: FormButtonsProps) {
  const alignmentClass = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center'
  }[align];

  return (
    <div className={`flex gap-3 pt-6 ${alignmentClass} ${className}`}>
      {secondaryButton && (
        <Button
          variant="secondary"
          size="md"
          type={secondaryButton.type || 'button'}
          onClick={secondaryButton.onClick}
          disabled={secondaryButton.disabled}
          className={secondaryButton ? 'flex-1' : ''}
        >
          {secondaryButton.label}
        </Button>
      )}
      <Button
        variant="primary"
        size="md"
        type={primaryButton.type || 'button'}
        onClick={primaryButton.onClick}
        disabled={primaryButton.disabled || primaryButton.loading}
        className={secondaryButton ? 'flex-1' : 'min-w-[120px]'}
      >
        {primaryButton.loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : (
          primaryButton.label
        )}
      </Button>
    </div>
  );
}
