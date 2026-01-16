
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '../../utils/themes';
import { googleSheetService } from '../../services/googleSheetService';
import { Transaction } from '../../types';

const PersonalDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { colorTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      if (user?.id) {
        setIsHistoryLoading(true);
        try {
          const txs = await googleSheetService.getTransactionsForUser(user.id);
          if (Array.isArray(txs)) {
            setRecentTransactions(txs.slice(0, 3));
          }
        } catch (e) {
          console.error("Failed to fetch recent txs", e);
        } finally {
          setIsHistoryLoading(false);
        }
      }
    };
    fetchRecent();
  }, [user]);

  const services = [
    { to: '/send-money', label: language === 'bn' ? 'সেন্ড মানি' : 'Send Money', icon: 'https://cdn-icons-png.flaticon.com/512/639/639365.png', color: 'bg-indigo-50' },
    { to: '#', label: language === 'bn' ? 'মোবাইল রিচার্জ' : 'Mobile Recharge', icon: 'https://cdn-icons-png.flaticon.com/512/3596/3596091.png', color: 'bg-emerald-50' },
    { to: '/cash-out', label: language === 'bn' ? 'ক্যাশ আউট' : 'Cash Out', icon: 'https://cdn-icons-png.flaticon.com/512/4108/4108042.png', color: 'bg-rose-50' },
    { to: '#', label: language === 'bn' ? 'পেমেন্ট' : 'Payment', icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png', color: 'bg-amber-50' },
    { to: '#', label: language === 'bn' ? 'অ্যাড মানি' : 'Add Money', icon: 'https://cdn-icons-png.flaticon.com/512/2660/2660505.png', color: 'bg-blue-50' },
    { to: '#', label: language === 'bn' ? 'পে বিল' : 'Pay Bill', icon: 'https://cdn-icons-png.flaticon.com/512/2845/2845892.png', color: 'bg-violet-50' },
    { to: '#', label: language === 'bn' ? 'সেভিংস' : 'Savings', icon: 'https://cdn-icons-png.flaticon.com/512/2489/2489704.png', color: 'bg-sky-50' },
    { to: '#', label: language === 'bn' ? 'লোন' : 'Loan', icon: 'https://cdn-icons-png.flaticon.com/512/2953/2953423.png', color: 'bg-teal-50' },
  ];

  return (
    <div className="bg-slate-50 dark:bg-dark-bg min-h-screen pb-32 animate-in fade-in duration-500">
      
      {/* Quick Access Services Section */}
      <section className="px-6 py-8">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-[2.5rem] shadow-premium border border-slate-100 dark:border-dark-border">
              <div className="flex items-center justify-between mb-8 px-2">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-dark-subtext uppercase tracking-[0.3em]">{language === 'bn' ? 'সার্ভিসসমূহ' : 'MY SERVICES'}</h3>
                  <div className="w-8 h-1 bg-slate-100 dark:bg-dark-border rounded-full"></div>
              </div>
              <div className="grid grid-cols-4 gap-y-8">
                  {services.map((service, idx) => (
                      <Link key={idx} to={service.to} className="flex flex-col items-center group">
                          <div className={`w-14 h-14 ${service.color} dark:bg-dark-bg/50 rounded-[1.25rem] flex items-center justify-center p-3.5 mb-2.5 transition-all duration-300 group-hover:scale-105 group-active:scale-95 group-hover:shadow-md border border-white dark:border-dark-border`}>
                              <img src={service.icon} alt={service.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-dark-text text-center leading-tight tracking-tight max-w-[64px]">
                              {service.label}
                          </span>
                      </Link>
                  ))}
              </div>
          </div>
      </section>

      {/* Modern Transaction Log Summary */}
      <section className="px-6">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-[2.5rem] shadow-premium border border-slate-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-dark-subtext uppercase tracking-[0.3em]">
                  {language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'RECENT LOG'}
                </h3>
                <button onClick={() => navigate('/history')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
                  {language === 'bn' ? 'সব দেখুন' : 'SEE ALL'}
                </button>
            </div>
            
            <div className="space-y-3">
                {isHistoryLoading ? (
                    <div className="h-32 flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => {
                        const isDebit = tx.from === user?.id;
                        return (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-bg/30 rounded-[1.5rem] border border-slate-50 dark:border-dark-border transition-transform active:scale-[0.98]">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-11 h-11 rounded-[1.1rem] flex items-center justify-center shadow-sm ${isDebit ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {isDebit ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{tx.type}</span>
                                        <span className="text-[9px] text-slate-400 font-extrabold truncate w-28 uppercase">
                                            {isDebit ? tx.toName : tx.fromName}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black tracking-tighter ${isDebit ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {isDebit ? '-' : '+'}৳{tx.amount.toLocaleString()}
                                    </span>
                                    <p className="text-[8px] font-black text-slate-300 dark:text-dark-subtext uppercase tracking-widest mt-1">
                                        {new Date(tx.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-8 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-dark-bg/50 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">লেনদেনের কোনো রেকর্ড নেই</p>
                    </div>
                )}
            </div>
          </div>
      </section>

      {/* Promotional Experience Banner */}
      <section className="mt-8 px-6">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 active:scale-[0.98] transition-all relative group">
              <img 
                src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/5e0033104616611.5f67459f0f95b.jpg" 
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" 
                alt="Banner" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
      </section>
    </div>
  );
};

export default PersonalDashboard;
