
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TapAndHoldButtonProps {
  onComplete: () => void;
  isLoading?: boolean;
  label: string;
}

const TapAndHoldButton: React.FC<TapAndHoldButtonProps> = ({ onComplete, isLoading, label }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const { t } = useLanguage();

  const HOLD_DURATION = 2000; // 2 seconds

  const startHolding = () => {
    if (isLoading) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        onComplete();
        setIsHolding(false);
      }
    }, 20);
  };

  const stopHolding = () => {
    setIsHolding(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Smooth reset
    const currentProgress = progress;
    if (currentProgress < 100) {
        setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full relative select-none">
      <button
        onMouseDown={startHolding}
        onMouseUp={stopHolding}
        onMouseLeave={stopHolding}
        onTouchStart={startHolding}
        onTouchEnd={stopHolding}
        disabled={isLoading}
        className={`w-full h-14 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden relative transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Progress Fill Background */}
        <div 
          className="absolute top-0 left-0 h-full bg-primary/20 dark:bg-primary-dark/20 transition-all ease-out"
          style={{ width: `${progress}%` }}
        ></div>
        
        {/* The Animated "Sun" Icon moving from left to right */}
        <div 
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg transition-all ease-linear z-20"
            style={{ 
              left: `calc(${progress}% - 16px)`, // 16px is half of the icon's width (w-8 -> 2rem -> 32px)
              opacity: progress > 0 ? 1 : 0.3,
            }}
        >
            <svg className="w-5 h-5 text-white animate-spin-slow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.243 3.05a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-3.05 4.243a1 1 0 110 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-4.243-3.05a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm3.05-4.243a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM10 7a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
            </svg>
        </div>

        {/* The Full Width Shimmer Path */}
        <div className="absolute inset-0 bg-primary/5 rounded-full"></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isLoading ? (
            <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-bold text-primary dark:text-primary-dark text-[10px]">{t('loading')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
                <span className={`text-[10px] font-black tracking-tight ${progress > 80 ? 'opacity-0' : 'text-primary'}`}>
                    {label}
                </span>
            </div>
          )}
        </div>
      </button>
      
      {isHolding && progress < 100 && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] py-1 px-3 rounded-full animate-bounce font-bold tracking-widest uppercase shadow-xl z-50">
              বাতিল করতে ছেড়ে দিন
          </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
};

export default TapAndHoldButton;
