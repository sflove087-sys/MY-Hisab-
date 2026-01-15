
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, className, isLoading, ...props }) => {
  const { t } = useLanguage();

  return (
    <button
      className={`w-full relative overflow-hidden bg-primary hover:bg-pink-700 dark:bg-primary-dark dark:hover:bg-pink-600 text-white font-black py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.97] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center min-h-[48px] shadow-lg shadow-primary/10 ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse tracking-widest text-[10px] uppercase font-black">{t('loading')}</span>
        </div>
      ) : (
        <span className="tracking-widest text-[11px] uppercase">{children}</span>
      )}
    </button>
  );
};

export default Button;
