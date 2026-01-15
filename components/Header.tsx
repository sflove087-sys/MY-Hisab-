
import React, { useState, useEffect } from 'react';
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
  const isBkash = colorTheme === 'bkash';

  const toggleBalance = () => {
    if (showBalance) return;
    setIsSliding(true);
    // Vibrate if supported
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    
    setTimeout(() => {
      setShowBalance(true);
      setIsSliding(false);
    }, 400);

    setTimeout(() => {
      setShowBalance(false);
    }, 4000);
  };

  return (
    <header className="bg-primary pt-12 pb-4 px-4 relative overflow-hidden transition-all duration-500 shadow-md">
      <div className="relative z-10 flex flex-col space-y-4">
        {/* Top Navbar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-white rounded-full p-1.5 flex items-center justify-center border-2 border-primary/10 shadow-sm overflow-hidden">
                <img src={user?.type === 'Agent' ? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="Profile" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col">
                <span className="text-white text-[10px] font-bold opacity-80 leading-none">{language === 'bn' ? 'স্বাগতম' : 'Welcome'}</span>
                <span className="text-white text-sm font-black tracking-tight">{user?.name}</span>
             </div>
          </div>

          <div className="flex items-center">
             <div className="h-10 px-2 flex items-center justify-center">
                <img src={currentTheme.logoUrl} alt="Logo" className="h-6 w-auto object-contain brightness-0 invert" />
             </div>
          </div>

          <div className="flex items-center space-x-2">
             <button onClick={onNotificationClick} className="w-10 h-10 rounded-full flex items-center justify-center relative hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && <div className="absolute top-1 right-1 bg-white text-primary w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center border border-primary animate-pulse">{unreadCount}</div>}
             </button>
          </div>
        </div>

        {/* Balance Check - The signature bKash Bar */}
        <div className="flex justify-start">
           <button 
             onClick={toggleBalance}
             className={`h-10 rounded-full bg-white relative transition-all duration-500 overflow-hidden flex items-center shadow-inner ${showBalance ? 'w-52' : 'w-44'}`}
           >
              {/* Progress/Slide Overlay */}
              <div 
                className={`absolute inset-0 bg-primary/10 transition-transform duration-500 ease-out origin-left ${isSliding ? 'scale-x-100' : 'scale-x-0'}`}
              ></div>

              {!showBalance ? (
                <div className="flex items-center px-3 space-x-2.5 animate-in fade-in duration-300">
                   <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-black text-[10px] shadow-sm">৳</div>
                   <span className="text-primary font-black text-[11px] uppercase tracking-tighter">
                      {language === 'bn' ? 'ব্যালেন্স দেখুন' : 'Tap for Balance'}
                   </span>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full animate-in slide-in-from-left-4 duration-500">
                   <span className="text-primary font-black text-lg tracking-tight">
                      <span className="text-sm mr-1.5 opacity-60 font-bold">৳</span>
                      {(Number(user?.balance) || 0).toLocaleString()}
                   </span>
                </div>
              )}
              
              {/* Shimmer line */}
              {!showBalance && !isSliding && (
                <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12 animate-shimmer"></div>
              )}
           </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(400%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite ease-in-out;
        }
      `}} />
    </header>
  );
};

export default Header;
