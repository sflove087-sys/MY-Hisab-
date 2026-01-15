
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import SuccessModal from '../components/common/SuccessModal';
import TapAndHoldButton from '../components/common/TapAndHoldButton';
import { googleSheetService } from '../services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { UserIcon, ArrowRightIcon, CheckIcon } from '../components/Icons';

const CashInPage: React.FC = () => {
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerMobile.length === 11) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(customerMobile, 'Personal');
          if ('name' in result) {
            setCustomerName(result.name);
          } else {
            setError(language === 'bn' ? 'গ্রাহক খুঁজে পাওয়া যায়নি।' : 'Customer not found.');
            setCustomerName('');
          }
        } catch {
          setError(language === 'bn' ? 'ভেরিফিকেশন এরর।' : 'Verification error.');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setCustomerName('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customerMobile, language]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName) {
      setError(language === 'bn' ? 'সঠিক গ্রাহক নাম্বার দিন।' : 'Enter a valid customer number.');
      return;
    }

    if (!user || parseFloat(amount) <= 0) {
      setError(language === 'bn' ? 'সঠিক পরিমাণ দিন।' : 'Enter a valid amount.');
      return;
    }
    if (user.balance < parseFloat(amount)) {
      setError(language === 'bn' ? 'এজেন্টের পর্যাপ্ত ব্যালেন্স নেই।' : 'Insufficient balance.');
      return;
    }
    if (pin !== user?.password) {
      setError(language === 'bn' ? 'ভুল পিন। আবার চেষ্টা করুন।' : 'Incorrect PIN.');
      return;
    }
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    try {
      const result = await googleSheetService.performCashIn(user!.id, customerMobile, parseFloat(amount));
      if (result && result.status === 'Success') {
        await refreshUser();
        setIsSuccessModalOpen(true);
      } else {
        setError('Transaction failed.');
        setStep('input');
      }
    } catch (err) {
      setError('An error occurred.');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputScreen = () => (
    <div className="bg-white dark:bg-dark-surface p-8 rounded-[3rem] shadow-premium border border-slate-50 dark:border-dark-border">
      <form onSubmit={handleProceedToReview} className="space-y-6">
        <div className="relative">
          <Input 
            id="customerMobile" 
            label={t('customerMobile')} 
            type="tel" 
            value={customerMobile} 
            onChange={(e) => setCustomerMobile(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="01XXXXXXXXX"
            required
            maxLength={11}
            className="text-center font-black"
          />
          {customerName && (
              <div className="flex items-center justify-center space-x-1.5 mt-2 py-1 px-4 bg-primary/5 rounded-full w-fit mx-auto">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] text-primary font-black uppercase">গ্রাহক: {customerName}</p>
              </div>
          )}
        </div>

        <Input id="amount" label={t('amount')} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="text-center text-2xl font-black text-primary" />
        {amount && customerName && (
            <Input id="pin" label={t('pin')} type="password" value={pin} onChange={(e) => setPin(e.target.value)} required placeholder="••••" maxLength={4} inputMode="numeric" className="text-center tracking-[0.5em] font-mono text-xl" />
        )}
        <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-full uppercase tracking-widest text-xs shadow-lg disabled:bg-slate-200" disabled={!pin || pin.length < 4 || isVerifying}>
          পরবর্তী
        </button>
      </form>
    </div>
  );

  const renderReviewScreen = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
        <div className="bg-white dark:bg-dark-surface p-8 rounded-[3rem] shadow-premium space-y-8">
            <div className="text-center pb-4 border-b border-dashed border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('amount')}</p>
                <p className="text-4xl font-black text-primary">৳{parseFloat(amount).toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase">{t('newBalance')}</span>
                <span className="font-black text-slate-800 dark:text-white">৳{(user!.balance - parseFloat(amount)).toLocaleString()}</span>
            </div>
        </div>
        <TapAndHoldButton label="ক্যাশ ইন নিশ্চিত করুন" onComplete={handleFinalTransaction} isLoading={isLoading} />
        <button onClick={() => setStep('input')} className="w-full text-slate-400 font-black text-[10px] uppercase">{t('cancel')}</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF2F0] dark:bg-dark-bg">
      <PageHeader title={t('cashInTitle')} />
      <div className="p-6 pt-0 max-w-sm mx-auto">
          {error && <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-600 p-4 rounded-xl mb-8 text-[11px] font-bold uppercase">{error}</div>}
          {step === 'input' ? renderInputScreen() : renderReviewScreen()}
      </div>
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => navigate('/')} title="ক্যাশ ইন সফল" amount={parseFloat(amount)} recipient={customerName} />
    </div>
  );
};

export default CashInPage;
