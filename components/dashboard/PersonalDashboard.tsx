
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SendMoneyIcon, CashOutIcon, MobileRechargeIcon, BillIcon, AddMoneyIcon } from '../Icons';

const PersonalDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { designStyle } = useTheme();

  const services = [
    { to: '/send-money', labelKey: 'sendMoney', icon: SendMoneyIcon },
    { to: '/cash-out', labelKey: 'cashOut', icon: CashOutIcon },
    { to: '#', labelKey: 'mobileRecharge', icon: MobileRechargeIcon },
    { to: '#', labelKey: 'addMoney', icon: AddMoneyIcon },
    { to: '#', labelKey: 'payment', icon: BillIcon },
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
        {/* Main Services Section */}
        <div className="bg-white dark:bg-dark-surface p-4 rounded-3xl shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 dark:text-dark-text px-2 pb-4">সার্ভিস সমূহ</h3>
            <div className="grid grid-cols-4 gap-y-6">
                {services.map((item) => (
                    <ServiceButton key={item.labelKey} to={item.to} label={t(item.labelKey as any)} icon={item.icon} />
                ))}
            </div>
        </div>

        {/* Promotions Section */}
        <div className="space-y-3">
             <h3 className="text-sm font-bold text-gray-800 dark:text-dark-text px-2">আপনার জন্য</h3>
             <div className="relative flex items-center space-x-3 overflow-x-auto pb-3 snap-x snap-mandatory">
                <div className="snap-center shrink-0 w-10/12">
                    <div className="h-28 bg-gradient-to-br from-primary to-orange-400 rounded-2xl shadow-lg p-4 flex flex-col justify-end text-white">
                        <p className="font-bold text-lg">১০% ক্যাশব্যাক</p>
                        <p className="text-xs opacity-80">যেকোনো মোবাইল রিচার্জে!</p>
                    </div>
                </div>
                <div className="snap-center shrink-0 w-10/12">
                    <div className="h-28 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl shadow-lg p-4 flex flex-col justify-end text-white">
                        <p className="font-bold text-lg">বিল পেমেন্ট উৎসব</p>
                        <p className="text-xs opacity-80">কোনো চার্জ ছাড়াই বিল দিন।</p>
                    </div>
                </div>
                <div className="snap-center shrink-0 w-10/12">
                    <div className="h-28 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-2xl shadow-lg p-4 flex flex-col justify-end text-white">
                        <p className="font-bold text-lg">নতুন অফার</p>
                        <p className="text-xs opacity-80">скоро আসছে...</p>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
