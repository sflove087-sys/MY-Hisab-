
import React from 'react';
import { User, UserType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SimInfoCardProps {
  user: User;
}

const SimInfoCard: React.FC<SimInfoCardProps> = ({ user }) => {
  const { language } = useLanguage();
  const { designStyle } = useTheme();

  const isAgent = user.type === UserType.AGENT;

  return (
    <div className="relative w-full aspect-[1.58/1] rounded-[2.2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] group transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] border border-white/20 select-none">
      
      {/* 1. LAYER: Base Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ${
        isAgent 
        ? 'from-[#1e293b] via-[#0f172a] to-[#020617]' 
        : 'from-primary via-primary/90 to-orange-700'
      }`}>
        {/* Animated Light Orbs */}
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-black/30 rounded-full blur-[80px]"></div>
      </div>
      
      {/* 2. LAYER: Geometric Circuit Pattern */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 10h20v20h-20z M50 50h10 M70 10v40 M10 70h60" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="10" cy="10" r="1.5" fill="white"/>
            <circle cx="30" cy="30" r="1.5" fill="white"/>
            <circle cx="70" cy="50" r="1.5" fill="white"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>
      </div>
      
      {/* 3. LAYER: Matte Texture (Noise) */}
      <div className="absolute inset-0 opacity-[0.2] mix-blend-soft-light pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* 4. LAYER: Interactive Gloss/Sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-40 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

      {/* CONTENT CONTAINER */}
      <div className="relative h-full p-7 flex flex-col justify-between text-white z-10">
        
        {/* Top Header: Brand & Security */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 shadow-sm">
                    <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tighter drop-shadow-md leading-none">আমার ক্যাশ</h3>
                    <p className="text-[6px] font-black uppercase tracking-[0.4em] opacity-50 mt-1">Digital Wallet Identity</p>
                </div>
            </div>
          </div>
          
          {/* Holographic Security Seal */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/10 via-white/40 to-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/40 via-purple-500/40 to-yellow-500/40 animate-spin-slow"></div>
             <svg className="w-5 h-5 text-white/80 mix-blend-overlay" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
             </svg>
          </div>
        </div>

        {/* Center: Chip & Tech Icons */}
        <div className="flex items-center space-x-5">
          {/* Pro Metallic EMV Chip */}
          <div className={`w-14 h-10 rounded-lg border shadow-inner relative overflow-hidden p-1.5 grid grid-cols-3 gap-0.5 ${isAgent ? 'from-yellow-200 via-yellow-500 to-yellow-600 border-yellow-300/50' : 'from-gray-200 via-gray-400 to-gray-600 border-gray-100/50'} bg-gradient-to-br`}>
             <div className="border-r border-b border-black/10"></div>
             <div className="border-b border-black/10"></div>
             <div className="border-l border-b border-black/10"></div>
             <div className="border-r border-black/10"></div>
             <div className="bg-black/5 rounded-sm"></div>
             <div className="border-l border-black/10"></div>
             <div className="border-r border-t border-black/10"></div>
             <div className="border-t border-black/10"></div>
             <div className="border-l border-t border-black/10"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
          </div>

          <div className="flex flex-col space-y-1 opacity-40">
             <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.111 16.404a5.5 5.5 0 010-7.758M11.91 18.572a8.5 8.5 0 010-11.5" />
             </svg>
             <p className="text-[5px] font-black uppercase tracking-widest text-center">NFC Ready</p>
          </div>
        </div>

        {/* Info Area */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-50 mb-1.5 flex items-center">
                <span className="w-1 h-1 bg-white rounded-full mr-2 opacity-50"></span>
                {language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
            </p>
            <span className="text-2xl font-mono font-bold tracking-[0.18em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {user.mobile.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')}
            </span>
          </div>

          <div className="flex justify-between items-end pt-2">
            <div className="flex flex-col">
               <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">
                 {language === 'bn' ? 'অ্যাকাউন্ট হোল্ডার' : 'Account Holder'}
               </p>
               <h2 className="text-sm font-bold tracking-widest uppercase truncate max-w-[160px] border-l-2 border-white/20 pl-3">
                 {user.name}
               </h2>
            </div>

            <div className="flex flex-col items-end">
               <div className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border backdrop-blur-xl ${isAgent ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-white/10 text-white border-white/20'}`}>
                  {isAgent ? 'Platinum Agent' : 'Premium Member'}
               </div>
               <p className="text-[6px] opacity-30 mt-1.5 uppercase font-bold tracking-tighter">Verified Identity</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Brand Watermark */}
      <div className="absolute -bottom-6 -right-6 text-9xl font-black text-white/5 pointer-events-none italic select-none">
        ৳
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}} />
    </div>
  );
};

export default SimInfoCard;
