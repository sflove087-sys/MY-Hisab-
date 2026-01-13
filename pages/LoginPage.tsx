
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';
import { UserIcon, SwitchHorizontalIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
  const [lastActiveUser, setLastActiveUser] = useState<{name: string; mobile: string} | null>(null);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const storedUser = localStorage.getItem('lastActiveUser');
    if (storedUser) {
      setLastActiveUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const loginMobile = lastActiveUser ? lastActiveUser.mobile : mobile;

    if (!loginMobile || !password) {
      setError('মোবাইল এবং পিন দিন।');
      setIsLoading(false);
      return;
    }

    try {
      const user = await login(loginMobile, password);
      if (!user) setError('মোবাইল নাম্বার বা পিন ভুল।');
    } catch (err) {
      setError('সার্ভারে সমস্যা হচ্ছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    setLastActiveUser(null);
    setMobile('');
    setPassword('');
    setError('');
  };

  const FullLoginForm = () => (
    <>
      <div className="flex flex-col items-center mt-12 mb-10">
        <Logo className="w-20 h-20" />
        <h1 className="text-primary text-4xl font-black mt-2 tracking-tighter">আমার ক্যাশ</h1>
      </div>

      <div className="w-full max-w-xs space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] text-center font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-1">
             <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block text-center">{t('mobileNumber')}</label>
             <input 
              type="tel" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="017XX-XXXXXX"
              className="w-full text-center text-lg font-bold text-gray-800 border-b border-gray-200 focus:border-primary outline-none py-1.5 bg-transparent transition-colors"
             />
          </div>

          <div className="space-y-1 relative">
             <label className="text-primary text-[10px] font-bold uppercase tracking-widest block text-left ml-6">{t('pin')}</label>
             <div className="flex items-center">
                <span className="text-primary mr-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-base font-bold border-b-2 border-primary focus:outline-none py-1 bg-transparent tracking-[0.4em]"
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="••••"
                />
             </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full border-2 border-primary text-primary text-xs font-black py-3.5 rounded-full hover:bg-primary hover:text-white transition-all active:scale-95 mt-4 uppercase tracking-widest"
          >
            {isLoading ? t('loading') : t('login')}
          </button>
          
          <div className="text-center pt-4 border-t border-gray-50">
            <p className="text-gray-400 text-[10px] font-medium mb-2">{t('noAccountPrompt')}</p>
            <Link 
              to="/signup" 
              className="text-primary text-xs font-black uppercase tracking-widest hover:underline"
            >
              {t('register')}
            </Link>
          </div>
        </form>
      </div>
    </>
  );

  const PinOnlyForm = () => (
    <div className="w-full max-w-xs flex flex-col items-center flex-grow">
        <div className="flex flex-col items-center mt-16 mb-10 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <UserIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-gray-800 text-2xl font-bold">{lastActiveUser?.name}</h1>
            <p className="text-gray-500 text-base">{lastActiveUser?.mobile}</p>
        </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center font-bold border border-red-100 w-full">
          {error}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="w-full space-y-6 mt-6">
        <div>
           <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-center text-4xl font-bold border-b-2 border-primary focus:outline-none py-2 bg-transparent tracking-[0.4em]"
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              autoFocus
            />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white text-sm font-black py-4 rounded-full hover:bg-primary/90 transition-all active:scale-95 uppercase tracking-widest"
        >
          {isLoading ? t('loading') : t('login')}
        </button>
      </form>
      
      <div className="mt-auto mb-10">
        <button onClick={handleSwitchAccount} className="flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors group">
            <SwitchHorizontalIcon className="w-5 h-5 transition-transform group-hover:rotate-180" />
            <span className="text-xs font-bold uppercase tracking-widest">অন্য অ্যাকাউন্ট</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 px-6 relative">
      <div className="absolute top-6 right-6 flex border border-gray-100 rounded-lg overflow-hidden h-7">
        <button 
          onClick={() => language !== 'bn' && toggleLanguage()}
          className={`px-3 text-[9px] font-bold ${language === 'bn' ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}
        >
          বাং
        </button>
        <button 
          onClick={() => language !== 'en' && toggleLanguage()}
          className={`px-3 text-[9px] font-bold ${language === 'en' ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}
        >
          ENG
        </button>
      </div>
      
      {lastActiveUser ? <PinOnlyForm /> : <FullLoginForm />}
      
    </div>
  );
};

export default LoginPage;
