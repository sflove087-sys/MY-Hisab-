
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { googleSheetService } from '../services/googleSheetService';
import { Transaction, UserType } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from '../components/Icons';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TransactionItem: React.FC<{ transaction: Transaction, currentUserId: string, userType: UserType }> = ({ transaction, currentUserId, userType }) => {
  const isDebit = transaction.from === currentUserId;
  const { language } = useLanguage();

  const formattedDate = useMemo(() => new Date(transaction.date).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }), [transaction.date, language]);

  const otherParty = isDebit ? transaction.toName : transaction.fromName;

  return (
    <div className="flex items-center p-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm mb-3 border border-transparent hover:border-primary/20 transition-colors">
      <div className={`mr-4 p-3 rounded-full ${isDebit ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
        {isDebit ? <ArrowUpIcon className="w-6 h-6 text-red-500" /> : <ArrowDownIcon className="w-6 h-6 text-green-500" />}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800 dark:text-dark-text">{transaction.type}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext truncate max-w-[150px]">{otherParty}</p>
        <p className="text-[10px] text-gray-400 dark:text-dark-subtext mt-1">{formattedDate}</p>
      </div>
      <div className={`font-bold text-lg whitespace-nowrap ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
        {isDebit ? '-' : '+'}৳{transaction.amount.toLocaleString()}
      </div>
    </div>
  );
};


const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        setIsLoading(true);
        try {
            const userTransactions = await googleSheetService.getTransactionsForUser(user.id);
            setTransactions(userTransactions);
        } finally {
            setIsLoading(false);
        }
      }
    };
    fetchHistory();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 dark:text-dark-subtext font-medium animate-pulse">{t('loading')}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-dark-text">{t('transactionHistory')}</h1>
      <div className="pb-4">
        {transactions.length > 0 ? (
          transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} currentUserId={user!.id} userType={user!.type} />)
        ) : (
          <div className="text-center p-12 bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </div>
            <p className="text-gray-500 dark:text-dark-subtext font-medium">{t('noTransactions')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
