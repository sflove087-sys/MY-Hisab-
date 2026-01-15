
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
}

const Input: React.FC<InputProps> = ({ label, id, prefix, className, ...props }) => {
  return (
    <div className="mb-5 group">
      <label htmlFor={id} className="block text-gray-500 dark:text-dark-subtext text-[8px] font-bold mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary text-center">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-0 pl-5 text-gray-400 dark:text-dark-subtext font-semibold pointer-events-none text-[10px]">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={`appearance-none border-2 border-gray-50 dark:border-gray-800 rounded-2xl w-full py-4 pr-5 text-gray-800 dark:text-dark-text bg-gray-50 dark:bg-dark-surface leading-tight focus:outline-none focus:border-primary/50 dark:focus:border-primary-dark/50 focus:bg-white dark:focus:bg-dark-surface transition-all placeholder-gray-300 dark:placeholder-gray-600 font-medium ${prefix ? 'pl-16' : 'px-5'} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
