'use client';

interface CurrencyOption {
  symbol: string;
  name: string;
  flag?: string; // Emoji flag or icon
  isEnabled?: boolean;
}

interface CurrencySelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: CurrencyOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function CurrencySelect({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select',
  required = false,
  disabled = false,
  error,
  className = ''
}: CurrencySelectProps) {
  const selectedOption = options.find(option => option.symbol === value);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 border rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
            transition-colors duration-200
            appearance-none bg-no-repeat bg-right pr-10
            bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")]
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option 
              key={option.symbol} 
              value={option.symbol}
              disabled={option.isEnabled === false}
            >
              {option.flag ? `${option.flag} ${option.symbol}` : option.symbol}
            </option>
          ))}
        </select>
        
        {/* Display flag icon for selected option */}
        {selectedOption?.flag && value && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-lg">{selectedOption.flag}</span>
          </div>
        )}
        
        {/* Adjust padding when flag is shown */}
        {selectedOption?.flag && value && (
          <style jsx>{`
            select {
              padding-left: 2.5rem !important;
            }
          `}</style>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
