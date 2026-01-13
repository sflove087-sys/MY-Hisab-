
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '../Icons';

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center p-4 mb-2">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-dark-border active:scale-90 transition-transform"
        aria-label="Go back"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-dark-subtext" />
      </button>
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-800 dark:text-dark-text">{title}</h1>
      </div>
    </div>
  );
};

export default PageHeader;
