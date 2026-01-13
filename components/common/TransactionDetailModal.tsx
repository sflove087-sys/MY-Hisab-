
import React, { useMemo } from 'react';
import { Transaction } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowUpIcon, ArrowDownIcon } from '../Icons';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currentUserId: string;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, transaction, currentUserId }) => {
  const { t, language } = useLanguage();

  if (!isOpen || !transaction) return null;

  const isDebit = transaction.from === currentUserId;

  const formattedDate = useMemo(() => new Date(transaction.date).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }), [transaction.date, language]);

  const statusColor: { [key: string]: string } = {
    'Success': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end z-[100] animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-gray-50 dark:bg-dark-surface rounded-t-3xl w-full max-w-md mx-auto shadow-2xl p-6 pt-4 animate-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        
        <div className="flex flex-col items-center pt-6 pb-4">
            <div className={`p-4 rounded-full mb-4 ${isDebit ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                {isDebit ? <ArrowUpIcon className="w-8 h-8 text-red-500" /> : <ArrowDownIcon className="w-8 h-8 text-green-500" />}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">{t('transactionDetails')}</h2>
            <p className="text-sm text-gray-500 dark:text-dark-subtext">{transaction.type}</p>
            <p className={`font-bold text-3xl mt-2 ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
                {isDebit ? '-' : '+'}৳{transaction.amount.toLocaleString()}
            </p>
        </div>

        <div className="space-y-3">
             <div className="bg-white dark:bg-dark-bg/50 p-4 rounded-xl">
                 <div className="flex items-center justify-between pb-2">
                     <p className="text-xs font-bold text-gray-400 uppercase">{t('from')}</p>
                     <p className="font-semibold text-right text-gray-800 dark:text-dark-text">{transaction.fromName}</p>
                 </div>
                 <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
                     <p className="text-xs font-bold text-gray-400 uppercase">{t('to')}</p>
                     <p className="font-semibold text-right text-gray-800 dark:text-dark-text">{transaction.toName}</p>
                 </div>
             </div>
             <div className="bg-white dark:bg-dark-bg/50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-dark-subtext">{t('status')}</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${statusColor[transaction.status]}`}>{transaction.status}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-dark-subtext">{t('date')}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-dark-text text-right">{formattedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-dark-subtext">{t('transactionID')}</span>
                    <span className="text-sm font-mono text-gray-500 dark:text-dark-subtext">{String(transaction.id || '').substring(4)}</span>
                </div>
             </div>
        </div>
        
        <button onClick={onClose} className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform">বন্ধ করুন</button>
      </div>
    </div>
  );
};

export default TransactionDetailModal;