'use client';

interface NetworkOption {
  id: string;
  name: string;
  chainId: number;
  icon?: React.ReactNode;
}

interface NetworkSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: NetworkOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function NetworkSelect({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select',
  required = false,
  error,
  className = ''
}: NetworkSelectProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-3 py-2.5 border rounded-lg bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
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
            key={option.id} 
            value={option.id}
          >
            {option.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
