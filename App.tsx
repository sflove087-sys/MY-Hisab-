
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import SendMoneyPage from './pages/SendMoneyPage';
import CashOutPage from './pages/CashOutPage';
import CashInPage from './pages/CashInPage';
import AgentCashOutPage from './pages/AgentCashOutPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import ChangePinPage from './pages/ChangePinPage';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import NotificationPanel from './components/NotificationPanel';
import ApproveRequestPage from './pages/ApproveRequestPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <MainApp />
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen font-sans bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text shadow-2xl flex flex-col relative overflow-x-hidden">
        {user && <Header onNotificationClick={() => setNotificationsOpen(true)} />}
        <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
        <main className="flex-grow pb-20">
          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/send-money" element={user ? <SendMoneyPage /> : <Navigate to="/login" />} />
            <Route path="/cash-out" element={user ? <CashOutPage /> : <Navigate to="/login" />} />
            <Route path="/cash-in" element={user ? <CashInPage /> : <Navigate to="/login" />} />
            <Route path="/agent-cash-out" element={user ? <AgentCashOutPage /> : <Navigate to="/login" />} />
            <Route path="/history" element={user ? <TransactionHistoryPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/change-password" element={user ? <ChangePinPage /> : <Navigate to="/login" />} />
            <Route path="/approve-request/:transactionId" element={user ? <ApproveRequestPage /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </main>
        {user && <BottomNav />}
      </div>
    </HashRouter>
  );
};

export default App;
