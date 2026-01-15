
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

  useEffect(() => {
    try {
      const storedUser = safeStorage.getItem('lastActiveUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setLastActiveUser(parsedUser);
        setLoginIdentifier(parsedUser.mobile);
      }
    } catch (e) {
      console.error("Failed to parse last active user:", e);
      safeStorage.removeItem('lastActiveUser');
    }
  }, []);

  const handleLoginSubmit = async (e?: React.FormEvent, bypassPassword?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    const targetPassword = bypassPassword || password;

    if (!loginIdentifier || !targetPassword) {
      setError(language === 'bn' ? 'মোবাইল/ইমেল এবং পিন দিন।' : 'Please enter mobile/email and PIN.');
      setIsLoading(false);
      return;
    }

    try {
      const user = await login(loginIdentifier, targetPassword);
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
            const decodedPin = atob(biometricKey); 
            handleLoginSubmit(undefined, decodedPin);
        } catch (e) {
            setError(t('biometricsFailed'));
        }
    } else {
        setError(t('biometricsFailed'));
    }
  };

  const handleSwitchAccount = () => {
    safeStorage.removeItem('lastActiveUser');
    setLastActiveUser(null);
    setLoginIdentifier('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[30%] bg-orange-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-sm z-10 flex flex-col h-full">
            {/* Logo Section */}
            <div className="text-center mb-10 animate-in fade-in slide-in-from-top-10 duration-700">
                <div className="inline-block p-4 bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-xl shadow-primary/10 border border-gray-50 dark:border-dark-border mb-6">
                    <Logo className="w-16 h-16" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text tracking-tighter leading-none">
                    আমার ক্যাশ
                </h1>
                <p className="text-gray-400 dark:text-dark-subtext mt-2 font-bold text-[8px] uppercase tracking-[0.3em]">
                    ডিজিটাল ওয়ালেট
                </p>
            </div>

            {/* Login Card */}
            <div className="bg-white/70 dark:bg-dark-surface/50 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-black/5 border border-white dark:border-dark-border animate-in fade-in zoom-in-95 duration-700">
                <div className="mb-6">
                    <h2 className="text-xl font-black text-gray-800 dark:text-dark-text tracking-tight">
                        {lastActiveUser ? (language === 'bn' ? 'ফিরে আসায় স্বাগতম' : 'Welcome Back') : t('loginTitle')}
                    </h2>
                    <p className="text-[8px] font-bold text-gray-400 dark:text-dark-subtext mt-1 uppercase tracking-wider">
                        {lastActiveUser ? lastActiveUser.name : (language === 'bn' ? 'এগিয়ে যেতে লগইন করুন' : 'Sign in to continue')}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-[8px] font-bold text-center uppercase tracking-widest">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {lastActiveUser ? (
                        <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <span className="text-sm font-black">{getInitials(lastActiveUser.name)}</span>
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">{lastActiveUser.mobile}</p>
                                <button type="button" onClick={handleSwitchAccount} className="text-[8px] text-primary font-bold hover:underline uppercase tracking-tight">
                                    {t('switchAccount')}
                                </button>
                            </div>
                            {lastActiveUser.biometricsEnabled && (
                                <button 
                                    type="button"
                                    onClick={() => setIsBiometricModalOpen(true)}
                                    className="p-3 bg-white dark:bg-dark-surface rounded-xl shadow-md border border-gray-50 dark:border-dark-border active:scale-90 transition-transform text-primary"
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
                            className="text-center text-3xl tracking-[0.5em] font-mono group-focus-within:border-primary/50"
                        />
                    </div>
                    
                    <Button 
                        type="submit"
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="py-5 text-sm font-black uppercase tracking-[0.2em] rounded-[1.5rem]"
                    >
                        {t('login')}
                    </Button>
                </form>

                {!lastActiveUser && (
                    <div className="mt-8 text-center">
                        <p className="text-[8px] text-gray-400 dark:text-dark-subtext uppercase font-bold tracking-widest">
                            {t('noAccountPrompt')}
                        </p>
                        <Link to="/signup" className="mt-2 inline-block font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-[0.2em] text-[8px]">
                            {t('register')}
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom Utilities */}
            <div className="mt-10 flex flex-col items-center animate-in fade-in duration-1000">
                <div className="inline-flex p-1 bg-gray-100 dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border">
                    <button 
                        onClick={() => language !== 'bn' && toggleLanguage()}
                        className={`px-6 py-2 rounded-xl text-[8px] font-black tracking-widest transition-all ${language === 'bn' ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        বাংলা
                    </button>
                    <button 
                        onClick={() => language !== 'en' && toggleLanguage()}
                        className={`px-6 py-2 rounded-xl text-[8px] font-black tracking-widest transition-all ${language === 'en' ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        ENGLISH
                    </button>
                </div>
                
                <p className="mt-8 text-[8px] text-gray-300 dark:text-dark-subtext font-bold uppercase tracking-[0.4em]">
                    Powered by Amar Cash Security
                </p>
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
