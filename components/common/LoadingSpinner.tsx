
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-primary dark:text-primary-dark',
  label
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-16 w-16 border-4',
    lg: 'h-24 w-24 border-[6px]',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Outer Pulsing Ring */}
        <div className={`absolute inset-0 rounded-full ${color} opacity-20 animate-ping`}></div>
        
        {/* Main Spinner */}
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-t-transparent ${color} border-current shadow-lg`}></div>
        
        {/* Inner Static Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${color} opacity-50`}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
