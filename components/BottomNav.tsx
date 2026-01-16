
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
      label: language === 'bn' ? 'হোম' : 'HOME', 
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: '/history', 
      label: language === 'bn' ? 'লেনদেন' : 'LOGS', 
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      path: '/scan', 
      label: '', 
      icon: (active: boolean) => (
        <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 -mt-10 border-[6px] border-slate-50 dark:border-dark-bg transition-all active:scale-90 hover:scale-105">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m0 14v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      )
    },
    { 
      path: '/profile', 
      label: language === 'bn' ? 'অ্যাকাউন্ট' : 'ACCOUNT', 
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-white/50 dark:border-dark-border/50 rounded-[2.5rem] shadow-2xl z-50 transition-all duration-300">
        <nav className="flex items-center justify-around h-20 px-4">
            {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className="flex flex-col items-center justify-center flex-1 py-1 group"
                    >
                        {item.icon(isActive)}
                        {item.label && (
                          <span className={`text-[8px] font-black mt-2 transition-all duration-300 uppercase tracking-[0.2em] ${isActive ? 'text-primary opacity-100 translate-y-0' : 'text-slate-300 opacity-60 translate-y-0.5'}`}>
                              {item.label}
                          </span>
                        )}
                        {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shadow-[0_0_8px_hsl(var(--color-primary-hsl))]"></div>}
                    </NavLink>
                );
            })}
        </nav>
    </div>
  );
};

export default BottomNav;
