
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import TapAndHoldButton from '../components/common/TapAndHoldButton';
import SuccessModal from '../components/common/SuccessModal';
import { googleSheetService } from '../services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types';
import PageHeader from '../components/common/PageHeader';
import { ArrowRightIcon, UserIcon, CheckIcon } from '../components/Icons';
import { safeStorage } from '../utils/storage';

interface Recipient {
  name: string;
  mobile: string;
}

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SendMoneyPage: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recentRecipients, setRecentRecipients] = useState<Recipient[]>([]);
  const { user, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedRecents = safeStorage.getItem('recentRecipients');
      if (storedRecents) {
        setRecentRecipients(JSON.parse(storedRecents));
      }
    } catch (e) {
      safeStorage.removeItem('recentRecipients');
    }
  }, []);

  const saveRecentRecipient = (recipient: Recipient) => {
    const updatedRecents = [recipient, ...recentRecipients.filter(r => r.mobile !== recipient.mobile)].slice(0, 10);
    setRecentRecipients(updatedRecents);
    safeStorage.setItem('recentRecipients', JSON.stringify(updatedRecents));
  };

  const removeRecentRecipient = (mobile: string) => {
    const updated = recentRecipients.filter(r => r.mobile !== mobile);
    setRecentRecipients(updated);
    safeStorage.setItem('recentRecipients', JSON.stringify(updated));
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const m = mobile.trim();
      if (m.length === 11) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(m);
          if (result && 'error' in result) {
            setError(language === 'bn' ? 'প্রাপক খুঁজে পাওয়া যায়নি' : 'Recipient not found');
            setRecipient(null);
          } else if (result && 'type' in result && result.type === UserType.AGENT) {
            setError(language === 'bn' ? 'এজেন্ট নাম্বারে সেন্ড মানি করা যাবে না' : 'Cannot Send Money to Agent');
            setRecipient(null);
          } else if (result && 'name' in result) {
            setRecipient({ name: result.name, mobile: result.mobile });
          }
        } catch {
          setError(language === 'bn' ? 'ভেরিফিকেশন এরর' : 'Verification error');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setRecipient(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [mobile, language]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recipient) {
      setError(language === 'bn' ? 'সঠিক পার্সোনাল নাম্বার দিন' : 'Enter a valid personal number');
      return;
    }
    
    if (user!.balance < parseFloat(amount)) {
      setError(language === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই' : 'Insufficient balance');
      return;
    }
    
    if (pin !== user?.password) {
      setError(language === 'bn' ? 'ভুল পিন।' : 'Incorrect PIN.');
      return;
    }
    
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    try {
      const result = await googleSheetService.performSendMoney(user!.id, recipient!.mobile, parseFloat(amount));
      if (result && result.status === 'Success') {
        await refreshUser();
        saveRecentRecipient(recipient!);
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || 'Transaction failed');
        setStep('input');
      }
    } catch (err) {
      setError('An error occurred');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderInputScreen = () => (
    <div className="animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-8">
          <form onSubmit={handleProceedToReview} className="space-y-6">
            <div className="relative">
              <Input 
                id="mobile" 
                label={t('recipientMobile')} 
                type="tel" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="01XXXXXXXXX"
                required
                maxLength={11}
                prefixIcon={<UserIcon className="w-5 h-5" />}
              />
              
              {isVerifying && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}

              {recipient && (
                <div className="flex items-center justify-center space-x-2 mt-2 py-2 px-4 bg-primary/5 rounded-2xl animate-in slide-in-from-top-1">
                    <CheckIcon className="w-4 h-4 text-primary" />
                    <p className="text-[11px] text-primary font-bold uppercase">{recipient.name}</p>
                </div>
              )}
            </div>

            <Input 
              id="amount" 
              label={t('amount')} 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required 
              className="text-center text-3xl font-black text-primary"
            />

            {recipient && amount && (
              <Input
                id="pin"
                label={t('pin')}
                variant="underline"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                required
                maxLength={5}
                placeholder="•••••"
                className="text-center tracking-[1em] font-mono text-xl"
                prefixIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
            )}

            <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-full transition-all active:scale-95 uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 disabled:opacity-30"
                disabled={!pin || pin.length < 4 || isVerifying}
            >
              পরবর্তী
            </button>
          </form>
      </div>

      {recentRecipients.length > 0 && (
        <div className="px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">{t('recentRecipients')}</h3>
          <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-6 px-2">
            {recentRecipients.map((r, idx) => (
              <div key={idx} className="flex-shrink-0 flex flex-col items-center relative group">
                <button 
                    onClick={() => removeRecentRecipient(r.mobile)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button type="button" onClick={() => {setMobile(r.mobile); setRecipient(r);}} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center border border-slate-100 shadow-sm active:scale-90 transition-transform">
                     <span className="text-primary font-black text-xl">{getInitials(r.name)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 truncate w-16 text-center">{r.name.split(' ')[0]}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReviewScreen = () => (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 text-center">
             <div className="flex items-center justify-between mb-10">
                <div className="text-center w-1/3">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <UserIcon className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black text-slate-800 truncate">{user?.name}</p>
                </div>
                <ArrowRightIcon className="w-8 h-8 text-primary animate-pulse" />
                <div className="text-center w-1/3">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-primary/10">
                        <span className="text-primary font-black text-lg">{recipient ? getInitials(recipient.name) : '?'}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-800 truncate">{recipient?.name}</p>
                </div>
             </div>

             <div className="pt-8 border-t border-dashed border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('amount')}</p>
                <p className="text-4xl font-black text-primary">৳{parseFloat(amount).toLocaleString()}</p>
             </div>
        </div>
         
         <div className="pt-4">
            <TapAndHoldButton 
                label={language === 'bn' ? 'নিশ্চিত করতে ধরে রাখুন' : 'Hold to Confirm'} 
                onComplete={handleFinalTransaction} 
                isLoading={isLoading} 
            />
         </div>
         
         <button onClick={() => setStep('input')} className="w-full text-slate-400 font-bold text-[10px] uppercase py-4">
             {t('cancel')}
         </button>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t('sendMoneyTitle')} />
      <div className="p-6 pt-0">
        {error && (
            <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl mb-8 text-[11px] font-bold text-center uppercase tracking-widest">
                {error}
            </div>
        )}
        {step === 'input' ? renderInputScreen() : renderReviewScreen()}
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/')}
        title="সেন্ড মানি সফল"
        amount={parseFloat(amount)}
        recipient={recipient?.name}
      />
    </div>
  );
};

export default SendMoneyPage;
