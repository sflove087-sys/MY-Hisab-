
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import TapAndHoldButton from '../components/common/TapAndHoldButton';
import SuccessModal from '../components/common/SuccessModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { googleSheetService } from '../services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../types';
import PageHeader from '../components/common/PageHeader';
import { ArrowRightIcon, UserIcon, ScanIcon } from '../components/Icons';
import { safeStorage } from '../utils/storage';

interface Recipient {
  name: string;
  mobile: string;
}

const SendMoneyPage: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recentRecipients, setRecentRecipients] = useState<Recipient[]>([]);
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedRecents = safeStorage.getItem('recentRecipients');
      if (storedRecents) {
        setRecentRecipients(JSON.parse(storedRecents));
      }
    } catch (e) {
      console.error("Failed to load/parse recent recipients:", e);
      safeStorage.removeItem('recentRecipients');
    }
  }, []);

  const saveRecentRecipient = (recipient: Recipient) => {
    try {
      const updatedRecents = [recipient, ...recentRecipients.filter(r => r.mobile !== recipient.mobile)].slice(0, 5);
      setRecentRecipients(updatedRecents);
      safeStorage.setItem('recentRecipients', JSON.stringify(updatedRecents));
    } catch (e) {
      console.error("Failed to save recent recipients:", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const m = mobile.trim();
      if (m.length === 10) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(`0${m}`);
          if (result && 'error' in result) {
            setError('প্রাপক খুঁজে পাওয়া যায়নি');
            setRecipient(null);
          } else if (result && 'type' in result && result.type === UserType.AGENT) {
            setError('এজেন্ট নাম্বারে সেন্ড মানি করা যাবে না');
            setRecipient(null);
          } else if (result && 'name' in result) {
            setRecipient({ name: result.name, mobile: result.mobile });
          }
        } catch {
          setError('ভেরিফিকেশন এরর');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setRecipient(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [mobile]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recipient) {
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
    
    const enteredPin = String(pin).trim();
    const storedPin = String(user.password).padStart(4, '0');
    
    if (enteredPin.length !== 4) {
      setError('৪-সংখ্যার পিন দিন');
      return;
    }
    
    if (enteredPin !== storedPin) {
      setError('ভুল পিন। আবার চেষ্টা করুন।');
      return;
    }
    
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    if (!recipient) return;
    setIsLoading(true);
    try {
      const result = await googleSheetService.performSendMoney(user!.id, `0${mobile.trim()}`, parseFloat(amount));
      if (result && result.status === 'Success') {
        await refreshUser();
        saveRecentRecipient(recipient);
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || 'লেনদেন ব্যর্থ হয়েছে');
        setStep('input');
      }
    } catch (err) {
      setError('একটি ত্রুটি ঘটেছে');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectRecent = (recent: Recipient) => {
    setMobile(recent.mobile.slice(3)); 
  };

  const handleAutofillConfirm = () => {
    setIsAutofillModalOpen(false);
    // Simulated scan data
    setMobile('1700000000'); 
    setAmount('500');
  };

  const renderInputScreen = () => (
     <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
          <form onSubmit={handleProceedToReview} className="space-y-4">
            <div className="relative">
              <Input 
                id="mobile" 
                label={t('recipientMobile')} 
                type="tel" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
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
              {recipient && <p className="text-xs text-green-600 font-bold mt-1 px-1 tracking-tight">✓ {recipient.name}</p>}
            </div>
            
            {recentRecipients.length > 0 && !mobile && (
              <div className="pb-2">
                <p className="text-xs font-bold text-gray-400 dark:text-dark-subtext mb-2 px-1">{t('recentRecipients')}</p>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {recentRecipients.map(r => (
                    <button key={r.mobile} type="button" onClick={() => handleSelectRecent(r)} className="flex-shrink-0 px-3 py-2 bg-primary/5 dark:bg-primary/10 rounded-full text-primary text-xs font-bold text-left hover:bg-primary/20">
                      <p>{r.name}</p>
                      <p className="text-[10px] opacity-70">{r.mobile}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input 
              id="amount" 
              label={t('amount')} 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required 
            />
            {amount && recipient && (
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
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600"
                disabled={!pin || pin.length < 4}
            >
              পরবর্তী
            </button>
          </form>
      </div>
  );
  
  const renderReviewScreen = () => (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-dark-text">{t('confirmSendMoney')}</h2>
         
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
                <p className="text-xs font-bold text-gray-800 dark:text-dark-text truncate">{recipient?.name}</p>
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
                label="লেনদেন সম্পন্ন করতে ট্যাপ করে ধরে রাখুন" 
                onComplete={handleFinalTransaction} 
                isLoading={isLoading} 
            />
         </div>
         
         <button 
            onClick={() => setStep('input')}
            className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest pt-2"
         >
             {t('cancel')}
         </button>
      </div>
  );

  return (
    <div>
      <PageHeader title={t('sendMoneyTitle')} />
      <div className="p-4 pt-0">
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-4 text-xs text-center font-bold">
                {error}
            </div>
        )}
        {step === 'input' ? renderInputScreen() : renderReviewScreen()}
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/')}
        title="সেন্ড মানি সফল হয়েছে"
        amount={parseFloat(amount)}
        recipient={recipient?.name}
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

export default SendMoneyPage;
