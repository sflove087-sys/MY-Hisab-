
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const BottomNav: React.FC = () => {
  const { language } = useLanguage();
  const { colorTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { 
      path: '/', 
      label: language === 'bn' ? 'হোম' : 'Home', 
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-colors ${active ? 'text-primary' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: '/history', 
      label: language === 'bn' ? 'লেনদেন' : 'History', 
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-colors ${active ? 'text-primary' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      path: '/scan', 
      label: '', 
      icon: (active: boolean) => (
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg -mt-8 border-4 border-white dark:border-dark-bg transition-transform active:scale-90">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m0 14v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      )
    },
    { 
      path: '/profile', 
      label: language === 'bn' ? 'অ্যাকাউন্ট' : 'Account', 
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-colors ${active ? 'text-primary' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-slate-100 dark:border-dark-border shadow-lg z-50">
        <nav className="flex items-center justify-around h-16 px-2">
            {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className="flex flex-col items-center justify-center flex-1 py-1"
                    >
                        {item.icon(isActive)}
                        {item.label && (
                          <span className={`text-[8px] font-black mt-1 transition-colors uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                              {item.label}
                          </span>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    </div>
  );
};

export default BottomNav;
