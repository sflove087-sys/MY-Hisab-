
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

  const currentTheme = themes[colorTheme] || themes['bkash'];

  useEffect(() => {
    const fetchRecent = async () => {
      if (user?.id) {
        setIsHistoryLoading(true);
        try {
          const txs = await googleSheetService.getTransactionsForUser(user.id);
          if (Array.isArray(txs)) {
            setRecentTransactions(txs.slice(0, 3)); // Show only top 3
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

  // Authentic bKash Icon URLs
  const services = [
    { to: '/send-money', label: language === 'bn' ? 'সেন্ড মানি' : 'Send Money', icon: 'https://cdn-icons-png.flaticon.com/512/639/639365.png' },
    { to: '#', label: language === 'bn' ? 'মোবাইল রিচার্জ' : 'Mobile Recharge', icon: 'https://cdn-icons-png.flaticon.com/512/3596/3596091.png' },
    { to: '/cash-out', label: language === 'bn' ? 'ক্যাশ আউট' : 'Cash Out', icon: 'https://cdn-icons-png.flaticon.com/512/4108/4108042.png' },
    { to: '/people', label: language === 'bn' ? 'মেক পেমেন্ট' : 'Make Payment', icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png' },
    { to: '#', label: language === 'bn' ? 'অ্যাড মানি' : 'Add Money', icon: 'https://cdn-icons-png.flaticon.com/512/2660/2660505.png' },
    { to: '#', label: language === 'bn' ? 'পে বিল' : 'Pay Bill', icon: 'https://cdn-icons-png.flaticon.com/512/2845/2845892.png' },
    { to: '#', label: language === 'bn' ? 'সেভিংস' : 'Savings', icon: 'https://cdn-icons-png.flaticon.com/512/2489/2489704.png' },
    { to: '#', label: language === 'bn' ? 'লোন' : 'Loan', icon: 'https://cdn-icons-png.flaticon.com/512/2953/2953423.png' },
  ];

  const suggestions = [
    { label: language === 'bn' ? 'বিটিসিএল' : 'BTCL', icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135679.png' },
    { label: language === 'bn' ? 'আকাশ ডিটিএইচ' : 'Akash DTH', icon: 'https://cdn-icons-png.flaticon.com/512/1071/1071243.png' },
    { label: language === 'bn' ? 'বিদ্যুৎ বিল' : 'Electricity', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png' },
    { label: language === 'bn' ? 'পানি বিল' : 'Water Bill', icon: 'https://cdn-icons-png.flaticon.com/512/427/427112.png' },
  ];

  return (
    <div className="bg-[#F1F2F3] dark:bg-dark-bg min-h-screen pb-24 font-sans transition-all duration-500">
      
      {/* Primary Services Grid Card */}
      <section className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border">
          <div className="grid grid-cols-4 gap-y-8 py-8 px-2">
              {services.map((service, idx) => (
                  <Link key={idx} to={service.to} className="flex flex-col items-center group">
                      <div className="w-11 h-11 bg-white dark:bg-dark-bg rounded-lg flex items-center justify-center p-1.5 mb-2 border border-gray-50 dark:border-dark-border shadow-sm group-active:scale-90 transition-all">
                          <img src={service.icon} alt={service.label} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-black text-gray-700 dark:text-dark-text text-center leading-tight max-w-[64px]">
                          {service.label}
                      </span>
                  </Link>
              ))}
          </div>
      </section>

      {/* Recent Transactions Section - Lenden History Summary */}
      <section className="mt-2 bg-white dark:bg-dark-surface border-y border-gray-100 dark:border-dark-border py-6">
          <div className="flex items-center justify-between px-6 mb-4">
              <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight">
                {language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
              </h3>
              <button onClick={() => navigate('/history')} className="text-[10px] font-black text-primary uppercase">
                {language === 'bn' ? 'সব দেখুন' : 'See All'}
              </button>
          </div>
          
          <div className="px-4 space-y-3">
              {isHistoryLoading ? (
                  <div className="h-20 flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
              ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => {
                      const isDebit = tx.from === user?.id;
                      return (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg/40 rounded-2xl border border-gray-100 dark:border-dark-border">
                              <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDebit ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                      {isDebit ? (
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                                      ) : (
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                                      )}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-tighter">{tx.type}</span>
                                      <span className="text-[9px] text-gray-400 font-bold truncate w-24">
                                          {isDebit ? tx.toName : tx.fromName}
                                      </span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`text-sm font-black ${isDebit ? 'text-red-500' : 'text-green-600'}`}>
                                      {isDebit ? '-' : '+'}৳{tx.amount.toLocaleString()}
                                  </span>
                                  <p className="text-[7px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">
                                      {new Date(tx.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' })}
                                  </p>
                              </div>
                          </div>
                      );
                  })
              ) : (
                  <p className="text-center text-[10px] text-gray-400 py-4 font-bold uppercase tracking-widest">লেনদেনের কোনো রেকর্ড নেই</p>
              )}
          </div>
      </section>

      {/* My bKash / Suggested Section */}
      <section className="mt-2 bg-white dark:bg-dark-surface border-y border-gray-100 dark:border-dark-border py-6">
          <div className="flex items-center justify-between px-6 mb-6">
              <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight">সাজেশন</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-y-8 px-2">
              {suggestions.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                      <div className="w-11 h-11 bg-slate-50 dark:bg-dark-bg rounded-lg flex items-center justify-center p-2 mb-2 border border-gray-100 dark:border-dark-border active:scale-90 transition-all">
                          <img src={item.icon} alt={item.label} className="w-full h-full object-contain opacity-70" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-dark-subtext text-center leading-tight">
                          {item.label}
                      </span>
                  </div>
              ))}
          </div>
      </section>

      {/* Promotional Banner */}
      <section className="mt-2 px-4">
          <div className="rounded-xl overflow-hidden shadow-md active:scale-[0.98] transition-all">
              <img 
                src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/5e0033104616611.5f67459f0f95b.jpg" 
                className="w-full h-auto" 
                alt="Banner" 
              />
          </div>
      </section>

      {/* Offers & Rewards Section */}
      <section className="mt-2 bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border p-6 pb-12">
          <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight mb-4">{language === 'bn' ? 'অফারসমূহ' : 'Latest Offers'}</h3>
          <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <img src="https://cdn-icons-png.flaticon.com/512/3596/3596091.png" className="w-8 h-8" alt="" />
                  </div>
                  <div>
                      <p className="text-xs font-black text-gray-800 dark:text-white">১০% ক্যাশব্যাক অফার!</p>
                      <p className="text-[10px] text-gray-500 dark:text-dark-subtext">যেকোনো রিচার্জে পাচ্ছেন ইনস্ট্যান্ট বোনাস।</p>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
};

export default PersonalDashboard;
