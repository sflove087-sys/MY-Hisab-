
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/themes';

const Header: React.FC<{ onNotificationClick: () => void }> = ({ onNotificationClick }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { unreadCount } = useNotifications();
  const { colorTheme } = useTheme();
  const [showBalance, setShowBalance] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const currentTheme = themes[colorTheme] || themes['bkash'];

  const toggleBalance = () => {
    if (showBalance) return;
    setIsSliding(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    
    setTimeout(() => {
      setShowBalance(true);
      setIsSliding(false);
    }, 500);

    setTimeout(() => {
      setShowBalance(false);
    }, 4500);
  };

  return (
    <header className="bg-primary/95 backdrop-blur-md pt-14 pb-6 px-6 relative overflow-hidden shadow-lg z-40 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div className="relative z-10 space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-white/20 p-1 rounded-2xl flex items-center justify-center border border-white/30 overflow-hidden shadow-inner">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" className="w-full h-full object-cover rounded-xl" />
             </div>
             <div className="flex flex-col">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">{language === 'bn' ? 'স্বাগতম' : 'WELCOME'}</span>
                <span className="text-white text-lg font-extrabold tracking-tight mt-1">{user?.name}</span>
             </div>
          </div>

          <div className="flex items-center space-x-3">
             <button 
               onClick={onNotificationClick} 
               className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center relative hover:bg-white/20 transition-all active:scale-90 border border-white/10"
             >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-white text-primary min-w-[18px] h-[18px] rounded-full text-[9px] font-black flex items-center justify-center border-2 border-primary px-1">
                    {unreadCount}
                  </div>
                )}
             </button>
          </div>
        </div>

        <div className="flex justify-start">
           <button 
             onClick={toggleBalance}
             className={`h-11 rounded-2xl bg-white relative transition-all duration-500 ease-out overflow-hidden flex items-center shadow-xl shadow-black/10 ${showBalance ? 'w-56' : 'w-48'}`}
           >
              <div 
                className={`absolute inset-0 bg-primary/5 transition-transform duration-700 ease-out origin-left ${isSliding ? 'scale-x-100' : 'scale-x-0'}`}
              ></div>

              {!showBalance ? (
                <div className="flex items-center px-4 space-x-3 w-full animate-in fade-in duration-300">
                   <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shadow-md">৳</div>
                   <span className="text-primary font-extrabold text-[12px] uppercase tracking-tighter">
                      {language === 'bn' ? 'ব্যালেন্স দেখুন' : 'Check Balance'}
                   </span>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full animate-in slide-in-from-left-4 duration-500">
                   <span className="text-primary font-extrabold text-xl tracking-tighter">
                      <span className="text-sm mr-2 opacity-50 font-black">৳</span>
                      {(Number(user?.balance) || 0).toLocaleString()}
                   </span>
                </div>
              )}
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
