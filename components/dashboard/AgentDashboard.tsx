
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AddMoneyIcon, CashOutIcon, HistoryIcon } from '../Icons';

const AgentDashboard: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const { designStyle } = useTheme();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshUser();
        } finally {
            setIsRefreshing(false);
        }
    };

    const agentMenuItems = [
        { to: '/cash-in', labelKey: 'cashIn', icon: AddMoneyIcon },
        { to: '/agent-cash-out', labelKey: 'processCashOut', icon: CashOutIcon },
        { to: '/history', labelKey: 'history', icon: HistoryIcon },
    ];
    
    const getServiceButtonStyle = () => {
      switch(designStyle) {
          case 'oceanic': return 'w-16 h-16 rounded-full';
          case 'natural': return 'w-16 h-16 rounded-xl transform group-hover:rotate-3';
          case 'elegant': return 'w-16 h-16 rounded-lg border-2 border-primary/10';
          case 'vibrant': return 'w-16 h-16 rounded-2xl bg-primary/5 shadow-inner shadow-primary/20';
          default: return 'w-16 h-16 rounded-2xl';
      }
    }
    
    const ServiceButton: React.FC<{ to: string; label: string; icon: React.FC<{className?: string}>;}> = ({ to, label, icon: Icon }) => (
      <Link to={to} className="flex flex-col items-center justify-start text-center group">
          <div className={`bg-white dark:bg-dark-surface flex items-center justify-center mb-2 shadow-sm border border-gray-100 dark:border-dark-border group-active:scale-90 transition-all duration-200 ease-in-out group-hover:shadow-md group-hover:-translate-y-1 ${getServiceButtonStyle()}`}>
              <Icon className="w-8 h-8 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-gray-700 dark:text-dark-text text-center leading-tight max-w-[60px]">
              {label}
          </span>
      </Link>
    );

    return (
        <div className="animate-in fade-in duration-500 bg-gray-50 dark:bg-dark-bg min-h-screen">
            <div className="p-4 pt-6 space-y-6">
                <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-5 rounded-3xl flex justify-between items-center relative shadow-sm">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-sm font-bold text-gray-500 dark:text-dark-subtext">এজেন্ট ব্যালেন্স</h2>
                            <button 
                                onClick={handleRefresh}
                                className={`p-1.5 bg-primary/10 text-primary rounded-full transition-all active:scale-90 ${isRefreshing ? 'animate-spin' : 'hover:scale-110'}`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>
                        <p className="text-2xl font-black text-gray-800 dark:text-dark-text mt-1">৳ {(Number(user?.balance) || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xs font-bold text-green-500">{t('totalCommission')}</p>
                         <p className="text-lg font-bold text-green-500">৳ {(Number(user?.commission) || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface p-4 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-dark-text px-2 pb-4">এজেন্ট সার্ভিস</h3>
                    <div className="grid grid-cols-4 gap-y-6">
                        {agentMenuItems.map((item) => (
                           <ServiceButton key={item.labelKey} to={item.to} label={t(item.labelKey as any)} icon={item.icon} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
