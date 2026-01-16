
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

const CashOutPage: React.FC = () => {
  const [agentMobile, setAgentMobile] = useState('');
  const [agentName, setAgentName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  const { user, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const numericAmount = parseFloat(amount || '0');
  const totalAmount = numericAmount; // Service charge removed

  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleanMobile = agentMobile.replace(/[^0-9]/g, '');
      if (cleanMobile.length === 11) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(cleanMobile, 'Agent');
          if (result && 'name' in result) {
            setAgentName(result.name);
          } else {
            setError(language === 'bn' ? 'সঠিক এজেন্ট নম্বর দিন' : 'Enter a valid agent number');
            setAgentName('');
          }
        } catch {
          setError(language === 'bn' ? 'সার্ভার ত্রুটি, আবার চেষ্টা করুন' : 'Server error, please try again');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setAgentName('');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [agentMobile, language]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!agentName) {
      setError(language === 'bn' ? 'প্রথমে একটি সঠিক এজেন্ট নম্বর দিন' : 'Please provide a valid agent number first');
      return;
    }

    if (numericAmount <= 0) {
      setError(language === 'bn' ? 'সঠিক পরিমাণ লিখুন' : 'Enter a valid amount');
      return;
    }
    
    if (user!.balance < totalAmount) {
      setError(language === 'bn' ? `পর্যাপ্ত ব্যালেন্স নেই` : `Insufficient balance`);
      return;
    }
    
    // Normalize PIN comparison
    const enteredPin = pin.trim();
    const storedPin = String(user?.password).padStart(4, '0');
    
    if (enteredPin !== storedPin) {
      setError(language === 'bn' ? 'ভুল পিন। আবার চেষ্টা করুন' : 'Incorrect PIN. Please try again');
      return;
    }
    
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await googleSheetService.performCashOut(user!.id, agentMobile, numericAmount);
      if (result && result.status === 'Success') {
        await refreshUser();
        setTransactionId(`TXN${Date.now().toString().slice(-8)}`);
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || (language === 'bn' ? 'লেনদেন ব্যর্থ হয়েছে' : 'Transaction failed'));
        setStep('input');
      }
    } catch (err) {
      setError(language === 'bn' ? 'একটি অজানা ত্রুটি ঘটেছে' : 'An unknown error occurred');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderInputScreen = () => (
     <div className="bg-white dark:bg-dark-surface p-8 rounded-[3rem] shadow-premium border border-slate-50 dark:border-dark-border animate-in fade-in duration-500">
        <form onSubmit={handleProceedToReview} className="space-y-6">
          <div className="relative">
            <Input 
              id="agentMobile" 
              label={t('agentMobile')} 
              type="tel" 
              value={agentMobile} 
              onChange={(e) => setAgentMobile(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="01XXXXXXXXX"
              required
              maxLength={11}
              className="text-center font-black"
              prefixIcon={<UserIcon className="w-5 h-5 text-primary/40" />}
            />
            {isVerifying && (
              <div className="absolute right-4 bottom-4">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
            {agentName && (
                <div className="flex items-center justify-center space-x-1.5 mt-2 py-1.5 px-4 bg-primary/5 rounded-full w-fit mx-auto border border-primary/10 animate-in zoom-in-95">
                    <CheckIcon className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[10px] text-primary font-black uppercase tracking-tight">{agentName}</p>
                </div>
            )}
          </div>

          <div className="space-y-1">
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
            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {language === 'bn' ? 'কোনো সার্ভিস চার্জ নেই' : 'No service charge'}
            </p>
          </div>
           
           {amount && agentName && (
              <div className="animate-in slide-in-from-top-2">
                <Input
                    id="pin"
                    label={t('pin')}
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    placeholder="••••"
                    maxLength={5}
                    inputMode="numeric"
                    className="text-center tracking-[0.6em] font-mono text-xl"
                />
              </div>
            )}

          <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-full transition-all active:scale-[0.97] uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 disabled:opacity-20 disabled:grayscale"
              disabled={!pin || pin.length < 4 || isVerifying || !agentName}
          >
            {language === 'bn' ? 'পরবর্তী' : 'NEXT'}
          </button>
        </form>
    </div>
  );

  const renderReviewScreen = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-dark-surface p-10 rounded-[3rem] border border-slate-50 dark:border-dark-border shadow-premium space-y-8">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'এজেন্ট' : 'AGENT'}</p>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase">{agentName}</h3>
                <p className="text-xs text-slate-500 font-mono tracking-wider">{agentMobile}</p>
            </div>

            <div className="pt-6 border-t border-dashed border-slate-100 dark:border-dark-border space-y-6">
                <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('amount')}</p>
                    <p className="text-5xl font-black text-primary tracking-tighter">৳{numericAmount.toLocaleString()}</p>
                </div>

                <div className="bg-slate-50 dark:bg-dark-bg/50 p-6 rounded-3xl space-y-3 border border-slate-100 dark:border-dark-border">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'চার্জ' : 'Charge'}</span>
                        <span className="text-slate-800 dark:text-white">৳0.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-dark-border">
                        <span className="text-primary font-black uppercase tracking-widest text-[10px]">{language === 'bn' ? 'সর্বমোট' : 'TOTAL'}</span>
                        <span className="text-xl font-black text-primary">৳{numericAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
       
       <div className="px-2">
          <TapAndHoldButton 
              label={language === 'bn' ? 'নিশ্চিত করতে ধরে রাখুন' : 'Hold to Confirm'} 
              onComplete={handleFinalTransaction} 
              isLoading={isLoading} 
          />
       </div>
       
       <button 
          onClick={() => setStep('input')} 
          className="w-full text-slate-400 font-black text-[10px] uppercase py-4 tracking-widest hover:text-primary transition-colors"
       >
          {t('cancel')}
       </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F2F3] dark:bg-dark-bg">
      <PageHeader title={t('personalCashOutTitle')} />
      <div className="p-6 pt-0 max-w-sm mx-auto">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-600 p-4 rounded-2xl mb-8 text-[11px] font-bold uppercase tracking-tight animate-in shake-in-1">
                {error}
            </div>
          )}
          {step === 'input' ? renderInputScreen() : renderReviewScreen()}
      </div>
      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => navigate('/')} 
        title={language === 'bn' ? "ক্যাশ আউট সফল" : "Cash Out Successful"} 
        amount={numericAmount} 
        recipient={agentName}
        transactionId={transactionId}
      />
    </div>
  );
};

export default CashOutPage;
