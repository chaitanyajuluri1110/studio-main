'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Customer } from '@/lib/definitions';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const router = useRouter();
  
  const handleRowClick = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="text-right">Outstanding Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id} onClick={() => handleRowClick(customer.id)} className="cursor-pointer">
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{customer.phone}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.phone}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={customer.outstandingBalance > 0 ? 'destructive' : 'secondary'}>
                      {formatCurrency(customer.outstandingBalance)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
