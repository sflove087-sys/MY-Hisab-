
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import SuccessModal from '../components/common/SuccessModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import TapAndHoldButton from '../components/common/TapAndHoldButton';
import { googleSheetService } from '../services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { UserIcon, ArrowRightIcon, ScanIcon } from '../components/Icons';

const CashOutPage: React.FC = () => {
  const [agentMobile, setAgentMobile] = useState('');
  const [agentName, setAgentName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (agentMobile.length === 10) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(`0${agentMobile}`, 'Agent');
          if (result && 'name' in result) {
            setAgentName(result.name);
          } else {
            setError('এজেন্ট খুঁজে পাওয়া যায়নি।');
            setAgentName('');
          }
        } catch {
          setError('ভেরিফিকেশন এরর।');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setAgentName('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [agentMobile]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!agentName) {
      setError('সঠিক এজেন্ট নাম্বার দিন।');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!user || numericAmount <= 0) {
      setError('সঠিক পরিমাণ দিন।');
      return;
    }
    if (user.balance < numericAmount) {
      setError('পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }
    
    const enteredPin = String(pin).trim();
    const storedPin = String(user.password).padStart(4, '0');

    if (enteredPin.length !== 4 || enteredPin !== storedPin) {
      setError('ভুল পিন। আবার চেষ্টা করুন।');
      return;
    }
    
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    try {
      const result = await googleSheetService.performCashOut(user!.id, `0${agentMobile}`, parseFloat(amount));
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

  const handleAutofillConfirm = () => {
    setIsAutofillModalOpen(false);
    // Simulated scan data for an agent
    setAgentMobile('1800000000'); 
    setAmount('1000');
  };
  
  const renderInputScreen = () => (
     <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
      <p className="text-center text-gray-400 dark:text-dark-subtext text-[9px] font-bold uppercase tracking-widest -mt-4 mb-8">এজেন্টের মাধ্যমে টাকা উত্তোলন</p>
        <form onSubmit={handleProceedToReview} className="space-y-4">
          <div className="relative">
            <Input 
              id="agentMobile" 
              label={t('agentMobile')} 
              type="tel" 
              value={agentMobile} 
              onChange={(e) => setAgentMobile(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1XXXXXXXXX"
              required
              prefix="+880"
              maxLength={10}
            />
            <button 
                type="button"
                onClick={() => setIsAutofillModalOpen(true)}
                className="auto-fill-btn absolute right-4 top-[38px] p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all active:scale-90"
                title={t('scanQR')}
            >
                <ScanIcon className="w-5 h-5" />
            </button>
            {isVerifying && <div className="absolute right-14 bottom-4"><div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div></div>}
            {agentName && <p className="text-xs text-green-600 font-bold mt-1 px-1">✓ এজেন্ট: {agentName}</p>}
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
           {amount && agentName && (
              <div className="animate-in fade-in duration-300">
                <Input
                    id="pin"
                    label={t('enterPIN')}
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
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
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-dark-text">{t('confirmCashOut')}</h2>
         <div className="flex items-center justify-center space-x-2">
            <div className="w-1/3 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-2 mx-auto shadow-sm">
                    <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-dark-text truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400">{t('from')}</p>
            </div>
            
            <div className="w-10 h-10 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center border-4 border-gray-50 dark:border-dark-bg">
                <ArrowRightIcon className="w-5 h-5 text-gray-400"/>
            </div>
            
            <div className="w-1/3 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-2 mx-auto shadow-sm">
                    <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-dark-text truncate">{agentName}</p>
                <p className="text-[10px] text-gray-400">এজেন্ট</p>
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
              label="ক্যাশ আউট নিশ্চিত করুন" 
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
      <PageHeader title={t('personalCashOutTitle')} />
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
        title="ক্যাশ আউট সফল"
        amount={parseFloat(amount)}
        recipient={agentName}
      />

      <ConfirmationModal 
        isOpen={isAutofillModalOpen}
        onClose={() => setIsAutofillModalOpen(false)}
        onConfirm={handleAutofillConfirm}
        title={t('autofillTitle')}
        message={t('autofillMessage')}
      />
    </div>
  );
};

export default CashOutPage;
