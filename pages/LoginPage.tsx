
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { safeStorage } from '../utils/storage';
import Input from '../components/common/Input';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditingNumber, setIsEditingNumber] = useState(true);

  const { login } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    try {
      const storedUser = safeStorage.getItem('lastActiveUser');
      if (storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.mobile) {
          setLoginIdentifier(parsedUser.mobile);
          setIsEditingNumber(false);
        }
      }
    } catch (e) {}
  }, []);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login(loginIdentifier, password);
      if (!user) {
        setError(language === 'bn' ? 'পিন সঠিক নয়।' : 'Incorrect PIN.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMobileDisplay = (num: string) => {
    if (num.length === 11) {
      return `${num.slice(0, 5)}-${num.slice(5)}`;
    }
    return num;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Bar - Language Toggle */}
      <div className="flex justify-end p-5">
        <div className="flex border border-primary rounded-md overflow-hidden h-7">
          <button 
            onClick={() => language !== 'bn' && toggleLanguage()}
            className={`px-3 text-[10px] font-bold transition-colors ${language === 'bn' ? 'bg-primary text-white' : 'text-primary'}`}
          >
            বাং
          </button>
          <button 
            onClick={() => language !== 'en' && toggleLanguage()}
            className={`px-3 text-[10px] font-bold transition-colors ${language === 'en' ? 'bg-primary text-white' : 'text-primary'}`}
          >
            ENG
          </button>
        </div>
      </div>

      {/* Brand Section */}
      <div className="flex flex-col items-center mt-6 mb-12">
        <div className="w-24 h-24 mb-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" 
            className="w-full h-full object-contain" 
            alt="Nagad" 
          />
        </div>
        <div className="text-primary text-4xl font-black tracking-tighter">নগদ</div>
      </div>

      {/* Login Form */}
      <div className="px-10 flex-grow">
        <form onSubmit={handleLoginSubmit} className="space-y-8">
          
          {isEditingNumber ? (
            <div className="animate-in fade-in slide-in-from-top-2">
               <Input 
                label={language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                id="mobile"
                variant="underline"
                type="tel"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={11}
                placeholder="01XXXXXXXXX"
                required
                prefixIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                className="text-xl font-bold tracking-wider"
              />
            </div>
          ) : (
            <div className="text-center mb-6 animate-in zoom-in-95">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
              </p>
              <div className="flex items-center justify-center space-x-3">
                <h2 className="text-2xl font-black text-slate-700 tracking-tight">
                  {formatMobileDisplay(loginIdentifier)}
                </h2>
                <button 
                  type="button" 
                  onClick={() => setIsEditingNumber(true)}
                  className="text-primary text-[10px] font-black uppercase tracking-tighter bg-primary/5 px-2 py-1 rounded-md"
                >
                  {language === 'bn' ? 'পরিবর্তন' : 'CHANGE'}
                </button>
              </div>
            </div>
          )}

          <Input 
            label="PIN"
            id="password"
            variant="underline"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={5}
            placeholder="•••••"
            required
            prefixIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            className="tracking-[0.8em] font-mono text-xl"
          />

          {error && (
            <p className="text-red-500 text-[10px] font-bold text-center mt-2 animate-bounce">
              {error}
            </p>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading || password.length < 4 || loginIdentifier.length < 11}
              className="w-full h-12 bg-white border-2 border-primary text-primary font-black rounded-full hover:bg-primary/5 active:scale-95 transition-all uppercase tracking-widest text-[11px] disabled:opacity-20 shadow-sm"
            >
              {isLoading ? t('loading') : t('login')}
            </button>
          </div>

          <div className="text-center">
            <Link to="/signup" className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
               {language === 'bn' ? 'অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্ট খুলুন' : "Don't have an account? Sign Up"}
            </Link>
          </div>
        </form>
      </div>

      {/* Bottom Icons */}
      <div className="mt-auto pb-10 flex justify-center space-x-12 px-6">
        <div className="flex flex-col items-center space-y-1">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-primary border border-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Store Locator</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-primary border border-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
          </div>
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Offers</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-primary border border-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Help</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
