
import { User, UserType, Transaction, TransactionType, TransactionStatus } from '../types';

const GOOGLE_SHEET_API_URL: string = 'https://script.google.com/macros/s/AKfycbx6n0NmzUbrMBk9X9tL3Dwnh1iH1TOCtrV7Z1vBFXyuc1kbg2H1t4o7nQzm98Da-eQP/exec';

class GoogleSheetService {

  private async apiFetch(params: Record<string, string | number>): Promise<any> {
    const url = new URL(GOOGLE_SHEET_API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: {
            'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      if (data && typeof data === 'object' && 'error' in data) {
          throw new Error(data.error);
      }
      return data;
    } catch (error: any) {
      console.error('API Fetch Detailed Error:', error);
      // Re-throw a more user-friendly error if it's a network failure
      if (error.message === 'Failed to fetch') {
          throw new Error('Network error: Please check your internet connection or the API service status.');
      }
      throw error;
    }
  }

  async loginUser(identifier: string, password: string): Promise<User | null> {
    return this.apiFetch({ action: 'login', email: identifier, password });
  }
  
  async signUpUser(name: string, mobile: string, email: string, password: string): Promise<{status: string; error?: string; user?: User} | null> {
    return this.apiFetch({ action: 'addUser', name, mobile, email, password });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.apiFetch({ action: 'getUserById', id });
  }

  async getUserByMobile(mobile: string, type?: string): Promise<User | { error: string }> {
    return this.apiFetch({ action: 'getUserByMobile', mobile, type: type || '' });
  }
  
  async getTransactionsForUser(userId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.apiFetch({ action: 'getTransactionsForUser', userId });
      return transactions || [];
    } catch (e) {
      console.warn("Failed to fetch user transactions, returning empty array:", e);
      return [];
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    return this.apiFetch({ action: 'getTransactionById', transactionId });
  }

  async performSendMoney(fromUserId: string, toMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'performSendMoney', fromUserId, toMobile, amount });
  }
  
  async performCashOut(fromUserId: string, agentMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    // Ensure amount is a precise number for URL parameters
    return this.apiFetch({ action: 'performCashOut', fromUserId, agentMobile, amount: Number(amount) });
  }
  
  async performCashIn(agentId: string, customerMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'performCashIn', agentId, customerMobile, amount: Number(amount) });
  }

  async requestAgentCashOut(agentId: string, customerMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'requestAgentCashOut', agentId, customerMobile, amount: Number(amount) });
  }

  async approveCashOutRequest(userId: string, transactionId: string, pin: string): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'approveCashOutRequest', userId, transactionId, pin });
  }

  async rejectCashOutRequest(userId: string, transactionId: string): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'rejectCashOutRequest', userId, transactionId });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'changePassword', userId, oldPassword, newPassword });
  }
}

export const googleSheetService = new GoogleSheetService();
