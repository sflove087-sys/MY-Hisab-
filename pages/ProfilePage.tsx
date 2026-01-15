
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/themes';
import { UserIcon } from '../components/Icons';
import { safeStorage } from '../utils/storage';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { mode, toggleMode, colorTheme, setColorTheme } = useTheme();
  const navigate = useNavigate();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    if (user) {
        try {
            const lastActiveUser = safeStorage.getItem('lastActiveUser');
            if (lastActiveUser) {
                const parsed = JSON.parse(lastActiveUser);
                setBiometricsEnabled(parsed.biometricsEnabled || false);
            }
        } catch (e) {
            console.error("Failed to load biometric setting:", e);
        }
    }
  }, [user]);

  const toggleBiometrics = () => {
    const newValue = !biometricsEnabled;
    setBiometricsEnabled(newValue);
    
    try {
        const lastActiveUser = safeStorage.getItem('lastActiveUser');
        if (lastActiveUser && user) {
            const parsed = JSON.parse(lastActiveUser);
            parsed.biometricsEnabled = newValue;
            safeStorage.setItem('lastActiveUser', JSON.stringify(parsed));
            
            if (newValue) {
                // Store "encrypted" (base64 for demo) credential for login
                // In a real app, this would be a secure token managed by WebAuthn
                safeStorage.setItem(`biometric_key_${user.mobile}`, btoa(user.password));
                alert(t('biometricsEnabled'));
            } else {
                safeStorage.removeItem(`biometric_key_${user.mobile}`);
            }
        }
    } catch (e) {
        console.error("Failed to toggle biometrics:", e);
    }
  };
  
  const getThemeSwatchStyle = (style: string) => {
      switch(style) {
          case 'oceanic': return 'rounded-full';
          case 'natural': return 'rounded-lg';
          case 'elegant': return 'rounded-sm';
          case 'vibrant': return 'rounded-full';
          default: return 'rounded-full';
      }
  }

  return (
    <div className="p-4 pb-10">
      <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-br from-primary to-orange-400 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-dark-border">
              <div className="w-20 h-20 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-dark-surface shadow-md mx-auto">
                <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">{user?.name}</h2>
              <p className="text-gray-500 dark:text-dark-subtext text-sm mt-1">{user?.mobile}</p>
          </div>
      </div>
      
      <div className="space-y-4">
        {/* Biometrics Toggle */}
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c4.183 0 7.773 2.564 9.303 6.216m-6.918 10.29A10.014 10.014 0 0112 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-6.103m4.626 10.232a4.115 4.115 0 01-.461-1.929V11m5.22 10.125a9.991 9.991 0 005.466-4.417m-9.039 4.34A10.011 10.011 0 0112 21c-1.35 0-2.645-.268-3.829-.755" />
                    </svg>
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-dark-text">{t('enableBiometrics')}</p>
                    <p className="text-[10px] text-gray-500 dark:text-dark-subtext uppercase font-bold tracking-widest">{biometricsEnabled ? 'সক্রিয় আছে' : 'নিষ্ক্রিয় আছে'}</p>
                </div>
            </div>
            <button 
                onClick={toggleBiometrics}
                className={`w-12 h-6 rounded-full p-1 flex items-center transition-all duration-300 ${biometricsEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${biometricsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>

        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
            <h3 className="text-sm font-bold text-gray-700 dark:text-dark-text px-2 mb-3">{t('changeTheme')}</h3>
            <div className="grid grid-cols-5 gap-3 px-2">
                {Object.values(themes).map((theme) => (
                    <div key={theme.name} className="flex flex-col items-center cursor-pointer" onClick={() => setColorTheme(theme.name)}>
                        <div
                            className={`w-10 h-10 border-2 transition-all flex items-center justify-center ${getThemeSwatchStyle(theme.designStyle)} ${colorTheme === theme.name ? 'border-primary scale-110 shadow-md' : 'border-gray-200 dark:border-dark-border'}`}
                            style={{ background: theme.preview }}
                        >
                          {colorTheme === theme.name && <div className="w-3 h-3 bg-white rounded-full shadow-inner"></div>}
                        </div>
                        <span className="text-[9px] text-gray-500 dark:text-dark-subtext mt-1.5 font-semibold">{theme.displayName}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
            <div className="flex justify-between items-center p-3">
                <span className="font-semibold text-sm text-gray-700 dark:text-dark-text">{t('darkMode')}</span>
                <button onClick={toggleMode} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${mode === 'dark' ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${mode === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
            <div className="border-t border-gray-100 dark:border-dark-border/50 mx-3"></div>
            <div className="flex justify-between items-center p-3">
                <span className="font-semibold text-sm text-gray-700 dark:text-dark-text">{t('language')}</span>
                <div className="flex border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden h-7">
                    <button onClick={() => language !== 'bn' && toggleLanguage()} className={`px-3 text-[10px] font-bold ${language === 'bn' ? 'bg-primary text-white' : 'bg-transparent text-gray-500'}`}>বাংলা</button>
                    <button onClick={() => language !== 'en' && toggleLanguage()} className={`px-3 text-[10px] font-bold ${language === 'en' ? 'bg-primary text-white' : 'bg-transparent text-gray-500'}`}>ENG</button>
                </div>
            </div>
             <div className="border-t border-gray-100 dark:border-dark-border/50 mx-3"></div>
            <button
              onClick={() => navigate('/change-password')}
              className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-dark-bg/50 rounded-lg transition-colors"
            >
              <span className="font-semibold text-sm text-gray-700 dark:text-dark-text">{t('changePin')}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>

        <div className="pt-4">
             <button onClick={logout} className="w-full py-3 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 font-bold text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                {t('logout')}
             </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
