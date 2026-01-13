
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
      
      {label && (
        <p className={`mt-6 text-sm font-black uppercase tracking-[0.2em] animate-pulse ${color}`}>
          {label}
        </p>
      )}
      
      <div className="mt-6 w-32 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary via-pink-400 to-primary animate-progress-slide"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-slide {
          animation: progress-slide 1.5s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default LoadingSpinner;
