'use client';

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
  className?: string;
}

export default function FormButtons({
  primaryButton,
  secondaryButton,
  className = ''
}: FormButtonsProps) {
  return (
    <div className={`flex gap-3 pt-6 ${className}`}>
      {secondaryButton && (
        <button
          type={secondaryButton.type || 'button'}
          onClick={secondaryButton.onClick}
          disabled={secondaryButton.disabled}
          className="
            flex-1 px-4 py-2.5 border border-gray-300 rounded-lg
            text-gray-700 font-medium bg-white
            hover:bg-gray-50 hover:border-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {secondaryButton.label}
        </button>
      )}
      <button
        type={primaryButton.type || 'button'}
        onClick={primaryButton.onClick}
        disabled={primaryButton.disabled || primaryButton.loading}
        className={`
          px-4 py-2.5 rounded-lg font-medium text-white
          bg-blue-600 hover:bg-blue-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${secondaryButton ? 'flex-1' : 'min-w-[120px]'}
        `}
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
      </button>
    </div>
  );
}
