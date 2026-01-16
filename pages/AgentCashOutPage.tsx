
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import SuccessModal from '../components/common/SuccessModal';
import { googleSheetService } from '../services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';

const AgentCashOutPage: React.FC = () => {
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerMobile.length === 11) {
        setIsVerifying(true);
        setError('');
        try {
          const result = await googleSheetService.getUserByMobile(customerMobile, 'Personal');
          if (result && 'name' in result) {
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

  const handleProceed = (e: React.FormEvent) => {
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
    
    setStep('review');
  };

  const handleFinalTransaction = async () => {
    setIsLoading(true);
    try {
      const result = await googleSheetService.requestAgentCashOut(user!.id, customerMobile, parseFloat(amount));
      if (result && result.status === 'Success') {
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

  return (
    <div>
      <PageHeader title={t('agentCashOutTitle')} />
      <div className="p-4 pt-0">
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
          <p className="text-center text-gray-400 dark:text-dark-subtext text-[9px] font-bold uppercase tracking-widest -mt-4 mb-8">গ্রাহকের ক্যাশ আউট অনুরোধ প্রসেস করুন</p>
          
          {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-6 text-xs text-center font-bold">
                  {error}
              </div>
          )}

          {step === 'input' && (
            <form onSubmit={handleProceed} className="space-y-4">
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
                />
                {isVerifying && <div className="absolute right-4 bottom-4"><div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div></div>}
                {customerName && <p className="text-xs text-primary font-bold mt-1 px-1">✓ গ্রাহক: {customerName}</p>}
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
          
          {step === 'review' && (
            <div className="space-y-8">
               <div className="bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl space-y-4 border border-gray-100 dark:border-dark-border shadow-inner">
                  <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400 dark:text-dark-subtext">গ্রাহক</span>
                      <div className="text-right">
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{customerName}</p>
                          <p className="text-xs text-gray-400 dark:text-dark-subtext">{customerMobile}</p>
                      </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 dark:border-dark-border pt-4">
                      <span className="text-sm font-bold text-gray-400 dark:text-dark-subtext">উত্তোলনের পরিমাণ</span>
                      <span className="text-xl font-black text-rose-600">৳{parseFloat(amount).toLocaleString()}</span>
                  </div>
               </div>
               
               <div className="pt-4">
                  <Button 
                      onClick={handleFinalTransaction}
                      isLoading={isLoading} 
                  >
                      অনুরোধ পাঠান
                  </Button>
               </div>
               
               <button 
                  onClick={() => setStep('input')}
                  className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest"
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
        title={t('requestSent')}
        message={t('requestSentMessage')}
      />
    </div>
  );
};

export default AgentCashOutPage;
