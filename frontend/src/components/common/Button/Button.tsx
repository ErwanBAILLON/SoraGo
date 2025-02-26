import React from 'react';
import { IButtonProps } from './types';

export const Button: React.FC<IButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  fullWidth = false,
  onClick,
  ...props 
}) => {
  // Define variant classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-blue-600',
    secondary: 'bg-gray-100 text-contrast hover:bg-gray-200',
    accent: 'bg-accent text-white hover:bg-amber-600',
    outline: 'bg-transparent border border-current text-white hover:bg-white hover:bg-opacity-10',
  };

  // Define size classes
  const sizeClasses = {
    small: 'py-1.5 px-3 text-sm',
    medium: 'py-2.5 px-5',
    large: 'py-3 px-8 text-lg',
  };
  
  const baseClasses = 'font-medium transition-all duration-300';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
