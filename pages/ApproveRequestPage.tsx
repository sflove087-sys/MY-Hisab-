
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { googleSheetService } from '../services/googleSheetService';
import { Transaction } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import PinModal from '../components/common/PinModal';
import SuccessModal from '../components/common/SuccessModal';

const ApproveRequestPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        setError('Invalid transaction ID.');
        setIsLoading(false);
        return;
      }
      try {
        const tx = await googleSheetService.getTransactionById(transactionId);
        if (tx && tx.from === user?.id) {
          setTransaction(tx);
        } else {
          setError('Transaction not found or you are not authorized.');
        }
      } catch (err) {
        setError('Failed to fetch transaction details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, user]);

  const handleReject = async () => {
    if (!transaction) return;
    setIsActionLoading(true);
    setError('');
    try {
      const result = await googleSheetService.rejectCashOutRequest(user!.id, transaction.id);
      if (result?.status === 'Success') {
        setSuccessMessage('অনুরোধটি বাতিল করা হয়েছে।');
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || 'Failed to reject request.');
      }
    } catch (err) {
      setError('An error occurred while rejecting.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApprove = async (pin: string) => {
    if (!transaction) return;
    setIsActionLoading(true);
    setError('');
    try {
      const result = await googleSheetService.approveCashOutRequest(user!.id, transaction.id, pin);
      if (result?.status === 'Success') {
        await refreshUser();
        setIsPinModalOpen(false);
        setSuccessMessage('ক্যাশ আউট সফল হয়েছে!');
        setIsSuccessModalOpen(true);
      } else {
        setError(result?.error || 'Failed to approve request.');
        setIsPinModalOpen(false);
      }
    } catch (err) {
      setError('An error occurred during approval.');
       setIsPinModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
  }
  
  if (!transaction) {
    return (
      <div>
        <PageHeader title={t('cashOutRequest')} />
        <p className="text-center text-red-500 p-8">{error || 'Transaction not found.'}</p>
      </div>
    );
  }

  const isCompleted = transaction.status === 'Success' || transaction.status === 'Rejected' || transaction.status === 'Failed';

  return (
    <div>
      <PageHeader title={t('cashOutRequest')} />
      <div className="p-4 pt-0">
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-dark-subtext">এজেন্ট</p>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">{transaction.toName}</h2>
            <p className="text-sm text-gray-500 dark:text-dark-subtext mt-4">আপনাকে ক্যাশ আউট করার জন্য অনুরোধ করছে</p>
            <p className="text-5xl font-black text-primary my-4">৳{transaction.amount.toLocaleString()}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl my-4 text-xs text-center font-bold">
              {error}
            </div>
          )}

          {isCompleted ? (
            <div className="mt-6 text-center">
                <p className={`text-lg font-bold ${transaction.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>
                    This request is already {transaction.status}.
                </p>
            </div>
          ) : (
            <div className="mt-8 flex space-x-3">
              <Button onClick={handleReject} isLoading={isActionLoading} className="flex-1 bg-red-50 !text-red-500 hover:!bg-red-100 dark:bg-red-900/20 dark:!text-red-400 dark:hover:!bg-red-900/40 shadow-none">
                {t('reject')}
              </Button>
              <Button onClick={() => setIsPinModalOpen(true)} isLoading={isActionLoading} className="flex-[2]">
                {t('approve')}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handleApprove}
        isLoading={isActionLoading}
      />
      
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/')}
        title={successMessage}
        amount={transaction.status === 'Success' ? transaction.amount : undefined}
        recipient={transaction.status === 'Success' ? transaction.toName : undefined}
        transactionId={transaction.id}
      />
    </div>
  );
};

export default ApproveRequestPage;
