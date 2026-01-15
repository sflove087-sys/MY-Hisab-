
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefixIcon?: React.ReactNode;
  variant?: 'standard' | 'underline';
}

const Input: React.FC<InputProps> = ({ label, id, prefixIcon, variant = 'standard', className, ...props }) => {
  if (variant === 'underline') {
    return (
      <div className="mb-6 group">
        {label && (
          <label htmlFor={id} className="block text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-widest text-left">
            {label}
          </label>
        )}
        <div className="relative flex items-center border-b border-slate-300 group-focus-within:border-primary transition-all duration-300 py-2">
          {prefixIcon && (
            <span className="mr-3 text-primary opacity-70 group-focus-within:opacity-100 transition-opacity">
              {prefixIcon}
            </span>
          )}
          <input
            id={id}
            className={`appearance-none bg-transparent w-full text-slate-700 leading-tight focus:outline-none font-medium text-lg placeholder-slate-300 ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 group">
      {label && (
        <label htmlFor={id} className="block text-slate-400 text-[9px] font-black mb-2 uppercase tracking-[0.2em] text-center">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="absolute left-4 text-primary">
            {prefixIcon}
          </span>
        )}
        <input
          id={id}
          className={`appearance-none border border-slate-100 dark:border-dark-border rounded-2xl w-full py-4 text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface/50 leading-tight focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-dark-surface transition-all placeholder-slate-300 dark:placeholder-slate-600 font-bold text-center text-base ${prefixIcon ? 'pl-12' : 'px-4'} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
