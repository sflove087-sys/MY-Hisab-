
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefixIcon?: React.ReactNode;
  variant?: 'standard' | 'underline';
}

const Input: React.FC<InputProps> = ({ label, id, prefixIcon, variant = 'standard', className, ...props }) => {
  if (variant === 'underline') {
    return (
      <div className="mb-8 group">
        {label && (
          <label htmlFor={id} className="block text-slate-400 dark:text-dark-subtext text-[10px] font-black mb-2 uppercase tracking-[0.3em] text-left">
            {label}
          </label>
        )}
        <div className="relative flex items-center border-b-2 border-slate-100 dark:border-dark-border group-focus-within:border-primary transition-all duration-500 py-3">
          {prefixIcon && (
            <span className="mr-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
              {prefixIcon}
            </span>
          )}
          <input
            id={id}
            className={`appearance-none bg-transparent w-full text-slate-800 dark:text-dark-text leading-tight focus:outline-none font-extrabold text-xl placeholder-slate-200 dark:placeholder-slate-700 ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 group">
      {label && (
        <label htmlFor={id} className="block text-slate-400 dark:text-dark-subtext text-[9px] font-black mb-3 uppercase tracking-[0.4em] text-center opacity-70">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="absolute left-6 text-primary opacity-60">
            {prefixIcon}
          </span>
        )}
        <input
          id={id}
          className={`appearance-none border-2 border-slate-50 dark:border-dark-border rounded-[1.5rem] w-full py-5 text-slate-900 dark:text-dark-text bg-slate-50/50 dark:bg-dark-surface/40 leading-tight focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-dark-surface transition-all duration-300 placeholder-slate-300 dark:placeholder-slate-700 font-extrabold text-center text-lg ${prefixIcon ? 'pl-14' : 'px-6'} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
