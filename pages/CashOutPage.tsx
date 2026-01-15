
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
  const { user, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const chargeRate = 0.015;
  const calculatedCharge = parseFloat(amount || '0') * chargeRate;
  const totalAmount = parseFloat(amount || '0') + calculatedCharge;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (agentMobile.length === 11) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(agentMobile, 'Agent');
          if (result && 'name' in result) {
            setAgentName(result.name);
          } else {
            setError(language === 'bn' ? 'এজেন্ট খুঁজে পাওয়া যায়নি।' : 'Agent not found.');
            setAgentName('');
          }
        } catch {
          setError(language === 'bn' ? 'ভেরিফিকেশন এরর।' : 'Verification error.');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setAgentName('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [agentMobile, language]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!agentName) {
      setError(language === 'bn' ? 'সঠিক এজেন্ট নাম্বার দিন।' : 'Enter a valid agent number.');
      return;
    }

    if (!user || parseFloat(amount) <= 0) {
      setError(language === 'bn' ? 'সঠিক পরিমাণ দিন।' : 'Enter a valid amount.');
      return;
    }
    
    if (user.balance < totalAmount) {
      setError(language === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই (চার্জসহ)।' : 'Insufficient balance.');
      return;
    }
    
    if (String(pin).trim() !== String(user.password).padStart(4, '0')) {
      setError(language === 'bn' ? 'ভুল পিন। আবার চেষ্টা করুন।' : 'Incorrect PIN. Try again.');
      return;
    }
    
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    try {
      const result = await googleSheetService.performCashOut(user!.id, agentMobile, parseFloat(amount));
      if (result && result.status === 'Success') {
        await refreshUser();
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || 'Transaction failed.');
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
            />
            {agentName && (
                <div className="flex items-center justify-center space-x-1.5 mt-2 py-1 px-4 bg-primary/5 rounded-full w-fit mx-auto">
                    <CheckIcon className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[10px] text-primary font-black uppercase">এজেন্ট: {agentName}</p>
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
            className="text-center text-2xl font-black text-primary"
          />
           
           {amount && agentName && (
              <Input
                  id="pin"
                  label={t('pin')}
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  className="text-center tracking-[0.5em] font-mono text-xl"
              />
            )}

          <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-full transition-all uppercase tracking-widest text-[11px] shadow-lg disabled:bg-slate-200"
              disabled={!pin || pin.length < 4 || isVerifying}
          >
            {language === 'bn' ? 'পরবর্তী' : 'NEXT'}
          </button>
        </form>
    </div>
  );

  const renderReviewScreen = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-dark-surface p-8 rounded-[3rem] border border-slate-50 shadow-premium space-y-6">
            <div className="text-center pb-4 border-b border-dashed border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('amount')}</p>
                <p className="text-4xl font-black text-primary">৳{parseFloat(amount).toLocaleString()}</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">{language === 'bn' ? 'চার্জ' : 'Charge'}</span>
                    <span className="font-black text-slate-800 dark:text-white">৳{calculatedCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-50 font-black">
                    <span className="text-primary uppercase tracking-widest text-[10px]">{language === 'bn' ? 'সর্বমোট' : 'TOTAL'}</span>
                    <span className="text-xl text-primary">৳{totalAmount.toLocaleString()}</span>
                </div>
            </div>
        </div>
       
       <TapAndHoldButton 
          label={language === 'bn' ? 'নিশ্চিত করতে ধরে রাখুন' : 'Hold to Confirm'} 
          onComplete={handleFinalTransaction} 
          isLoading={isLoading} 
       />
       
       <button onClick={() => setStep('input')} className="w-full text-slate-400 font-black text-[10px] uppercase py-2">{t('cancel')}</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF2F0] dark:bg-dark-bg">
      <PageHeader title={t('personalCashOutTitle')} />
      <div className="p-6 pt-0 max-w-sm mx-auto">
          {error && <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-600 p-4 rounded-xl mb-8 text-[11px] font-bold uppercase">{error}</div>}
          {step === 'input' ? renderInputScreen() : renderReviewScreen()}
      </div>
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => navigate('/')} title="ক্যাশ আউট সফল" amount={parseFloat(amount)} recipient={agentName} />
    </div>
  );
};

export default CashOutPage;
