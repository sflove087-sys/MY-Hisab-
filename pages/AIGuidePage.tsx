
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Transaction } from '../types';
import { googleSheetService } from '../services/googleSheetService';
import { getGeminiService } from '../services/geminiService';
import Button from '../components/common/Button';
import { SparklesIcon } from '../components/Icons';

const AIGuidePage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        const userTransactions = await googleSheetService.getTransactionsForUser(user.id);
        setTransactions(userTransactions);
      }
    };
    fetchTransactions();
  }, [user]);

  const handleGetAdvice = async () => {
    setIsLoading(true);
    setError('');
    setAdvice('');
    try {
      // Get the service instance only when needed. This prevents startup crashes.
      const geminiService = getGeminiService();
      const generatedAdvice = await geminiService.getFinancialAdvice(transactions, language);
      setAdvice(generatedAdvice);
    } catch (err) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col items-center text-center space-y-2 mb-4">
        <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <SparklesIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text">{t('aiGuideTitle')}</h1>
        <p className="text-sm text-gray-500 dark:text-dark-subtext max-w-xs">{t('aiPrompt')}</p>
      </div>

      {!advice && (
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
          <Button onClick={handleGetAdvice} isLoading={isLoading}>
            {t('getAdvice')}
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-center font-medium">
          {error}
        </div>
      )}

      {advice && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border">
            <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-dark-text">
              {advice}
            </div>
          </div>
          
          <Button onClick={handleGetAdvice} isLoading={isLoading} className="bg-gray-100 !text-gray-500 hover:bg-gray-200 dark:bg-dark-surface dark:!text-dark-subtext shadow-none border border-gray-200 dark:border-dark-border">
            Regenerate Advice
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIGuidePage;
