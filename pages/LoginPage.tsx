
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { safeStorage } from '../utils/storage';

// Helper to get initials from a name
const getInitials = (name: string = ''): string => {
  const names = name.split(' ').filter(Boolean);
  if (names.length === 0) return '';
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};


const LoginPage: React.FC = () => {
  const [lastActiveUser, setLastActiveUser] = useState<{name: string; mobile: string} | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!loginIdentifier || !password) {
      setError(language === 'bn' ? 'মোবাইল/ইমেল এবং পিন দিন।' : 'Please enter mobile/email and PIN.');
      setIsLoading(false);
      return;
    }

    try {
      const user = await login(loginIdentifier, password);
      if (!user) {
        setError(language === 'bn' ? 'মোবাইল/ইমেল বা পিন ভুল।' : 'Incorrect mobile/email or PIN.');
      }
    } catch (err) {
      setError(language === 'bn' ? 'সার্ভারে সমস্যা হচ্ছে। আবার চেষ্টা করুন।' : 'Server error. Please try again.');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-between p-6 pt-12 overflow-hidden">
        
        {/* Top Content: Logo and Title */}
        <div className="w-full max-w-sm text-center animate-in fade-in slide-in-from-top-10 duration-500">
            <Logo className="w-20 h-20 mx-auto" />
            <h1 className="text-3xl font-black text-gray-800 dark:text-dark-text mt-4 tracking-tighter">
                {lastActiveUser ? (language === 'bn' ? 'স্বাগতম' : 'Welcome Back') : t('loginTitle')}
            </h1>
            <p className="text-gray-500 dark:text-dark-subtext mt-1 h-5">
                {lastActiveUser ? lastActiveUser.name : (language === 'bn' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Login to your account')}
            </p>
        </div>

        {/* Middle Content: Form */}
        <div className="w-full max-w-sm my-8 animate-in fade-in duration-700">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-6 text-xs text-center font-bold">
                    {error}
                </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
                {lastActiveUser ? (
                    <div className="flex flex-col items-center text-center -mt-8 mb-4">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-dark-bg shadow-md">
                            <span className="text-4xl font-bold text-primary">{getInitials(lastActiveUser.name)}</span>
                        </div>
                         <p className="text-sm font-bold text-gray-500 dark:text-dark-subtext">{lastActiveUser.mobile}</p>
                    </div>
                ) : (
                    <Input 
                        label={t('mobileOrEmail')}
                        id="loginIdentifier"
                        type="text" 
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="01... or you@example.com"
                        required
                    />
                )}

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
                    className="text-center text-3xl tracking-[1em] font-mono"
                />
                
                <Button 
                    type="submit"
                    disabled={isLoading}
                    isLoading={isLoading}
                    className="mt-6"
                >
                    {t('login')}
                </Button>
            </form>
        </div>

        {/* Bottom Content: Links & Language */}
        <div className="w-full max-w-sm text-center animate-in fade-in slide-in-from-bottom-10 duration-500">
            {lastActiveUser ? (
                <button onClick={handleSwitchAccount} className="font-bold text-primary dark:text-primary-dark hover:underline text-sm">
                    {t('switchAccount')}
                </button>
            ) : (
                <p className="text-sm text-gray-500 dark:text-dark-subtext">
                    {t('noAccountPrompt')}{' '}
                    <Link to="/signup" className="font-bold text-primary hover:underline">
                        {t('register')}
                    </Link>
                </p>
            )}

            <div className="mt-6">
                <div className="inline-flex border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden h-7 backdrop-blur-sm bg-white/50 dark:bg-dark-surface/50">
                    <button 
                        onClick={() => language !== 'bn' && toggleLanguage()}
                        className={`px-4 text-[9px] font-bold transition-colors ${language === 'bn' ? 'bg-primary text-white' : 'bg-transparent text-gray-500 dark:text-dark-subtext'}`}
                    >
                        বাংলা
                    </button>
                    <button 
                        onClick={() => language !== 'en' && toggleLanguage()}
                        className={`px-4 text-[9px] font-bold transition-colors ${language === 'en' ? 'bg-primary text-white' : 'bg-transparent text-gray-500 dark:text-dark-subtext'}`}
                    >
                        ENG
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
