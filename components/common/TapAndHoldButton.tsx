
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
  const completedRef = useRef(false);
  const { t } = useLanguage();

  const HOLD_DURATION = 2200; // 2.2 seconds for a deliberate feel

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isLoading && completedRef.current) {
      completedRef.current = false;
      setProgress(0);
    }
  }, [isLoading]);

  const startHolding = () => {
    if (isLoading || isHolding) return;
    
    completedRef.current = false;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100 && !completedRef.current) {
        completedRef.current = true;
        cleanupTimer();
        // Visual "pop" on completion
        const vibrate = window.navigator.vibrate;
        if (vibrate) vibrate([50, 30, 50]);
        onComplete();
        setIsHolding(false);
      }
    }, 16); // ~60fps
  };

  const stopHolding = () => {
    setIsHolding(false);
    cleanupTimer();
    if (!completedRef.current) {
        setProgress(0);
    }
  };

  useEffect(() => {
    return () => cleanupTimer();
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
        className={`w-full h-16 bg-gray-100 dark:bg-dark-surface rounded-[1.5rem] overflow-hidden relative transition-all duration-300 active:scale-[0.96] shadow-inner-sm border border-gray-200 dark:border-dark-border ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Futuristic Grid Background Layer */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        {/* The Filling "Liquid" Layer */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary to-orange-400 transition-all duration-75 ease-out shadow-[0_0_30px_rgba(241,77,35,0.4)]"
          style={{ width: `${progress}%` }}
        >
            {/* Animated Light Sheen on progress head */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/30 blur-md skew-x-12 animate-pulse"></div>
            
            {/* Bubble Particles (Simulated with simple spans) */}
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 ${isHolding ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-1 h-1 bg-white rounded-full animate-ping [animation-duration:1s]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping [animation-duration:1.5s]"></div>
            </div>
        </div>
        
        {/* Scanning Line (Active when holding) */}
        {isHolding && (
            <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-20 shadow-[0_0_15px_#fff]"
                style={{ left: `${progress}%` }}
            ></div>
        )}

        {/* Content Container */}
        <div className="absolute inset-0 flex items-center justify-between px-6 z-30 pointer-events-none">
            <div className="flex flex-col items-start">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${progress > 50 ? 'text-white' : 'text-primary'}`}>
                   {isLoading ? t('loading') : (isHolding ? 'নিশ্চিত হচ্ছে...' : label)}
                </span>
                {isHolding && progress < 100 && (
                     <span className="text-[7px] font-bold text-white/70 uppercase tracking-widest animate-pulse mt-0.5">
                        ধরে রাখুন... {Math.round(progress)}%
                     </span>
                )}
            </div>

            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${progress > 85 ? 'bg-white text-primary rotate-12 scale-110 shadow-lg' : 'bg-primary/10 text-primary'}`}>
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className={`w-6 h-6 ${isHolding ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c4.183 0 7.773 2.564 9.303 6.216m-6.918 10.29A10.014 10.014 0 0112 21c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-6.103m4.626 10.232a4.115 4.115 0 01-.461-1.929V11m5.22 10.125a9.991 9.991 0 005.466-4.417m-9.039 4.34A10.011 10.011 0 0112 21c-1.35 0-2.645-.268-3.829-.755" />
                    </svg>
                )}
            </div>
        </div>
      </button>
      
      {/* Floating Instructions Tooltip */}
      {isHolding && progress < 100 && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-[8px] font-black rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 duration-300 uppercase tracking-widest flex items-center space-x-2 border border-white/10">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              <span>বাতিল করতে ছেড়ে দিন</span>
          </div>
      )}

      {/* Finishing Celebration Sparkle (Hidden by default) */}
      {progress === 100 && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
               <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes liquid-fill {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          50% { border-radius: 60% 40% 30% 70% / 50% 60% 50% 40%; }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        }
      `}} />
    </div>
  );
};

export default TapAndHoldButton;
