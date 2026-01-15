
import { User, UserType, Transaction, TransactionType, TransactionStatus } from '../types';

const GOOGLE_SHEET_API_URL: string = 'https://script.google.com/macros/s/AKfycbzrXIJM8d7efl03LtfEctJgtR9v4at2MQvTfP6nJVbXGoUMp5fVe31uz6P2z0nhqLU/exec';

class GoogleSheetService {

  private async apiFetch(params: Record<string, string | number>): Promise<any> {
    const url = new URL(GOOGLE_SHEET_API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
      });
      if (!response.ok) throw new Error(`API error ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async loginUser(identifier: string, password: string): Promise<User | null> {
    // The backend `loginUser` function now handles both email and mobile via the same parameter.
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
    const transactions = await this.apiFetch({ action: 'getTransactionsForUser', userId });
    return transactions || [];
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    return this.apiFetch({ action: 'getTransactionById', transactionId });
  }

  async performSendMoney(fromUserId: string, toMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'performSendMoney', fromUserId, toMobile, amount });
  }
  
  async performCashOut(fromUserId: string, agentMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'performCashOut', fromUserId, agentMobile, amount });
  }
  
  async performCashIn(agentId: string, customerMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'performCashIn', agentId, customerMobile, amount });
  }

  async requestAgentCashOut(agentId: string, customerMobile: string, amount: number): Promise<{status: string; error?: string} | null> {
    return this.apiFetch({ action: 'requestAgentCashOut', agentId, customerMobile, amount });
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