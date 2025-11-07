'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction } from '@/lib/definitions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getAllTransactions, getCustomers } from '@/lib/data';
import { useEffect } from 'react';

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(1)),
    to: new Date(),
  });
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [customerMap, setCustomerMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function fetchData() {
      const [transactions, customers] = await Promise.all([
        getAllTransactions(),
        getCustomers(),
      ]);
      setAllTransactions(transactions);
      setCustomerMap(new Map(customers.map(c => [c.id, c.name])));
    }
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!date?.from || !date?.to) return { sales: [], collections: [] };
    const sales = allTransactions.filter(
      (tx) => tx.type === 'sale' && new Date(tx.date) >= date.from! && new Date(tx.date) <= date.to!
    );
    const collections = allTransactions.filter(
      (tx) => tx.type === 'payment' && new Date(tx.date) >= date.from! && new Date(tx.date) <= date.to!
    );
    return { sales, collections };
  }, [allTransactions, date]);
  
  const salesTotal = useMemo(() => filteredTransactions.sales.reduce((sum, tx) => sum + tx.amount, 0), [filteredTransactions.sales]);
  const collectionsTotal = useMemo(() => filteredTransactions.collections.reduce((sum, tx) => sum + tx.amount, 0), [filteredTransactions.collections]);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Reports">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className="w-[300px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.sales.length > 0 ? (
                            filteredTransactions.sales.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{formatDate(tx.date)}</TableCell>
                                    <TableCell>{customerMap.get(tx.customerId) || 'Unknown'}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">No sales in this period.</TableCell>
                             </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="text-right font-bold mt-4">
                    Total Sales: {formatCurrency(salesTotal)}
                </div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle>Collections Report</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {filteredTransactions.collections.length > 0 ? (
                            filteredTransactions.collections.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{formatDate(tx.date)}</TableCell>
                                    <TableCell>{customerMap.get(tx.customerId) || 'Unknown'}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">No collections in this period.</TableCell>
                             </TableRow>
                        )}
                    </TableBody>
                </Table>
                 <div className="text-right font-bold mt-4">
                    Total Collections: {formatCurrency(collectionsTotal)}
                </div>
            </CardContent>
         </Card>
      </div>

    </div>
  );
}
