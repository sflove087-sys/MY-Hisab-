
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { googleSheetService } from '../services/googleSheetService';
import Logo from '../components/Logo';

const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let processedMobile = mobile.trim();
    if (processedMobile.length === 10 && processedMobile.startsWith('1')) {
      processedMobile = `0${processedMobile}`;
    }

    if (!name || !email || processedMobile.length !== 11 || !processedMobile.startsWith('01')) {
      setError('Please fill all fields correctly.');
      return;
    }
    
    if (password.length !== 4) {
      setError(t('pinInvalid'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('pinMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await googleSheetService.signUpUser(name, processedMobile, email, password);
      if (result && result.status === 'Success') {
        alert('Sign up successful! Please log in.');
        navigate('/login');
      } else {
        setError(result?.error || 'Sign up failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary dark:bg-dark-bg">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-dark-text mb-6">{t('signUpTitle')}</h1>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
            
            <form onSubmit={handleSignUpSubmit}>
              <Input 
                  id="name" 
                  label={t('fullName')} 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe" 
                  required 
              />
              <Input 
                  id="mobile" 
                  label={t('mobileNumber')} 
                  type="tel" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)} 
                  placeholder="1XXXXXXXXX" 
                  required
                  prefix="+880"
                  maxLength={10}
              />
               <Input 
                  id="email" 
                  label={t('email')} 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="user@example.com" 
                  required 
              />
              <Input 
                  id="password" 
                  label={t('pin')} 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••" 
                  required 
                  maxLength={4}
                  inputMode="numeric"
              />
              <Input 
                  id="confirmPassword" 
                  label={t('confirmPIN')} 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••" 
                  required 
                  maxLength={4}
                  inputMode="numeric"
              />
              <Button type="submit" isLoading={isLoading} className="mt-4">{t('submit')}</Button>
            </form>

            <p className="text-center mt-6 text-sm">
              <Link to="/login" className="font-medium text-primary dark:text-primary-dark hover:underline">
                  {t('haveAccount')}
              </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;