'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => {
    const baseClasses = 'btn-base inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Minimum width ensures consistent button sizes
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-w-[80px]',
      md: 'px-6 py-2 text-sm min-w-[100px]',
      lg: 'px-8 py-3 text-base min-w-[120px]'
    };

    const variantClasses = {
      primary: 'btn-primary focus:ring-primary-500',
      secondary: 'btn-secondary focus:ring-primary-500',
      outline: 'border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500',
      ghost: 'text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500'
    };

    const combinedClassName = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim();

    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
