
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from './Button';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  isLoading: boolean;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [password, setPassword] = useState('');
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (password) {
      onConfirm(password);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] transition-all duration-300">
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl transform transition-transform duration-300 scale-100">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-dark-text">{t('confirm')}</h2>
        <p className="text-sm text-gray-500 dark:text-dark-subtext mb-6">{t('enterPIN')}</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 border-2 border-gray-100 dark:border-gray-700 rounded-xl dark:bg-dark-bg dark:text-white mb-8 text-center text-2xl tracking-[1em] focus:border-primary transition-colors outline-none"
          autoFocus
          placeholder="••••"
        />
        <div className="flex space-x-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 text-gray-500 dark:text-dark-subtext font-bold hover:bg-gray-50 dark:hover:bg-dark-bg rounded-xl transition-colors"
          >
            {t('cancel')}
          </button>
          <Button 
            onClick={handleConfirm} 
            isLoading={isLoading} 
            disabled={!password || isLoading}
            className="flex-[2]"
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
