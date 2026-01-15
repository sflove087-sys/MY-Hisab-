
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  customGifUrl?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  label,
  customGifUrl = 'https://i.pinimg.com/originals/3d/80/64/3d8064758e54ae62940ba91a09d7c3d6.gif' // Professional sleek loader
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  };

  const textClasses = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Effect */}
        <div className={`absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse`}></div>
        
        {/* Custom GIF Loader */}
        <div className={`${sizeClasses[size]} relative z-10 overflow-hidden rounded-full mix-blend-multiply dark:mix-blend-normal`}>
          <img 
            src={customGifUrl} 
            alt="Loading..." 
            className="w-full h-full object-contain scale-125"
            onError={(e) => {
               // Fallback if GIF fails
               e.currentTarget.style.display = 'none';
               e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>';
            }}
          />
        </div>

        {/* Decorative Ring */}
        <div className={`absolute inset-0 border-2 border-primary/5 rounded-full scale-110`}></div>
      </div>
      
      {label && (
        <div className="mt-6 text-center">
          <p className={`${textClasses[size]} font-black text-primary/60 uppercase tracking-[0.3em] animate-pulse`}>
            {label}
          </p>
          <div className="mt-1 flex justify-center space-x-1">
             <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
             <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
             <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
