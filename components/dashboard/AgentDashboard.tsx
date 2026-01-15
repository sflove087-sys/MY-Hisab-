
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AddMoneyIcon, CashOutIcon, HistoryIcon, UserIcon } from '../Icons';
import { googleSheetService } from '../../services/googleSheetService';
import Input from '../common/Input';

const AgentDashboard: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { t, language } = useLanguage();
    const { designStyle } = useTheme();
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Balance Inquiry States
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [inquiryMobile, setInquiryMobile] = useState('');
    const [inquiryResult, setInquiryResult] = useState<{name: string, balance: number, mobile: string} | null>(null);
    const [isInquiryLoading, setIsInquiryLoading] = useState(false);
    const [inquiryError, setInquiryError] = useState('');

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshUser();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleBalanceInquiry = async () => {
        if (inquiryMobile.length !== 10) {
            setInquiryError(language === 'bn' ? 'সঠিক ১০ সংখ্যার নম্বর দিন' : 'Enter a valid 10-digit number');
            return;
        }

        setIsInquiryLoading(true);
        setInquiryError('');
        setInquiryResult(null);

        try {
            const result = await googleSheetService.getUserByMobile(`0${inquiryMobile}`, 'Personal');
            if (result && 'name' in result) {
                setInquiryResult({ 
                    name: result.name, 
                    balance: Number(result.balance),
                    mobile: result.mobile
                });
            } else {
                setInquiryError(language === 'bn' ? 'গ্রাহক খুঁজে পাওয়া যায়নি' : 'Customer not found');
            }
        } catch (err) {
            setInquiryError(language === 'bn' ? 'একটি ত্রুটি ঘটেছে' : 'An error occurred');
        } finally {
            setIsInquiryLoading(false);
        }
    };

    const closeInquiry = () => {
        setIsInquiryModalOpen(false);
        setInquiryResult(null);
        setInquiryMobile('');
        setInquiryError('');
    };

    const agentMenuItems = [
        { to: '/cash-in', labelKey: 'cashIn', icon: AddMoneyIcon, color: 'bg-emerald-500' },
        { to: '/agent-cash-out', labelKey: 'processCashOut', icon: CashOutIcon, color: 'bg-rose-500' },
        { to: '/history', labelKey: 'history', icon: HistoryIcon, color: 'bg-amber-500' },
        { onClick: () => setIsInquiryModalOpen(true), labelKey: 'balanceInquiry', icon: UserIcon, color: 'bg-indigo-500' },
    ];
    
    const ServiceButton: React.FC<{ to?: string; onClick?: () => void; label: string; icon: React.FC<{className?: string}>; color: string }> = ({ to, onClick, label, icon: Icon, color }) => {
      const content = (
          <div className="flex flex-col items-center justify-start text-center group w-full">
              <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 group-active:scale-95`}>
                  <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-black text-gray-800 dark:text-dark-text text-center leading-tight uppercase tracking-tight max-w-[80px]">
                  {label}
              </span>
          </div>
      );

      if (onClick) {
          return <button onClick={onClick} className="w-full flex justify-center">{content}</button>;
      }
      return <Link to={to || '#'} className="w-full flex justify-center">{content}</Link>;
    };

    return (
        <div className="animate-in fade-in duration-500 bg-white dark:bg-dark-bg min-h-screen">
            <div className="p-6 space-y-8">
                {/* Agent Premium Balance Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Amar Cash Business</p>
                                <h2 className="text-sm font-black uppercase tracking-widest">{language === 'bn' ? 'এজেন্ট ব্যালেন্স' : 'Agent Balance'}</h2>
                            </div>
                            <button 
                                onClick={handleRefresh}
                                className={`w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-white/10 ${isRefreshing ? 'animate-spin' : 'hover:bg-white/20'}`}
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex items-baseline space-x-1.5 mb-6">
                            <span className="text-2xl font-bold opacity-50">৳</span>
                            <span className="text-5xl font-black tracking-tighter">{(Number(user?.balance) || 0).toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{t('totalCommission')}</p>
                                <p className="text-lg font-black text-green-400">৳ {(Number(user?.commission) || 0).toLocaleString()}</p>
                            </div>
                            <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Active Status</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Grid */}
                <div className="bg-slate-50 dark:bg-dark-surface p-7 rounded-[3rem] border border-slate-100 dark:border-dark-border">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-dark-subtext pb-6 uppercase tracking-[0.3em] flex items-center px-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {language === 'bn' ? 'এজেন্ট সার্ভিস' : 'Agent Services'}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10">
                        {agentMenuItems.map((item, idx) => (
                           <ServiceButton 
                             key={idx} 
                             to={item.to} 
                             onClick={item.onClick}
                             label={t(item.labelKey as any)} 
                             icon={item.icon} 
                             color={item.color}
                           />
                        ))}
                    </div>
                </div>
            </div>

            {/* Balance Inquiry Modal */}
            {isInquiryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-800 dark:text-dark-text tracking-tight uppercase tracking-widest">{t('balanceInquiry')}</h2>
                            <button onClick={closeInquiry} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-text transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {!inquiryResult ? (
                            <div className="space-y-6">
                                <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">গ্রাহকের মোবাইল নম্বর দিন</p>
                                <Input 
                                    label={t('customerMobile')}
                                    id="inquiryMobile"
                                    type="tel"
                                    value={inquiryMobile}
                                    onChange={(e) => setInquiryMobile(e.target.value.replace(/[^0-9]/g, ''))}
                                    prefix="+880"
                                    maxLength={10}
                                    placeholder="1XXXXXXXXX"
                                    className="text-center font-bold text-lg"
                                />
                                {inquiryError && (
                                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl text-center">
                                        <p className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-widest">{inquiryError}</p>
                                    </div>
                                )}
                                <button 
                                    onClick={handleBalanceInquiry}
                                    disabled={isInquiryLoading || inquiryMobile.length < 10}
                                    className="w-full bg-primary text-white font-black h-14 rounded-3xl disabled:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    {isInquiryLoading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div> : null}
                                    <span className="text-[11px] uppercase tracking-widest">{language === 'bn' ? 'সার্চ করুন' : 'Search Now'}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-5 duration-300 space-y-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-primary/10">
                                        <span className="text-2xl font-black text-primary uppercase">{inquiryResult.name.charAt(0)}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-gray-800 dark:text-dark-text">{inquiryResult.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{inquiryResult.mobile}</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-dark-bg/50 p-6 rounded-[2.5rem] text-center border border-slate-100 dark:border-dark-border shadow-inner">
                                    <p className="text-[9px] text-gray-400 dark:text-dark-subtext font-black uppercase tracking-[0.4em] mb-3">{language === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</p>
                                    <div className="flex items-baseline justify-center space-x-1">
                                        <span className="text-xl font-bold text-primary">৳</span>
                                        <span className="text-4xl font-black text-primary tracking-tighter">{inquiryResult.balance.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={closeInquiry}
                                    className="w-full h-14 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-3xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                                >
                                    {language === 'bn' ? 'বন্ধ করুন' : 'Close Inquiry'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentDashboard;
