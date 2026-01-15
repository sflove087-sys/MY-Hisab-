
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
    <button onClick={onClick} className="w-full text-left flex items-center p-4 bg-white dark:bg-dark-surface rounded-2xl mb-3 border border-slate-50 dark:border-dark-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
      <div className={`mr-4 p-3 rounded-2xl ${isDebit ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'} dark:bg-opacity-10`}>
        {isDebit ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
      </div>
      <div className="flex-grow">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-dark-text">{transaction.type}</p>
        <p className="text-[10px] text-slate-400 font-bold truncate max-w-[140px] mt-0.5">{otherParty}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-black whitespace-nowrap ${isDebit ? 'text-rose-500' : 'text-emerald-500'}`}>
          {isDebit ? '-' : '+'}৳{transaction.amount.toLocaleString()}
        </p>
        <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest mt-1">{formattedDate}</p>
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
            setTransactions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner label={language === 'bn' ? 'তথ্য লোড হচ্ছে' : 'Fetching Data'} />
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-slate-50 dark:bg-dark-bg min-h-screen pb-24">
      <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('transactionHistory')}</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Financial Records & Insights</p>
      </div>

      <div className="space-y-6">
        {user && monthOrder.length > 0 ? (
          monthOrder.map(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            const monthData = groupedTransactions[monthKey];
            const isExpanded = expandedMonths[monthKey];
            const monthName = new Date(year, month).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' });

            return (
              <div key={monthKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => toggleMonth(monthKey)} 
                  className={`w-full p-6 flex items-center justify-between bg-white dark:bg-dark-surface rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-border transition-all ${isExpanded ? 'rounded-b-none' : ''}`}
                >
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{monthName}</p>
                    <div className="flex items-center space-x-3 mt-1.5">
                       <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                          <span className="text-[8px] text-emerald-500 font-black tracking-widest uppercase">In: ৳{monthData.credit.toLocaleString()}</span>
                       </div>
                       <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                          <span className="text-[8px] text-rose-500 font-black tracking-widest uppercase">Out: ৳{monthData.debit.toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl bg-slate-50 dark:bg-dark-bg transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-4 pt-1 bg-white dark:bg-dark-surface rounded-b-[2rem] shadow-sm border-x border-b border-slate-100 dark:border-dark-border animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
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
          <div className="text-center p-12 bg-white dark:bg-dark-surface rounded-[3rem] shadow-premium border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('noTransactions')}</p>
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
