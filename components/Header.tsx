
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserType } from '../types';

interface HeaderProps {
  onNotificationClick: () => void;
}

const ThemedHeaderBackground: React.FC = () => {
    const { designStyle } = useTheme();

    const patterns: Record<string, React.ReactNode> = {
        oceanic: (
            <div className="absolute inset-0 opacity-10 mix-blend-soft-light">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="wave" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><path d="M 0 30 C 15 0 30 0 30 30 S 45 60 60 30" stroke="#fff" strokeWidth="1" fill="none"/></pattern></defs><rect width="100%" height="100%" fill="url(#wave)"/></svg>
            </div>
        ),
        elegant: (
            <div className="absolute inset-0 opacity-5 mix-blend-overlay">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="elegant" patternUnits="userSpaceOnUse" width="20" height="20"><path d="M0 0L10 10L0 20" stroke="#fff" strokeWidth="0.5" fill="none"/><path d="M10 0L20 10L10 20" stroke="#fff" strokeWidth="0.5" fill="none"/></pattern></defs><rect width="100%" height="100%" fill="url(#elegant)"/></svg>
            </div>
        ),
        vibrant: <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0"></div>,
        natural: <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
    };
    
    return patterns[designStyle] || null;
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { unreadCount } = useNotifications();
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    if (showBalance) {
      const timer = setTimeout(() => setShowBalance(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showBalance]);

  const isAgent = user?.type === UserType.AGENT;

  return (
    <header className="bg-primary p-4 pb-12 sticky top-0 z-[100] shadow-nagad overflow-hidden">
      <ThemedHeaderBackground />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6 relative">
        <div className="flex flex-col">
          <p className="text-white/70 text-[8px] font-bold uppercase tracking-widest">{language === 'bn' ? 'হ্যালো' : 'Hello'}</p>
          <h2 className="text-white text-sm font-bold tracking-tight truncate max-w-[120px]">
            {user?.name || 'User'}
          </h2>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <h1 className="text-white text-xl font-black tracking-tighter drop-shadow-sm">আমার ক্যাশ</h1>
        </div>
        
        <div className="relative">
            <button onClick={onNotificationClick} className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 active:scale-90 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-white text-primary text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary animate-bounce">
                    <span>{unreadCount}</span>
                  </div>
                )}
            </button>
        </div>
      </div>

      <div className="flex justify-center -mb-2 relative">
        {!isAgent ? (
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="bg-white/95 backdrop-blur-sm dark:bg-dark-surface/80 rounded-full h-10 flex items-center shadow-lg transition-all duration-300 min-w-[200px] relative border border-white/30 dark:border-dark-border active:scale-95 group"
          >
            <div className={`flex items-center justify-center w-full px-4 transition-opacity duration-300 ${showBalance ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-primary text-xs font-bold whitespace-nowrap tracking-tight">
                  {language === 'en' ? 'Tap for Balance' : 'ব্যালেন্স জানতে ট্যাপ করুন'}
              </span>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showBalance ? 'opacity-100' : 'opacity-0'}`}>
               <span className="text-primary dark:text-white text-lg font-bold tracking-tight">
                  ৳ {(Number(user?.balance) || 0).toLocaleString()}
               </span>
            </div>
          </button>
        ) : (
          <div className="h-10 flex items-center px-5 bg-white/15 rounded-full backdrop-blur-sm border border-white/20 shadow-inner">
             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
             <span className="text-white text-xs font-bold tracking-widest uppercase">{language === 'bn' ? 'এজেন্ট অ্যাকাউন্ট' : 'Agent Account'}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
