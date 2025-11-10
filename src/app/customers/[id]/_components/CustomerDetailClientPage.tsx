'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Customer, Transaction } from '@/lib/definitions';
import { PageHeader } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { FileText, Landmark, PlusCircle, ShoppingCart, Pencil, Undo2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TransactionTable from './TransactionTable';
import AddSaleDialog from './AddSaleDialog';
import AddPaymentDialog from './AddPaymentDialog';
import StatementDialog from './StatementDialog';
import AddCustomerDialog from '../../_components/AddCustomerDialog';
import { getCustomerById, getTransactionsForCustomer } from '@/lib/data';
import AddReturnDialog from './AddReturnDialog';

interface CustomerDetailClientPageProps {
  initialCustomer: Customer;
  initialTransactions: Transaction[];
}

export default function CustomerDetailClientPage({
  initialCustomer,
  initialTransactions,
}: CustomerDetailClientPageProps) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const refreshData = useCallback(async () => {
    const [updatedCustomer, updatedTransactions] = await Promise.all([
      getCustomerById(customer.id),
      getTransactionsForCustomer(customer.id)
    ]);
    if (updatedCustomer) {
      setCustomer(updatedCustomer);
      setTransactions(updatedTransactions);
    }
  }, [customer.id]);

  const handleTransactionAdded = (newTransaction: Transaction) => {
    // Instead of just adding, we re-fetch all data to ensure consistency
    refreshData();
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomer(updatedCustomer);
  };
  
  // This effect ensures that if the parent passes new initial props, the state is updated.
  useEffect(() => {
    setCustomer(initialCustomer);
    setTransactions(initialTransactions);
  }, [initialCustomer, initialTransactions]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title={customer.name}>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Customer
            </Button>
            <Button variant="outline" onClick={() => setIsSaleDialogOpen(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add Sale
            </Button>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(true)}>
              <Landmark className="mr-2 h-4 w-4" /> Add Payment
            </Button>
            <Button variant="outline" onClick={() => setIsReturnDialogOpen(true)}>
              <Undo2 className="mr-2 h-4 w-4" /> Add Return
            </Button>
            <Button onClick={() => setIsStatementDialogOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> Generate Statement
            </Button>
          </div>
        </PageHeader>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
              {customer.address && <p className="text-sm text-muted-foreground">{customer.address}</p>}
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Outstanding Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(customer.outstandingBalance)}
              </div>
              <Badge variant={customer.outstandingBalance > 0 ? "destructive" : "default"} className="mt-2">
                {customer.outstandingBalance > 0 ? "Due" : "Settled"}
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                <TransactionTable transactions={transactions} />
            </CardContent>
        </Card>

      </main>

      <AddSaleDialog
        open={isSaleDialogOpen}
        onOpenChange={setIsSaleDialogOpen}
        customerId={customer.id}
        onSaleAdded={handleTransactionAdded}
      />
      
      <AddPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        customerId={customer.id}
        onPaymentAdded={handleTransactionAdded}
      />

      <AddReturnDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        customerId={customer.id}
        onReturnAdded={handleTransactionAdded}
      />

      <StatementDialog
        open={isStatementDialogOpen}
        onOpenChange={setIsStatementDialogOpen}
        customer={customer}
        transactions={transactions}
      />

      <AddCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onCustomerAdded={handleCustomerUpdated}
        customerToEdit={customer}
      />
    </div>
  );
}
