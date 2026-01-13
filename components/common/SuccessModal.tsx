
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  amount?: number;
  recipient?: string;
  transactionId?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message, amount, recipient, transactionId }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
      <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl transform transition-all duration-500 scale-105">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-2">{title}</h2>
        
        {message && (
          <p className="text-gray-500 dark:text-dark-subtext text-sm mt-1 mb-4">{message}</p>
        )}

        {amount !== undefined && (
          <div className="mb-4">
            <p className="text-4xl font-black text-primary dark:text-primary-dark mt-4">৳{amount.toLocaleString()}</p>
            <p className="text-gray-500 dark:text-dark-subtext text-sm mt-1">{recipient}</p>
          </div>
        )}

        {transactionId && (
            <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 my-8">
                <p className="text-[10px] text-gray-400 dark:text-dark-subtext uppercase font-bold tracking-widest mb-1">Transaction ID</p>
                <p className="text-xs font-mono text-gray-600 dark:text-dark-text">{transactionId}</p>
            </div>
        )}

        <button 
          onClick={onClose} 
          className="w-full bg-primary hover:bg-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary/40 mt-4"
        >
          {t('submit')}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;