'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getCustomers,
  getRecentTransactions,
  getSummaryStats,
} from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowDownRight,
  ArrowUpRight,
  Users,
  CircleDollarSign,
  Receipt,
  TrendingUp,
  Landmark,
  ShoppingCart,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Customer, Transaction } from '@/lib/definitions';
import GlobalAddSaleDialog from './_components/GlobalAddSaleDialog';
import GlobalAddPaymentDialog from './_components/GlobalAddPaymentDialog';
import { DashboardHeader } from './_components/DashboardHeader';

const PAGE_SIZE = 5;

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    todaySales: 0,
    todayCollections: 0,
    totalCustomers: 0,
    customersWithDues: 0,
  });
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMap, setCustomerMap] = useState<Map<string, Customer>>(new Map());
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [topCustomersPage, setTopCustomersPage] = useState(0);
  const [recentTxPage, setRecentTxPage] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const [summaryStats, customersData, recentTxData] = await Promise.all([
      getSummaryStats(),
      getCustomers(),
      getRecentTransactions(50), // Fetch 50 recent transactions
    ]);
    
    setStats(summaryStats);
    setCustomers(customersData);
    
    const sortedCustomers = [...customersData].sort((a, b) => b.outstandingBalance - a.outstandingBalance);
    setAllCustomers(sortedCustomers);

    setRecentTransactions(recentTxData);
    setCustomerMap(new Map(customersData.map((c) => [c.id, c])));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransactionAdded = () => {
    fetchData();
  };

  const paginatedTopCustomers = useMemo(() => {
    const start = topCustomersPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allCustomers.slice(start, end);
  }, [allCustomers, topCustomersPage]);

  const paginatedRecentTransactions = useMemo(() => {
    const start = recentTxPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return recentTransactions.slice(start, end);
  }, [recentTransactions, recentTxPage]);

  const customerPagesCount = Math.ceil(allCustomers.length / PAGE_SIZE);
  const transactionPagesCount = Math.ceil(recentTransactions.length / PAGE_SIZE);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DashboardHeader />
        <PageHeader title="Dashboard">
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setIsSaleDialogOpen(true)}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add Sale
                </Button>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(true)}>
                    <Landmark className="mr-2 h-4 w-4" /> Add Collection
                </Button>
            </div>
        </PageHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Outstanding
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Sales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.todaySales)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total sales recorded today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Collections
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.todayCollections)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total payments received today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Total registered customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customers with Dues
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customersWithDues}</div>
              <p className="text-xs text-muted-foreground">
                Balance > 0
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Customers by Due</CardTitle>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setTopCustomersPage(p => Math.max(0, p-1))} disabled={topCustomersPage === 0}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">{topCustomersPage + 1} / {customerPagesCount}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setTopCustomersPage(p => Math.min(customerPagesCount - 1, p + 1))} disabled={topCustomersPage >= customerPagesCount - 1}>
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTopCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground md:inline">
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.outstandingBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
             <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setRecentTxPage(p => Math.max(0, p-1))} disabled={recentTxPage === 0}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">{recentTxPage + 1} / {transactionPagesCount}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setRecentTxPage(p => Math.min(transactionPagesCount - 1, p + 1))} disabled={recentTxPage >= transactionPagesCount - 1}>
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paginatedRecentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        tx.type === 'sale'
                          ? 'bg-red-100 dark:bg-red-900/50'
                          : 'bg-green-100 dark:bg-green-900/50'
                      }`}
                    >
                      {tx.type === 'sale' ? (
                        <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium leading-none">
                        {customerMap.get(tx.customerId)?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.description}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-right">
                      <div
                        className={
                          tx.type === 'sale'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }
                      >
                        {formatCurrency(tx.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(tx.date, 'short')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <GlobalAddSaleDialog
        open={isSaleDialogOpen}
        onOpenChange={setIsSaleDialogOpen}
        customers={customers}
        onSaleAdded={handleTransactionAdded}
      />
      
      <GlobalAddPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        customers={customers}
        onPaymentAdded={handleTransactionAdded}
      />
    </div>
  );
}
