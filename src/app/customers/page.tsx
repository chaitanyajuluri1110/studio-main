'use client';

import { getCustomers } from '@/lib/data';
import CustomerClientPage from './_components/CustomerClientPage';
import type { Metadata } from 'next';
import { useEffect, useState } from 'react';
import { Customer } from '@/lib/definitions';
import { PageHeader } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      const fetchedCustomers = await getCustomers();
      setCustomers(fetchedCustomers);
    }
    loadCustomers();
  }, []);

  if (!customers) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PageHeader title="Customers">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </PageHeader>
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
  }

  return <CustomerClientPage initialCustomers={customers} />;
}
