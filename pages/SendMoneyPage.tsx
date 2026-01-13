
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

const SendMoneyPage: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'input' | 'pin' | 'review'>('input');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const m = mobile.trim();
      if (m.length === 10) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(`0${m}`);
          if ('error' in result) {
            setError('প্রাপক খুঁজে পাওয়া যায়নি');
            setRecipientName('');
          } else if (result.type === UserType.AGENT) {
            setError('এজেন্ট নাম্বারে সেন্ড মানি করা যাবে না');
            setRecipientName('');
          } else {
            setRecipientName(result.name);
          }
        } catch {
          setError('ভেরিফিকেশন এরর');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setRecipientName('');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [mobile]);

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recipientName) {
      setError('সঠিক পার্সোনাল নাম্বার দিন');
      return;
    }
    
    const numericAmount = parseFloat(amount);
    if (!user || numericAmount <= 0) {
      setError('সঠিক পরিমাণ দিন');
      return;
    }
    if (user.balance < numericAmount) {
      setError('পর্যাপ্ত ব্যালেন্স নেই');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pin !== user?.password) {
      setError('ভুল পিন। আবার চেষ্টা করুন।');
      return;
    }
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    try {
      const result = await googleSheetService.performSendMoney(user!.id, `0${mobile.trim()}`, parseFloat(amount));
      if (result && result.status === 'Success') {
        await refreshUser();
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || 'লেনদেন ব্যর্থ হয়েছে');
        setStep('input'); // Go back to start on failure
      }
    } catch (err) {
      setError('একটি ত্রুটি ঘটেছে');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={t('sendMoneyTitle')} />
      <div className="p-4 pt-0">
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
          <p className="text-center text-gray-400 dark:text-dark-subtext text-[9px] font-bold uppercase tracking-widest -mt-4 mb-8">পার্সোনাল থেকে পার্সোনাল লেনদেন</p>
          
          {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-6 text-xs text-center font-bold">
                  {error}
              </div>
          )}

          {step === 'input' && (
            <form onSubmit={handleProceed} className="space-y-4">
              <div className="relative">
                <Input 
                  id="mobile" 
                  label={t('recipientMobile')} 
                  type="tel" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="1XXXXXXXXX"
                  required
                  prefix="+880"
                  maxLength={10}
                />
                {isVerifying && <div className="absolute right-4 bottom-4"><div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div></div>}
                {recipientName && <p className="text-xs text-green-600 font-bold mt-1 px-1 tracking-tight">✓ {recipientName}</p>}
              </div>
              <Input 
                id="amount" 
                label={t('amount')} 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required 
              />
              <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                পরবর্তী
              </button>
            </form>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-dark-subtext">প্রাপক: <span className="font-bold text-gray-800 dark:text-dark-text">{recipientName}</span></p>
                  <p className="text-3xl font-black text-primary">৳{parseFloat(amount).toLocaleString()}</p>
              </div>
              <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-dark-bg border-2 border-gray-100 dark:border-dark-border rounded-xl mb-4 text-center text-2xl tracking-[1em] focus:border-primary transition-colors outline-none"
                  autoFocus
                  maxLength={4}
                  placeholder="••••"
                  inputMode="numeric"
              />
              <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                নিশ্চিত করুন
              </button>
              <button 
                  onClick={() => setStep('input')}
                  className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest pt-2"
              >
                   ফিরে যান
              </button>
            </form>
          )}
          
          {step === 'review' && (
            <div className="space-y-8">
               <div className="bg-gray-50 dark:bg-dark-bg p-5 rounded-3xl space-y-3 border border-gray-100 dark:border-dark-border">
                  <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400 dark:text-dark-subtext">প্রাপক</span>
                      <div className="text-right">
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{recipientName}</p>
                          <p className="text-xs text-gray-400 dark:text-dark-subtext">+880 {mobile}</p>
                      </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-dark-border pt-3">
                      <span className="text-sm font-bold text-gray-400 dark:text-dark-subtext">পরিমাণ</span>
                      <span className="text-lg font-black text-primary">৳{parseFloat(amount).toLocaleString()}</span>
                  </div>
               </div>
               
               <div className="pt-4">
                  <TapAndHoldButton 
                      label="লেনদেন সম্পন্ন করতে ট্যাপ করে ধরে রাখুন" 
                      onComplete={handleFinalTransaction} 
                      isLoading={isLoading} 
                  />
               </div>
               
               <button 
                  onClick={() => setStep('input')}
                  className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest pt-2"
               >
                   বাতিল করুন
               </button>
            </div>
          )}
        </div>
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/')}
        title="সেন্ড মানি সফল হয়েছে"
        amount={parseFloat(amount)}
        recipient={recipientName}
      />
    </div>
  );
};

export default SendMoneyPage;
