
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { googleSheetService } from '../services/googleSheetService';
import { Transaction, UserType } from '../types';
import { ArrowUpIcon, ArrowDownIcon, ChevronDownIcon } from '../components/Icons';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TransactionDetailModal from '../components/common/TransactionDetailModal';

const TransactionItem: React.FC<{ transaction: Transaction, currentUserId: string, userType: UserType, onClick: () => void }> = ({ transaction, currentUserId, userType, onClick }) => {
  const isDebit = transaction.from === currentUserId;
  const { language } = useLanguage();

  const formattedDate = useMemo(() => new Date(transaction.date).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }), [transaction.date, language]);

  const otherParty = isDebit ? transaction.toName : transaction.fromName;

  return (
    <button onClick={onClick} className="w-full text-left flex items-center p-3 bg-white dark:bg-dark-surface rounded-lg mb-2 border border-transparent hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50">
      <div className={`mr-3 p-2.5 rounded-full ${isDebit ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
        {isDebit ? <ArrowUpIcon className="w-5 h-5 text-red-500" /> : <ArrowDownIcon className="w-5 h-5 text-green-500" />}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-sm text-gray-800 dark:text-dark-text">{transaction.type}</p>
        <p className="text-xs text-gray-500 dark:text-dark-subtext truncate max-w-[150px]">{otherParty}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold text-base whitespace-nowrap ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
          {isDebit ? '-' : '+'}৳{transaction.amount.toLocaleString()}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-dark-subtext mt-1">{formattedDate}</p>
      </div>
    </button>
  );
};

const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userTransactions = await googleSheetService.getTransactionsForUser(user.id);
          if (Array.isArray(userTransactions)) {
            setTransactions(userTransactions);
            if (userTransactions.length > 0) {
              const latestTx = userTransactions[0];
              const date = new Date(latestTx.date);
              const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
              setExpandedMonths({ [monthKey]: true });
            }
          } else {
             setTransactions([]);
          }
        } catch(error) {
            console.error("Failed to fetch transactions:", error);
            setTransactions([]); // Clear transactions on error
        } finally {
          setIsLoading(false);
        }
      } else {
        // If user logs out, clear the state
        setTransactions([]);
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const { groupedTransactions, monthOrder } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
        return { groupedTransactions: {}, monthOrder: [] };
    }
    const groups: Record<string, { transactions: Transaction[], credit: number, debit: number }> = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = { transactions: [], credit: 0, debit: 0 };
      }
      
      groups[monthKey].transactions.push(tx);
      if (tx.from === user?.id) {
        groups[monthKey].debit += tx.amount;
      } else {
        groups[monthKey].credit += tx.amount;
      }
    });

    const sortedMonthKeys = Object.keys(groups).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
    
    return { groupedTransactions: groups, monthOrder: sortedMonthKeys };
  }, [transactions, user]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

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
      <div className="space-y-4">
        {user && monthOrder.length > 0 ? (
          monthOrder.map(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            const monthData = groupedTransactions[monthKey];
            const isExpanded = expandedMonths[monthKey];
            const monthName = new Date(year, month).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' });

            return (
              <div key={monthKey} className="bg-white dark:bg-dark-surface/50 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border/50">
                <button onClick={() => toggleMonth(monthKey)} className="w-full p-4 flex items-center justify-between focus:outline-none">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-dark-text text-left">{monthName}</p>
                    <div className="flex items-center space-x-4 text-[10px] mt-1">
                       <p className="text-green-500 font-semibold">এসেছে: ৳{monthData.credit.toLocaleString()}</p>
                       <p className="text-red-500 font-semibold">গিয়েছে: ৳{monthData.debit.toLocaleString()}</p>
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="px-3 pb-2 animate-in fade-in duration-300">
                    <div className="border-t border-gray-100 dark:border-dark-border pt-2">
                        {monthData.transactions.map(tx => (
                            <TransactionItem 
                                key={tx.id} 
                                transaction={tx} 
                                currentUserId={user.id} 
                                userType={user.type} 
                                onClick={() => setSelectedTransaction(tx)}
                            />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center p-12 bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </div>
            <p className="text-gray-500 dark:text-dark-subtext font-medium">{t('noTransactions')}</p>
          </div>
        )}
      </div>
      {user && (
        <TransactionDetailModal 
            isOpen={!!selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            transaction={selectedTransaction}
            currentUserId={user.id}
        />
      )}
    </div>
  );
};

export default TransactionHistoryPage;
