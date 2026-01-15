
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import { googleSheetService } from '../services/googleSheetService';
import Logo from '../components/Logo';

const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let processedMobile = mobile.trim();
    if (processedMobile.length === 10 && processedMobile.startsWith('1')) {
      processedMobile = `0${processedMobile}`;
    }

    if (!name || !email || processedMobile.length !== 11 || !processedMobile.startsWith('01')) {
      setError(language === 'bn' ? 'অনুগ্রহ করে সব তথ্য সঠিক ভাবে দিন।' : 'Please fill all fields correctly.');
      return;
    }
    
    if (password.length !== 4) {
      setError(t('pinInvalid'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('pinMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await googleSheetService.signUpUser(name, processedMobile, email, password);
      if (result && result.status === 'Success') {
        alert(language === 'bn' ? 'অ্যাকাউন্ট খোলা সফল হয়েছে! লগইন করুন।' : 'Sign up successful! Please log in.');
        navigate('/login');
      } else {
        setError(result?.error || (language === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে।' : 'Sign up failed. Please try again.'));
      }
    } catch (err) {
      setError(language === 'bn' ? 'একটি অজানা সমস্যা হয়েছে।' : 'An unexpected error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Soft Decorative Background Orbs */}
        <div className="absolute top-[-15%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in duration-1000">
            {/* Logo Section */}
            <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-premium border border-white/40 dark:border-dark-border mb-5">
                    <Logo className="w-14 h-14" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                    {language === 'bn' ? 'অ্যাকাউন্ট খুলুন' : 'New Account'}
                </h1>
                <p className="text-[9px] font-black text-slate-400 dark:text-dark-subtext uppercase tracking-[0.4em] mt-1.5 opacity-80">
                    {language === 'bn' ? 'ডিজিটাল ওয়ালেট রেজিস্ট্রেশন' : 'DIGITAL WALLET REGISTRATION'}
                </p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white dark:bg-dark-surface p-8 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] dark:shadow-none border border-white/50 dark:border-dark-border">
                {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 text-rose-500 dark:text-rose-400 p-3.5 rounded-2xl mb-6 text-[10px] font-black text-center uppercase tracking-widest animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUpSubmit} className="space-y-5">
                    <div className="neumorphic-well dark:bg-dark-bg p-1 rounded-3xl transition-all duration-300">
                        <Input 
                            id="name" 
                            label={t('fullName')} 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="AL MUMIN" 
                            required 
                            className="bg-transparent border-none shadow-none focus:ring-0 text-sm font-bold"
                        />
                    </div>

                    <div className="neumorphic-well dark:bg-dark-bg p-1 rounded-3xl transition-all duration-300">
                        <Input 
                            id="mobile" 
                            label={t('mobileNumber')} 
                            type="tel" 
                            value={mobile} 
                            onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))} 
                            placeholder="1XXXXXXXXX" 
                            required
                            prefix="+880"
                            maxLength={10}
                            className="bg-transparent border-none shadow-none focus:ring-0 text-sm font-bold"
                        />
                    </div>

                    <div className="neumorphic-well dark:bg-dark-bg p-1 rounded-3xl transition-all duration-300">
                        <Input 
                            id="email" 
                            label={t('email')} 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="user@example.com" 
                            required 
                            className="bg-transparent border-none shadow-none focus:ring-0 text-sm font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="neumorphic-well dark:bg-dark-bg p-1 rounded-2xl transition-all duration-300">
                            <Input 
                                id="password" 
                                label={t('pin')} 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ''))} 
                                placeholder="••••" 
                                required 
                                maxLength={4}
                                inputMode="numeric"
                                className="bg-transparent border-none shadow-none focus:ring-0 text-center tracking-[0.3em] font-mono text-lg"
                            />
                        </div>
                        <div className="neumorphic-well dark:bg-dark-bg p-1 rounded-2xl transition-all duration-300">
                            <Input 
                                id="confirmPassword" 
                                label={t('confirmPIN')} 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value.replace(/[^0-9]/g, ''))} 
                                placeholder="••••" 
                                required 
                                maxLength={4}
                                inputMode="numeric"
                                className="bg-transparent border-none shadow-none focus:ring-0 text-center tracking-[0.3em] font-mono text-lg"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="group w-full h-14 bg-primary text-white font-black rounded-3xl transition-all duration-300 hover:bg-primary-dark active:scale-[0.96] disabled:bg-slate-200 dark:disabled:bg-dark-bg shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 overflow-hidden relative"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-[11px] uppercase tracking-widest">{t('loading')}</span>
                                </div>
                            ) : (
                                <>
                                    <span className="text-[11px] uppercase tracking-[0.2em] font-black">{language === 'bn' ? 'রেজিস্ট্রেশন নিশ্চিত করুন' : 'COMPLETE REGISTRATION'}</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                    </div>
                </form>

                <div className="mt-10 text-center border-t border-slate-50 dark:border-dark-border pt-8">
                    <p className="text-[10px] text-slate-400 dark:text-dark-subtext uppercase font-black tracking-widest mb-3">
                        {t('haveAccount')}
                    </p>
                    <Link to="/login" className="inline-flex items-center space-x-2 font-black text-primary hover:text-primary-dark transition-all uppercase tracking-widest text-[10px] bg-primary/5 px-6 py-2.5 rounded-2xl hover:bg-primary/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                        </svg>
                        <span>{language === 'bn' ? 'লগইন-এ ফিরে যান' : 'BACK TO LOGIN'}</span>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col items-center mt-12 opacity-40">
                <div className="flex items-center space-x-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 .155 17.834 4.9a2 2 0 011.166 1.8v3.413a9.001 9.001 0 01-5.636 8.322L10 20l-3.364-1.565A9.001 9.001 0 014 10.113V6.7a2 2 0 011.166-1.8zM9 11V7a1 1 0 112 0v4a1 1 0 11-2 0zm1 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    <span>Secure & Encrypted</span>
                </div>
            </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
            .neumorphic-well {
                background: #F0F2F5;
                box-shadow: inset 4px 4px 10px #d1d9e6, inset -6px -6px 12px #ffffff;
            }
            .dark .neumorphic-well {
                background: #0F172A;
                box-shadow: inset 4px 4px 8px #080d18, inset -2px -2px 6px #1e293b;
                border: 1px solid #1e293b;
            }
            .neumorphic-well:focus-within {
                box-shadow: inset 2px 2px 5px #d1d9e6, inset -3px -3px 6px #ffffff, 0 0 0 2px rgba(226,19,110,0.1);
            }
            .dark .neumorphic-well:focus-within {
                box-shadow: inset 2px 2px 4px #080d18, inset -1px -1px 3px #1e293b, 0 0 0 2px rgba(226,19,110,0.2);
            }
        `}} />
    </div>
  );
};

export default SignUpPage;
