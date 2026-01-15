
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[250] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-dark-surface rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl transform transition-all duration-300 scale-100 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-gray-800 dark:text-dark-text mb-3 leading-tight">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-dark-subtext mb-8">{message}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onClose} 
            className="w-full py-4 text-gray-500 dark:text-dark-subtext font-bold text-sm uppercase tracking-widest bg-gray-100 dark:bg-dark-bg rounded-2xl hover:bg-gray-200 transition-colors"
          >
            {t('no')}
          </button>
          <button 
            onClick={onConfirm} 
            className="w-full py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            {t('yes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
