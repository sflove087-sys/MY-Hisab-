
export enum UserType {
  PERSONAL = 'Personal',
  AGENT = 'Agent',
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  password: string;
  balance: number;
  type: UserType;
  commission?: number;
}

export enum TransactionType {
  SEND_MONEY = 'Send Money',
  CASH_OUT = 'Cash Out',
  CASH_IN = 'Cash In',
  COMMISSION = 'Commission',
}

export enum TransactionStatus {
  SUCCESS = 'Success',
  PENDING = 'Pending',
  FAILED = 'Failed',
  REJECTED = 'Rejected',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  date: string;
  status: TransactionStatus;
}