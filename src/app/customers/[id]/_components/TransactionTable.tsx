'use client';

import React from 'react';
import { Transaction } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TransactionTableProps {
  transactions: Transaction[];
  initialBalance?: number;
}

export default function TransactionTable({ transactions, initialBalance }: TransactionTableProps) {
  const calculateRunningBalance = () => {
    let balance = initialBalance ?? transactions.reduce((acc, tx) => {
        return tx.type === 'sale' ? acc + tx.amount : acc - tx.amount;
    }, 0);

    return transactions.map(tx => {
      const currentBalance = balance;
      if (tx.type === 'sale') {
        balance -= tx.amount;
      } else {
        balance += tx.amount;
      }
      return { ...tx, runningBalance: currentBalance };
    });
  };
  
  const transactionsWithBalance = initialBalance !== undefined ? calculateRunningBalance() : transactions;

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Sale</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            {initialBalance !== undefined && <TableHead className="text-right">Balance</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionsWithBalance.length > 0 ? (
            transactionsWithBalance.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{formatDate(tx.date)}</TableCell>
                <TableCell>
                  <p className='font-medium'>{tx.description}</p>
                  {tx.type === 'payment' && tx.paymentMode && <p className='text-sm text-muted-foreground'>Mode: {tx.paymentMode}</p>}
                </TableCell>
                <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                  {tx.type === 'sale' ? formatCurrency(tx.amount) : '-'}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                  {tx.type === 'payment' ? formatCurrency(tx.amount) : '-'}
                </TableCell>
                {initialBalance !== undefined && 'runningBalance' in tx && (
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(tx.runningBalance)}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={initialBalance !== undefined ? 5: 4} className="h-24 text-center">
                No transactions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
