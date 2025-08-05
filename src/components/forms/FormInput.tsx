'use client';

interface FormInputProps {
  label: string;
  id: string;
  name?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  pattern?: string;
  title?: string;
}

export default function FormInput({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  pattern,
  title
}: FormInputProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 border rounded-lg bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          overflow-hidden text-ellipsis
          ${error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 hover:border-gray-400'
          }
          transition-colors duration-200
          ${className}
        `}
        pattern={pattern}
        title={title}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
