
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { googleSheetService } from '../services/googleSheetService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ChangePinPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length !== 4) {
      setError(t('pinInvalid'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t('pinMismatch'));
      return;
    }
    if (!user) {
      setError('User not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await googleSheetService.changePassword(user.id, currentPassword, newPassword);
      if (result && result.status === 'Success') {
        logout();
        alert(t('pinChangedSuccess'));
        navigate('/login');
      } else {
        setError(result?.error || t('pinChangeFailed'));
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('changePinTitle')}</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow">
        <Input
          id="currentPassword"
          label={t('currentPin')}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          placeholder="••••"
          maxLength={4}
          inputMode="numeric"
        />
        <Input
          id="newPassword"
          label={t('newPin')}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="••••"
          maxLength={4}
          inputMode="numeric"
        />
        <Input
          id="confirmNewPassword"
          label={t('confirmNewPin')}
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
          placeholder="••••"
          maxLength={4}
          inputMode="numeric"
        />
        <Button type="submit" isLoading={isLoading} className="mt-4">
          {t('submit')}
        </Button>
      </form>
    </div>
  );
};

export default ChangePinPage;