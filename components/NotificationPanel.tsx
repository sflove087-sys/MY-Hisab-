
import React, { useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification, mockNotifications } from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { googleSheetService } from '../services/googleSheetService';
import { Transaction, TransactionStatus } from '../types';
import { Link } from 'react-router-dom';

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center";
  const iconClasses = "w-4 h-4 text-white";

  switch (type) {
    case 'offer':
      return <div className={`${baseClasses} bg-yellow-500`}><svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg></div>;
    case 'transaction':
      return <div className={`${baseClasses} bg-green-500`}><svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>;
    case 'security':
      return <div className={`${baseClasses} bg-red-500`}><svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>;
    case 'system':
      return <div className={`${baseClasses} bg-blue-500`}><svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>;
    default:
      return null;
  }
};

const NotificationPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications: staticNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [pendingTransactions, setPendingTransactions] = React.useState<Transaction[]>([]);
  const { user } = useAuth();
  const { t } = useLanguage();

  React.useEffect(() => {
    if (isOpen && user) {
      googleSheetService.getTransactionsForUser(user.id).then(txs => {
        const pending = txs.filter(tx => tx.status === TransactionStatus.PENDING && tx.from === user.id);
        setPendingTransactions(pending);
      });
    }
  }, [isOpen, user]);

  const allNotifications = useMemo(() => {
    // This could be improved to merge and sort, but for now we show pending at top.
    return staticNotifications;
  }, [staticNotifications]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-50 dark:bg-dark-bg shadow-2xl z-[120] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-dark-bg/80 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-gray-800 dark:text-dark-text">নোটিফিকেশন ({unreadCount + pendingTransactions.length})</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface">
              <svg className="w-5 h-5 text-gray-600 dark:text-dark-subtext" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {allNotifications.length === 0 && pendingTransactions.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-dark-surface rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <p className="font-semibold text-gray-600 dark:text-dark-subtext">কোনো নোটিফিকেশন নেই</p>
                <p className="text-sm text-gray-400">নতুন আপডেট আসলে এখানে দেখতে পাবেন।</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-2">
              {pendingTransactions.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">{t('pendingRequests')}</h3>
                  {pendingTransactions.map(tx => (
                    <Link to={`/approve-request/${tx.id}`} key={tx.id} onClick={onClose} className="block">
                      <div className="flex items-start p-3 mb-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 animate-pulse">
                        <div className="flex-shrink-0 mr-4 mt-1">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-500">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold text-sm text-yellow-800 dark:text-yellow-300">{t('cashOutRequest')}</p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-400">{tx.toName} আপনার কাছ থেকে ৳{tx.amount.toLocaleString()} ক্যাশ আউট করতে চায়।</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {allNotifications.map(n => (
                <div 
                  key={n.id} 
                  className={`flex items-start p-3 mb-2 rounded-lg transition-colors ${n.read ? 'bg-transparent' : 'bg-primary/5 dark:bg-primary/10'}`}
                  onClick={() => !n.read && markAsRead(n.id)}
                >
                  <div className="flex-shrink-0 mr-4 mt-1"><NotificationIcon type={n.type} /></div>
                  <div className="flex-grow">
                    <p className="font-bold text-sm text-gray-800 dark:text-dark-text">{n.title}</p>
                    <p className="text-xs text-gray-600 dark:text-dark-subtext">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.date).toLocaleString('bn-BD', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-primary rounded-full ml-3 mt-1 flex-shrink-0"></div>}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {allNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button 
                onClick={markAllAsRead} 
                disabled={unreadCount === 0}
                className="w-full text-center py-3 text-sm font-bold text-primary dark:text-primary rounded-lg hover:bg-primary/10 disabled:text-gray-400 disabled:hover:bg-transparent"
              >
                সবগুলো পড়া হয়েছে হিসেবে চিহ্নিত করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;