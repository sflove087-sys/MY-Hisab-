
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import SuccessModal from '../components/common/SuccessModal';
import TapAndHoldButton from '../components/common/TapAndHoldButton';
import { googleSheetService } from '../services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { UserIcon, ArrowRightIcon } from '../components/Icons';

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
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerMobile.length === 10) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(`0${customerMobile}`, 'Personal');
          if ('name' in result) {
            setCustomerName(result.name);
          } else {
            setError('গ্রাহক খুঁজে পাওয়া যায়নি।');
            setCustomerName('');
          }
        } catch {
          setError('ভেরিফিকেশন এরর।');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setCustomerName('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customerMobile]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName) {
      setError('সঠিক গ্রাহক নাম্বার দিন।');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!user || numericAmount <= 0) {
      setError('সঠিক পরিমাণ দিন।');
      return;
    }
    if (user.balance < numericAmount) {
      setError('এজেন্টের পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }
    if (pin.length !== 4 || pin !== user?.password) {
      setError('ভুল পিন। আবার চেষ্টা করুন।');
      return;
    }
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    try {
      const result = await googleSheetService.performCashIn(user!.id, `0${customerMobile}`, parseFloat(amount));
      if (result && result.status === 'Success') {
        await refreshUser();
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || 'লেনদেন ব্যর্থ হয়েছে।');
        setStep('input');
      }
    } catch (err) {
      setError('একটি ত্রুটি ঘটেছে।');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputScreen = () => (
    <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
      <p className="text-center text-gray-400 dark:text-dark-subtext text-[9px] font-bold uppercase tracking-widest -mt-4 mb-8">গ্রাহকের অ্যাকাউন্টে টাকা জমা দিন</p>
      <form onSubmit={handleProceedToReview} className="space-y-4">
        <div className="relative">
          <Input 
            id="customerMobile" 
            label={t('customerMobile')} 
            type="tel" 
            value={customerMobile} 
            onChange={(e) => setCustomerMobile(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="1XXXXXXXXX"
            required
            prefix="+880"
            maxLength={10}
          />
          {isVerifying && <div className="absolute right-4 bottom-4"><div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div></div>}
          {customerName && <p className="text-xs text-green-600 font-bold mt-1 px-1">✓ গ্রাহক: {customerName}</p>}
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
        {amount && customerName && (
          <div className="animate-in fade-in duration-300">
            <Input
              id="pin"
              label={t('enterPIN')}
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              placeholder="••••"
              maxLength={4}
              inputMode="numeric"
            />
          </div>
        )}
        <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm disabled:bg-gray-300"
            disabled={!pin || pin.length < 4}
        >
          পরবর্তী
        </button>
      </form>
    </div>
  );
  
  const renderReviewScreen = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-dark-text">{t('confirmCashIn')}</h2>
        <div className="flex items-center justify-center space-x-2">
            {/* From Card */}
            <div className="w-1/3 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-2 mx-auto shadow-sm">
                    <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-dark-text truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400">এজেন্ট</p>
            </div>
            
            <div className="w-10 h-10 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center border-4 border-gray-50 dark:border-dark-bg">
                <ArrowRightIcon className="w-5 h-5 text-gray-400"/>
            </div>
            
            {/* To Card */}
            <div className="w-1/3 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-2 mx-auto shadow-sm">
                    <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-dark-text truncate">{customerName}</p>
                <p className="text-[10px] text-gray-400">{t('to')}</p>
            </div>
        </div>
        <div className="bg-white dark:bg-dark-surface p-5 rounded-3xl space-y-3 border border-gray-100 dark:border-dark-border">
          <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-dark-subtext">{t('amount')}</p>
              <p className="text-4xl font-black text-primary">৳{parseFloat(amount).toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 dark:border-dark-border pt-3 mt-3">
              <span className="text-sm font-bold text-gray-500 dark:text-dark-subtext">{t('newBalance')}</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">৳{(user!.balance - parseFloat(amount)).toLocaleString()}</span>
          </div>
        </div>
       <div className="pt-2">
          <TapAndHoldButton 
              label="ক্যাশ ইন নিশ্চিত করুন" 
              onComplete={handleFinalTransaction} 
              isLoading={isLoading} 
          />
       </div>
       <button 
          onClick={() => setStep('input')}
          className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest"
       >
           {t('cancel')}
       </button>
    </div>
  );

  return (
    <div>
      <PageHeader title={t('cashInTitle')} />
      <div className="p-4 pt-0">
          {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-6 text-xs text-center font-bold">
                  {error}
              </div>
          )}
        
        {step === 'input' ? renderInputScreen() : renderReviewScreen()}
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/')}
        title="ক্যাশ ইন সফল"
        amount={parseFloat(amount)}
        recipient={customerName}
      />
    </div>
  );
};

export default CashInPage;
