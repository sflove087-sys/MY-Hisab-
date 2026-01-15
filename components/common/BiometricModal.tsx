
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
  const [status, setStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStatus('scanning');
      
      // Step 1: Scanning Phase
      const scanTimer = setTimeout(() => {
        setStatus('verifying');
        
        // Step 2: Verification Phase
        const verifyTimer = setTimeout(() => {
          setStatus('success');
          
          // Step 3: Closing/Success Callback
          const successTimer = setTimeout(() => {
            onSuccess();
          }, 600);
          return () => clearTimeout(successTimer);
        }, 1500); // Increased time for a more "secure" feel
        return () => clearTimeout(verifyTimer);
      }, 1800);
      
      return () => clearTimeout(scanTimer);
    } else {
      setStatus('idle');
    }
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[300] p-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-dark-surface w-full max-w-xs rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-20 duration-500 text-center relative overflow-hidden border border-white/10">
        
        {/* Verification Status Light */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full transition-colors duration-500 ${status === 'success' ? 'bg-green-500 shadow-[0_4px_12px_rgba(34,197,94,0.5)]' : status === 'verifying' ? 'bg-primary' : 'bg-gray-200'}`}></div>

        <div className="relative z-10">
          <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mb-2 animate-pulse">
            {status === 'scanning' ? 'Processing Scan...' : status === 'verifying' ? 'Authenticating Identity...' : 'Access Granted'}
          </p>
          
          <h2 className="text-xl font-black text-gray-800 dark:text-dark-text mb-10 leading-tight">
            {status === 'success' ? (userName ? `স্বাগতম, ${userName}` : 'সাফল্য!') : t('loginWithBiometrics')}
          </h2>

          <div className="relative w-40 h-40 mx-auto mb-12">
            {/* Face ID Corner Brackets Simulation */}
            <div className={`absolute inset-0 border-2 border-primary/20 rounded-[2rem] transition-all duration-700 ${status === 'scanning' ? 'scale-110 opacity-100' : 'scale-100 opacity-40'}`}>
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
            </div>

            {/* Core Scanner Ring */}
            <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-700 transform ${status === 'success' ? 'bg-green-500 scale-100 rotate-0' : 'bg-gray-50 dark:bg-dark-bg/50 border-2 border-dashed border-gray-200 dark:border-dark-border'}`}>
              {status === 'success' ? (
                <svg className="w-20 h-20 text-white animate-in zoom-in spin-in-90 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="relative">
                    <svg className={`w-20 h-20 text-primary transition-all duration-500 ${status === 'scanning' ? 'animate-pulse scale-110' : status === 'verifying' ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c4.183 0 7.773 2.564 9.303 6.216m-6.918 10.29A10.014 10.014 0 0112 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-6.103m4.626 10.232a4.115 4.115 0 01-.461-1.929V11m5.22 10.125a9.991 9.991 0 005.466-4.417m-9.039 4.34A10.011 10.011 0 0112 21c-1.35 0-2.645-.268-3.829-.755" />
                    </svg>
                    {status === 'verifying' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
              )}
            </div>

            {/* Laser Line Effect */}
            {status === 'scanning' && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/60 rounded-full shadow-[0_0_20px_rgba(var(--color-primary-hsl),0.8)] animate-scan-line-v2 z-20"></div>
            )}
          </div>

          <p className="text-[10px] text-gray-400 dark:text-dark-subtext mb-6 font-bold uppercase tracking-tight">
            {status === 'success' ? 'Identity Secured' : 'Simulating Device-Level Security'}
          </p>

          <button 
            onClick={onClose}
            className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-dark-text font-black tracking-[0.3em] uppercase transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-line-v2 {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(160px); opacity: 0; }
        }
        .animate-scan-line-v2 {
          animation: scan-line-v2 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}} />
    </div>
  );
};

export default BiometricModal;
