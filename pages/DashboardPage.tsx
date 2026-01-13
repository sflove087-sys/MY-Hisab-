
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PersonalDashboard from '../components/dashboard/PersonalDashboard';
import AgentDashboard from '../components/dashboard/AgentDashboard';
import { UserType } from '../types';

const DashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  useEffect(() => {
    // Refresh user data on initial load of the dashboard
    // to ensure balance and other info is up-to-date.
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    // This should ideally not happen due to the routing logic,
    // but it's a good safeguard.
    return null; 
  }

  return user.type === UserType.PERSONAL ? <PersonalDashboard /> : <AgentDashboard />;
};

export default DashboardPage;
