'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Customer, Transaction } from '@/lib/definitions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, Loader2 } from 'lucide-react';
import { SlsCenterLogo } from '@/components/icons/SlsCenterLogo';

interface StatementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  transactions: Transaction[];
}

type TransactionWithBalance = Transaction & {
  runningBalance: number;
};

const StatementContent = React.forwardRef<HTMLDivElement, { customer: Customer; transactions: TransactionWithBalance[]; openingBalance: number; }>(
    ({ customer, transactions, openingBalance }, ref) => (
    <div ref={ref} className="statement-printable bg-white text-gray-800">
        <header className="flex justify-between items-start pb-4 mb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-full shadow-md print:shadow-none">
                    <SlsCenterLogo className="logo-print w-16 h-16 sm:w-20 sm:h-20" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-red-700">Sri Lakshmi Saree Center</h1>
                    <p className="text-xs text-gray-600">17/131, Vijaya Hosipital Lane, Srinagar colony, Nagarkurnool, 509209</p>
                    <p className="text-xs text-gray-600">Prop: Juluri Rani, Rama Krishna</p>
                    <p className="text-xs text-gray-600">+91 - 9490987655, 9441906269</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-2xl sm:text-3xl font-bold uppercase text-gray-700 tracking-wider">Statement</h2>
                <p className="text-sm mt-1"><span className="font-semibold">Date:</span> {formatDate(new Date().toISOString())}</p>
            </div>
        </header>

        <section className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 print:bg-transparent print:border-none print:p-0">
                <div>
                    <p className="font-semibold text-gray-500">BILLED TO</p>
                    <p className="font-bold text-lg text-gray-900">{customer.name}</p>
                    {customer.phone && <p>{customer.phone}</p>}
                    {customer.address && <p>{customer.address}</p>}
                </div>
            </div>
        </section>
        
        <table className="w-full text-xs sm:text-sm">
            <thead className='bg-yellow-300 text-yellow-900 print:bg-yellow-300'>
                <tr>
                    <th className="p-2 text-left font-semibold">Date</th>
                    <th className="p-2 text-left font-semibold">Description</th>
                    <th className="p-2 text-right font-semibold">Sale (Debit)</th>
                    <th className="p-2 text-right font-semibold">Payment/Return (Credit)</th>
                    <th className="p-2 text-right font-semibold">Balance</th>
                </tr>
            </thead>
            <tbody>
                <tr className='border-b border-yellow-200 font-semibold'>
                    <td colSpan={4} className="p-2">Opening Balance</td>
                    <td className="p-2 text-right font-mono">{formatCurrency(openingBalance)}</td>
                </tr>
                {transactions.map((tx) => (
                <tr key={tx.id} className='border-b border-yellow-200 last:border-b-0 even:bg-yellow-50/50 print:even:bg-transparent'>
                    <td className="p-2">{formatDate(tx.date)}</td>
                    <td className="p-2 flex items-center gap-2">{tx.description}</td>
                    <td className="p-2 text-right font-mono">{tx.type === 'sale' ? formatCurrency(tx.amount) : '-'}</td>
                    <td className="p-2 text-right font-mono text-green-700">{tx.type === 'payment' || tx.type === 'return' ? formatCurrency(tx.amount) : '-'}</td>
                    <td className="p-2 text-right font-mono font-semibold">{formatCurrency(tx.runningBalance)}</td>
                </tr>
                ))}
            </tbody>
        </table>

        <footer className="mt-8 pt-4 flex justify-between items-start border-t-2 border-yellow-400">
            <div>
                 <p className="font-semibold">Terms & Conditions:</p>
                 <p className="text-xs text-gray-600">No Return, No Exchange</p>
            </div>
            <div className="w-1/2">
                <div className="flex justify-between items-center py-2 bg-yellow-300 px-4 rounded-md print:bg-yellow-300">
                    <span className="font-semibold text-yellow-900">Total Balance Due</span>
                    <span className="font-bold text-xl sm:text-2xl text-red-700">{formatCurrency(customer.outstandingBalance)}</span>
                </div>
                 <div className="mt-20 text-center">
                    <p className="border-t border-gray-400 pt-1 w-1/2 mx-auto">Authorized Signature</p>
                </div>
            </div>
        </footer>
    </div>
));
StatementContent.displayName = 'StatementContent';

export default function StatementDialog({ open, onOpenChange, customer, transactions }: StatementDialogProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [processedTransactions, setProcessedTransactions] = useState<TransactionWithBalance[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      
      const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let currentBalance = 0;
      const transactionsWithBalance = sortedTx.map((tx, index) => {
          if (index === 0) {
              // The balance *before* this transaction is the outstanding balance minus this transaction's effect
              currentBalance = customer.outstandingBalance - sortedTx.slice(1).reduce((acc, t) => acc + (t.type === 'sale' ? t.amount : -t.amount), 0);
              currentBalance -= (tx.type === 'sale' ? tx.amount : -(tx.amount));
          }
          currentBalance += (tx.type === 'sale' ? tx.amount : -(tx.amount));
          return { ...tx, runningBalance: currentBalance };
      });

      const firstTransaction = sortedTx[0];
      if(firstTransaction) {
        const opening = firstTransaction.runningBalance - (firstTransaction.type === 'sale' ? firstTransaction.amount : -(firstTransaction.amount));
        setOpeningBalance(opening);
      } else {
        setOpeningBalance(customer.outstandingBalance);
      }

      setProcessedTransactions(transactionsWithBalance);
      setIsLoading(false);
    }
  }, [open, transactions, customer]);

  const handlePrint = () => {
    const node = componentRef.current;
    if (!node) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow pop-ups to print the statement.');
        return;
    }
    
    const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
            try {
                return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
            } catch (e) {
                console.warn('Could not read stylesheet for printing', e);
                return '';
            }
        }).join('');

    const printContent = `
      <html>
        <head>
          <title>Statement for ${customer.name}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: sans-serif;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .statement-printable {
                margin: 20px;
                width: auto;
                height: auto;
                box-shadow: none;
              }
              .logo-print {
                width: 5rem !important;
                height: 5rem !important;
              }
            }
            ${styles}
          </style>
        </head>
        <body>
          ${node.outerHTML}
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Optional: close the window after printing
        // printWindow.close();
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col print:hidden">
        <DialogHeader className="print:hidden">
          <DialogTitle>Customer Statement</DialogTitle>
          <DialogDescription>
            Review and print the statement for {customer.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-auto bg-gray-200 p-0 sm:p-4 rounded-md flex justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2">Generating statement...</p>
            </div>
          ) : (
             <div className="bg-white shadow-lg rounded-sm w-full max-w-[800px] h-full overflow-y-auto print:shadow-none print:rounded-none p-4 sm:p-8">
                <StatementContent ref={componentRef} customer={customer} transactions={processedTransactions} openingBalance={openingBalance} />
            </div>
          )}
        </div>
        <DialogFooter className="print:hidden">
            <Button onClick={handlePrint} disabled={isLoading}>
                <Printer className="mr-2 h-4 w-4" /> Print Statement
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
