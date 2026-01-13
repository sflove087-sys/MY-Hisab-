
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';
import { UserIcon } from '../components/Icons';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { safeStorage } from '../utils/storage';

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
        setLoginIdentifier(parsedUser.mobile); // Pre-fill identifier for submission
      }
    } catch (e) {
      console.error("Failed to parse last active user:", e);
      safeStorage.removeItem('lastActiveUser'); // Clear corrupted data
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col overflow-hidden">
        {/* Header with Wave */}
        <header className="relative bg-primary text-white p-6 pt-10 text-center shadow-lg">
            <div className="absolute top-4 right-4 z-20">
                <div className="flex border border-white/20 rounded-lg overflow-hidden h-7 backdrop-blur-sm bg-white/10">
                    <button 
                        onClick={() => language !== 'bn' && toggleLanguage()}
                        className={`px-3 text-[9px] font-bold transition-colors ${language === 'bn' ? 'bg-white text-primary' : 'bg-transparent text-white/80'}`}
                    >
                        বাং
                    </button>
                    <button 
                        onClick={() => language !== 'en' && toggleLanguage()}
                        className={`px-3 text-[9px] font-bold transition-colors ${language === 'en' ? 'bg-white text-primary' : 'bg-transparent text-white/80'}`}
                    >
                        ENG
                    </button>
                </div>
            </div>

            <Logo className="w-14 h-14 mx-auto mb-2 drop-shadow-md" />
            <h1 className="text-2xl font-black tracking-tighter drop-shadow-sm">আমার ক্যাশ</h1>
            
            <div className="absolute -bottom-px left-0 w-full h-16">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,100 C25,50 75,50 100,100 L100,100 L0,100 Z" className="fill-current text-gray-50 dark:text-dark-bg"></path>
              </svg>
            </div>
        </header>

        <main className="flex-grow flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex-grow">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-6 text-xs text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {lastActiveUser ? (
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-3 border-4 border-white dark:border-dark-bg shadow-md mx-auto">
                                <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-dark-text">{lastActiveUser.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-dark-subtext">{lastActiveUser.mobile}</p>
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
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="••••"
                        required
                        autoFocus={!!lastActiveUser}
                    />
                    
                    <Button 
                        type="submit"
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="mt-4"
                    >
                        {t('login')}
                    </Button>
                </form>
            </div>

            <div className="mt-auto text-center pt-6">
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
            </div>
        </main>
    </div>
  );
};

export default LoginPage;
