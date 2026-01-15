
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AddMoneyIcon, CashOutIcon, HistoryIcon, UserIcon, ChevronLeftIcon } from '../Icons';
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
    
    const ServiceButton: React.FC<{ to?: string; onClick?: () => void; label: string; icon: React.FC<{className?: string}>;}> = ({ to, onClick, label, icon: Icon }) => {
      const content = (
          <div className="flex flex-col items-center justify-start text-center group w-full">
              <div className={`bg-white dark:bg-dark-surface flex items-center justify-center mb-2 shadow-sm border border-gray-100 dark:border-dark-border group-active:scale-90 transition-all duration-200 ease-in-out group-hover:shadow-md group-hover:-translate-y-1 ${getServiceButtonStyle()}`}>
                  <Icon className="w-8 h-8 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 dark:text-dark-text text-center leading-tight max-w-[60px]">
                  {label}
              </span>
          </div>
      );

      if (onClick) {
          return <button onClick={onClick} className="w-full">{content}</button>;
      }
      return <Link to={to || '#'} className="w-full">{content}</Link>;
    };

    return (
        <div className="animate-in fade-in duration-500 bg-gray-50 dark:bg-dark-bg min-h-screen">
            <div className="p-4 pt-6 space-y-6">
                <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-5 rounded-3xl flex justify-between items-center relative shadow-sm overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-sm font-bold text-gray-500 dark:text-dark-subtext uppercase tracking-widest">{language === 'bn' ? 'এজেন্ট ব্যালেন্স' : 'Agent Balance'}</h2>
                            <button 
                                onClick={handleRefresh}
                                className={`p-1.5 bg-primary/10 text-primary rounded-full transition-all active:scale-90 ${isRefreshing ? 'animate-spin' : 'hover:scale-110'}`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>
                        <p className="text-3xl font-black text-gray-800 dark:text-dark-text mt-1">৳ {(Number(user?.balance) || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right relative z-10">
                         <p className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">{t('totalCommission')}</p>
                         <p className="text-lg font-black text-green-500">৳ {(Number(user?.commission) || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
                    <h3 className="text-sm font-black text-gray-800 dark:text-dark-text px-2 pb-4 uppercase tracking-widest flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {language === 'bn' ? 'এজেন্ট সার্ভিস' : 'Agent Services'}
                    </h3>
                    <div className="grid grid-cols-4 gap-y-6">
                        {agentMenuItems.map((item) => (
                           <ServiceButton key={item.labelKey} to={item.to} label={t(item.labelKey as any)} icon={item.icon} />
                        ))}
                        <ServiceButton 
                            onClick={() => setIsInquiryModalOpen(true)} 
                            label={t('balanceInquiry')} 
                            icon={UserIcon} 
                        />
                    </div>
                </div>
            </div>

            {/* Balance Inquiry Modal */}
            {isInquiryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                        
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-800 dark:text-dark-text tracking-tight">{t('balanceInquiry')}</h2>
                            <button onClick={closeInquiry} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-text transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {!inquiryResult ? (
                            <div className="space-y-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-500 dark:text-dark-subtext">গ্রাহকের অ্যাকাউন্টের বর্তমান ব্যালেন্স চেক করতে মোবাইল নম্বর দিন</p>
                                </div>
                                <Input 
                                    label={t('customerMobile')}
                                    id="inquiryMobile"
                                    type="tel"
                                    value={inquiryMobile}
                                    onChange={(e) => setInquiryMobile(e.target.value.replace(/[^0-9]/g, ''))}
                                    prefix="+880"
                                    maxLength={10}
                                    placeholder="1XXXXXXXXX"
                                    className="text-lg font-bold"
                                />
                                {inquiryError && (
                                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <p className="text-[11px] text-red-600 dark:text-red-400 font-bold">{inquiryError}</p>
                                    </div>
                                )}
                                <button 
                                    onClick={handleBalanceInquiry}
                                    disabled={isInquiryLoading || inquiryMobile.length < 10}
                                    className="w-full bg-primary text-white font-black py-4 rounded-2xl disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    {isInquiryLoading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div> : null}
                                    {language === 'bn' ? 'তথ্য অনুসন্ধান করুন' : 'Search Now'}
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-5 duration-300 space-y-6">
                                <div className="bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border rounded-3xl p-6 relative">
                                    {/* Success Watermark/Icon */}
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-dark-surface">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    </div>

                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                            <span className="text-xl font-black text-primary uppercase">{inquiryResult.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 dark:text-dark-subtext uppercase tracking-widest">{language === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}</p>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text leading-tight">{inquiryResult.name}</h3>
                                            <p className="text-xs font-bold text-gray-500 mt-0.5">{inquiryResult.mobile}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-inner-sm text-center">
                                        <p className="text-[10px] text-gray-400 dark:text-dark-subtext font-black uppercase tracking-[0.2em] mb-2">{language === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</p>
                                        <div className="flex items-baseline justify-center space-x-1">
                                            <span className="text-xl font-bold text-primary">৳</span>
                                            <span className="text-4xl font-black text-primary tracking-tighter">{inquiryResult.balance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => { setInquiryResult(null); setInquiryMobile(''); }}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-text font-black text-sm rounded-2xl transition-all active:scale-95"
                                    >
                                        {language === 'bn' ? 'আবার করুন' : 'Try Again'}
                                    </button>
                                    <button 
                                        onClick={closeInquiry}
                                        className="flex-[2] py-4 bg-primary text-white font-black text-sm rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentDashboard;
