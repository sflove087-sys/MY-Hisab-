
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import BiometricModal from '../components/common/BiometricModal';
import { safeStorage } from '../utils/storage';

const getInitials = (name: string = ''): string => {
  const names = name.split(' ').filter(Boolean);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const LoginPage: React.FC = () => {
  const [lastActiveUser, setLastActiveUser] = useState<{name: string; mobile: string; biometricsEnabled?: boolean} | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  const { login } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  // Load remembered user data on mount
  useEffect(() => {
    try {
      const storedUser = safeStorage.getItem('lastActiveUser');
      if (storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.mobile) {
          setLastActiveUser(parsedUser);
          setLoginIdentifier(parsedUser.mobile);
        }
      }
    } catch (e) {
      console.error("Failed to parse last active user:", e);
      safeStorage.removeItem('lastActiveUser');
    }
  }, []);

  // Automatic biometric trigger for returning users with preference enabled
  useEffect(() => {
    if (lastActiveUser?.biometricsEnabled && !isLoading && !error && !isBiometricModalOpen) {
      const timer = setTimeout(() => {
        setIsBiometricModalOpen(true);
      }, 1000); // Slightly longer delay for a smoother intro
      return () => clearTimeout(timer);
    }
  }, [lastActiveUser]);

  const handleLoginSubmit = async (e?: React.FormEvent, bypassPassword?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    const targetPassword = bypassPassword || password;
    const targetIdentifier = loginIdentifier.trim();

    if (!targetIdentifier || !targetPassword) {
      setError(language === 'bn' ? 'মোবাইল/ইমেল এবং পিন দিন।' : 'Please enter mobile/email and PIN.');
      setIsLoading(false);
      return;
    }

    try {
      const user = await login(targetIdentifier, targetPassword);
      if (!user) {
        setError(language === 'bn' ? 'মোবাইল/ইমেল বা পিন ভুল।' : 'Incorrect mobile/email or PIN.');
      }
    } catch (err) {
      setError(language === 'bn' ? 'সার্ভারে সমস্যা হচ্ছে। আবার চেষ্টা করুন।' : 'Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSuccess = () => {
    setIsBiometricModalOpen(false);
    const biometricKey = safeStorage.getItem(`biometric_key_${lastActiveUser?.mobile}`);
    if (biometricKey) {
        try {
            // Decrypt simulation: strip security prefix and decode
            const decodedPin = atob(biometricKey.replace('AC_SEC_', '')); 
            handleLoginSubmit(undefined, decodedPin);
        } catch (e) {
            setError(t('biometricsFailed'));
        }
    } else {
        setError(t('biometricsFailed'));
    }
  };

  const handleSwitchAccount = () => {
    // Keep lastActiveUser in storage for later, but clear current form view
    setLastActiveUser(null);
    setLoginIdentifier('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] dark:bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Shapes */}
        <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-[#FFE5D9] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-80 h-80 bg-[#FFE5D9] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="w-full max-w-sm z-10 flex flex-col h-full">
            <div className="text-center mb-8 animate-in fade-in slide-in-from-top-10 duration-700">
                <div className="inline-block relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F14D23] to-[#FF9800] rounded-full flex items-center justify-center shadow-xl shadow-orange-500/20 mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-dark-text tracking-tight leading-none mb-1">
                    আমার ক্যাশ
                </h1>
                <p className="text-[#999999] dark:text-dark-subtext font-bold text-[8px] uppercase tracking-[0.2em]">
                    ডিজিটাল ওয়ালেট
                </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 dark:border-dark-border animate-in fade-in zoom-in-95 duration-700">
                <div className="mb-8 text-center">
                    <h2 className="text-lg font-black text-gray-800 dark:text-dark-text tracking-tight uppercase">
                        {lastActiveUser ? (language === 'bn' ? 'ফিরে আসায় স্বাগতম' : 'Welcome Back') : t('loginTitle')}
                    </h2>
                    <p className="text-[8px] font-black text-gray-400 dark:text-dark-subtext mt-1 uppercase tracking-widest">
                        {lastActiveUser ? lastActiveUser.name : (language === 'bn' ? 'এগিয়ে যেতে লগইন করুন' : 'SIGN IN TO CONTINUE')}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-6 text-[8px] font-bold text-center uppercase tracking-widest">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    {lastActiveUser ? (
                        <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                                <span className="text-sm font-black">{getInitials(lastActiveUser.name)}</span>
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="text-[10px] font-black text-gray-800 dark:text-dark-text tracking-tight truncate">{lastActiveUser.mobile}</p>
                                <button type="button" onClick={handleSwitchAccount} className="text-[8px] text-primary font-bold hover:underline uppercase tracking-widest">
                                    {t('switchAccount')}
                                </button>
                            </div>
                            {lastActiveUser.biometricsEnabled && (
                                <button 
                                    type="button"
                                    onClick={() => setIsBiometricModalOpen(true)}
                                    className="p-3 bg-white dark:bg-dark-surface rounded-xl shadow-md border border-gray-50 dark:border-dark-border active:scale-90 transition-transform text-primary shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c4.183 0 7.773 2.564 9.303 6.216m-6.918 10.29A10.014 10.014 0 0112 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-6.103m4.626 10.232a4.115 4.115 0 01-.461-1.929V11m5.22 10.125a9.991 9.991 0 005.466-4.417m-9.039 4.34A10.011 10.011 0 0112 21c-1.35 0-2.645-.268-3.829-.755" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ) : (
                        <Input 
                            label={t('mobileOrEmail')}
                            id="loginIdentifier"
                            type="text" 
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            required
                            className="text-center placeholder:text-center"
                        />
                    )}

                    <div className="relative group">
                        <Input 
                            label={t('pin')}
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={4}
                            inputMode="numeric"
                            placeholder="••••"
                            required
                            autoFocus={!!lastActiveUser}
                            className="text-center text-3xl tracking-[0.5em] font-mono group-focus-within:border-primary/50 placeholder:text-center"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#F14D23] hover:bg-orange-700 text-white font-black py-5 rounded-[1.5rem] transition-all active:scale-[0.98] disabled:bg-gray-300 uppercase tracking-[0.1em] text-sm shadow-xl shadow-orange-500/10 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t('loading')}</span>
                            </div>
                        ) : t('login')}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[8px] text-gray-400 dark:text-dark-subtext uppercase font-black tracking-widest">
                        {t('noAccountPrompt')}
                    </p>
                    <Link to="/signup" className="mt-1 inline-block font-black text-[#F14D23] hover:text-orange-700 transition-colors uppercase tracking-widest text-[8px]">
                        {t('register')}
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center animate-in fade-in duration-1000">
                <div className="inline-flex p-1 bg-gray-100 dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border scale-90">
                    <button 
                        onClick={() => language !== 'bn' && toggleLanguage()}
                        className={`px-5 py-2 rounded-lg text-[8px] font-black tracking-widest transition-all ${language === 'bn' ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        বাংলা
                    </button>
                    <button 
                        onClick={() => language !== 'en' && toggleLanguage()}
                        className={`px-5 py-2 rounded-lg text-[8px] font-black tracking-widest transition-all ${language === 'en' ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        ENGLISH
                    </button>
                </div>
            </div>
        </div>

        <BiometricModal 
            isOpen={isBiometricModalOpen}
            onClose={() => setIsBiometricModalOpen(false)}
            onSuccess={handleBiometricSuccess}
            userName={lastActiveUser?.name}
        />
    </div>
  );
};

export default LoginPage;
