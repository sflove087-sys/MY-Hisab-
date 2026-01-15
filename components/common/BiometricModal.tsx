
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName?: string;
}

const BiometricModal: React.FC<BiometricModalProps> = ({ isOpen, onClose, onSuccess, userName }) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStatus('scanning');
      const timer = setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 800);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setStatus('idle');
    }
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-dark-surface w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
        {/* Decorative background pulse */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${status === 'success' ? 'bg-green-500' : 'bg-primary'}`}></div>

        <div className="relative z-10">
          <h2 className="text-xl font-black text-gray-800 dark:text-dark-text mb-2">
            {status === 'success' ? (userName ? `স্বাগতম, ${userName}` : 'সাফল্য!') : t('loginWithBiometrics')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-subtext mb-10">
            {status === 'scanning' ? 'আপনার আঙ্গুলের ছাপ পরীক্ষা করা হচ্ছে...' : status === 'success' ? 'প্রমাণীকরণ সফল হয়েছে' : 'দয়া করে অপেক্ষা করুন'}
          </p>

          <div className="relative w-32 h-32 mx-auto mb-10">
            {/* Pulsing rings */}
            {status === 'scanning' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20"></div>
                <div className="absolute inset-4 rounded-full border-2 border-primary animate-ping opacity-40 delay-300"></div>
              </>
            )}

            <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-500 transform ${status === 'success' ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/30' : 'bg-primary/10 border-2 border-primary/20'}`}>
              {status === 'success' ? (
                <svg className="w-16 h-16 text-white animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className={`w-16 h-16 text-primary transition-all duration-500 ${status === 'scanning' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c4.183 0 7.773 2.564 9.303 6.216m-6.918 10.29A10.014 10.014 0 0112 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-6.103m4.626 10.232a4.115 4.115 0 01-.461-1.929V11m5.22 10.125a9.991 9.991 0 005.466-4.417m-9.039 4.34A10.011 10.011 0 0112 21c-1.35 0-2.645-.268-3.829-.755" />
                </svg>
              )}
            </div>

            {/* Scanning line animation */}
            {status === 'scanning' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 rounded-full shadow-[0_0_15px_rgba(var(--color-primary-hsl),0.5)] animate-scan-line"></div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text font-bold text-sm tracking-widest uppercase"
          >
            {t('cancel')}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-line {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(128px); opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default BiometricModal;
