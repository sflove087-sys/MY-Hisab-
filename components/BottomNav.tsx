
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { HomeIcon, HistoryIcon, UserIcon, SparklesIcon } from './Icons';

const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { designStyle } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', labelKey: 'bottomNavHome', icon: HomeIcon },
    { path: '/history', labelKey: 'bottomNavHistory', icon: HistoryIcon },
    { path: '/ai-guide', labelKey: 'bottomNavAIGuide', icon: SparklesIcon },
    { path: '/profile', labelKey: 'bottomNavProfile', icon: UserIcon },
  ];
  
  const getActiveStyle = (isActive: boolean) => {
    if (!isActive) return 'text-gray-500 dark:text-dark-subtext';
    
    switch (designStyle) {
      case 'elegant':
        return 'text-primary border-t-2 border-primary';
      case 'vibrant':
        return 'bg-primary/10 text-primary dark:bg-primary/20 rounded-full shadow-[0_0_15px] shadow-primary/30';
      case 'oceanic':
        return 'bg-primary/10 text-primary dark:bg-primary/20 rounded-2xl';
       case 'natural':
         return 'bg-primary/10 text-primary dark:bg-primary/20 rounded-lg';
      default:
        return 'bg-primary/10 text-primary dark:bg-primary/20 rounded-full';
    }
  };
  
  const getLabelVisibility = (isActive: boolean) => {
      if (designStyle === 'elegant') return false;
      return isActive;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-gray-100 dark:bg-dark-surface/80 dark:border-dark-border shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-[50]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex-1 h-full flex items-center justify-center"
            >
              <div className={`flex items-center justify-center space-x-2 px-4 py-2 transition-all duration-300 ease-in-out h-10 ${getActiveStyle(isActive)}`}>
                <item.icon className="w-5 h-5" />
                {getLabelVisibility(isActive) && <span className="text-xs font-bold tracking-tight">{t(item.labelKey as any)}</span>}
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
