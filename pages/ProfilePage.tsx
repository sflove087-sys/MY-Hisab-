
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/themes';
import { safeStorage } from '../utils/storage';
import SimInfoCard from '../components/common/SimInfoCard';
import { SunIcon, MoonIcon } from '../components/Icons';
import Logo from '../components/Logo';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { mode, setMode, colorTheme, setColorTheme, resolvedMode } = useTheme();
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
                safeStorage.setItem(`biometric_key_${user.mobile}`, 'AC_SEC_' + btoa(user.password));
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
          case 'natural': return 'rounded-xl';
          case 'elegant': return 'rounded-none';
          case 'vibrant': return 'rounded-[1.2rem]';
          default: return 'rounded-2xl';
      }
  }

  const modeOptions = [
    { id: 'light', icon: (props: any) => <SunIcon {...props} />, label: t('lightMode') },
    { id: 'dark', icon: (props: any) => <MoonIcon {...props} />, label: t('darkModeOption') },
    { id: 'system', icon: (props: any) => <Logo {...props} />, label: t('systemDefault') },
  ];

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* User Identity Card */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          {user && <SimInfoCard user={user} />}
      </div>
      
      <div className="space-y-6">
        {/* Biometrics Toggle Card */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-[2.2rem] shadow-premium border border-slate-50 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c4.183 0 7.773 2.564 9.303 6.216m-6.918 10.29A10.014 10.014 0 0112 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-6.103m4.626 10.232a4.115 4.115 0 01-.461-1.929V11m5.22 10.125a9.991 9.991 0 005.466-4.417m-9.039 4.34A10.011 10.011 0 0112 21c-1.35 0-2.645-.268-3.829-.755" />
                    </svg>
                </div>
                <div>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-white">{t('enableBiometrics')}</p>
                    <p className="text-[10px] text-slate-400 dark:text-dark-subtext uppercase font-bold tracking-widest">{biometricsEnabled ? (language === 'bn' ? 'চালু আছে' : 'Activated') : (language === 'bn' ? 'বন্ধ আছে' : 'Deactivated')}</p>
                </div>
            </div>
            <button 
                onClick={toggleBiometrics}
                className={`w-14 h-7 rounded-full p-1.5 flex items-center transition-all duration-500 ease-in-out ${biometricsEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-dark-bg'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${biometricsEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
        </div>

        {/* Display Mode Selector */}
        <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 dark:text-dark-subtext uppercase tracking-[0.3em] px-2">{t('darkMode')}</h3>
             <div className="grid grid-cols-3 gap-3">
                {modeOptions.map((opt) => {
                    const isActive = mode === opt.id;
                    const IconComp = opt.icon;
                    return (
                        <button 
                            key={opt.id}
                            onClick={() => setMode(opt.id as any)}
                            className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all duration-300 ${isActive ? 'bg-white dark:bg-dark-surface border-primary shadow-lg scale-[1.05] ring-4 ring-primary/5' : 'bg-white dark:bg-dark-surface border-slate-50 dark:border-dark-border'}`}
                        >
                            <IconComp className={`w-6 h-6 mb-2 ${isActive ? '' : 'grayscale opacity-40 text-slate-400'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>{opt.label}</span>
                        </button>
                    )
                })}
             </div>
        </section>

        {/* Visual Theme Preview Grid */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-dark-subtext uppercase tracking-[0.3em] px-2">{t('changeTheme')}</h3>
            <div className="grid grid-cols-1 gap-4">
                {Object.values(themes).map((theme) => {
                    const isSelected = colorTheme === theme.name;
                    return (
                        <div 
                            key={theme.name} 
                            onClick={() => setColorTheme(theme.name)}
                            className={`group relative overflow-hidden rounded-[2.2rem] border-2 transition-all duration-500 cursor-pointer ${isSelected ? 'border-primary ring-4 ring-primary/10 shadow-xl scale-[1.02]' : 'border-white dark:border-dark-border hover:border-slate-100 dark:hover:border-slate-700'}`}
                        >
                            <div className="flex items-center p-5 bg-white dark:bg-dark-surface space-x-5">
                                {/* Color Swatch Preview */}
                                <div 
                                    className={`w-16 h-16 shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-inner flex items-center justify-center ${getThemeSwatchStyle(theme.designStyle)}`}
                                    style={{ background: theme.preview }}
                                >
                                    {isSelected && <div className="w-4 h-4 bg-white/40 rounded-full animate-ping"></div>}
                                </div>
                                
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-sm font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>
                                            {theme.displayName}
                                        </h4>
                                        {isSelected && <span className="text-[10px] font-black text-primary animate-in fade-in zoom-in uppercase">Active</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-dark-subtext mt-1 font-bold uppercase tracking-tight">
                                        Style: {theme.designStyle}
                                    </p>
                                </div>

                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary text-white' : 'border-slate-100 dark:border-dark-border text-transparent'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Other Settings List */}
        <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-premium border border-slate-50 dark:border-dark-border overflow-hidden p-2">
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827-5.806m10.705 5.806a18.022 18.022 0 01-3.827-5.806m0 0a18.023 18.023 0 00-3.473-4.472m3.473 4.472A11.305 11.305 0 0112 9a11.305 11.305 0 01-3.927-2.327" /></svg>
                    </div>
                    <span className="font-extrabold text-sm text-slate-700 dark:text-white uppercase tracking-tight">{t('language')}</span>
                </div>
                <div className="flex bg-slate-50 dark:bg-dark-bg p-1 rounded-2xl">
                    <button onClick={() => language !== 'bn' && toggleLanguage()} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${language === 'bn' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}>বাংলা</button>
                    <button onClick={() => language !== 'en' && toggleLanguage()} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${language === 'en' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}>ENG</button>
                </div>
            </div>
            
            <div className="border-t border-slate-50 dark:border-dark-border mx-4"></div>
            
            <button
              onClick={() => navigate('/change-password')}
              className="w-full text-left p-4 flex justify-between items-center group active:bg-slate-50 dark:active:bg-dark-bg transition-colors"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </div>
                    <span className="font-extrabold text-sm text-slate-700 dark:text-white uppercase tracking-tight">{t('changePin')}</span>
                </div>
                <svg className="w-5 h-5 text-slate-300 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>

        {/* Professional Logout Section */}
        <div className="pt-6">
             <button 
                onClick={logout} 
                className="w-full py-5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 font-black text-xs uppercase tracking-[0.4em] rounded-[2.2rem] transition-all hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 border border-rose-100 dark:border-rose-500/20 shadow-sm"
             >
                {t('logout')}
             </button>
             <p className="text-center mt-6 text-[8px] text-slate-400 font-black uppercase tracking-[0.6em] opacity-40">Amar Cash Premium v2.5.0</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
