export type Customer = {
  id: string;
  name: string;
  phone: string;
  outstandingBalance: number;
  salesHistorySummary: string;
  address?: string;
};

export type TransactionType = 'sale' | 'payment' | 'return';

export type Transaction = {
  id: string;
  customerId: string;
  date: string; // ISO 8601 format
  type: TransactionType;
  amount: number;
  description: string;
  quantity?: number;
  rate?: number;
  paymentMode?: 'Cash' | 'Bank Transfer' | 'UPI';
  returnReason?: string;
};
