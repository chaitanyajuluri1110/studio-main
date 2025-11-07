'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Customer } from '@/lib/definitions';
import { PlusCircle, Search } from 'lucide-react';
import { CustomerTable } from './CustomerTable';
import { PageHeader } from '@/components/layout/Header';
import AddCustomerDialog from './AddCustomerDialog';

interface CustomerClientPageProps {
  initialCustomers: Customer[];
}

export default function CustomerClientPage({ initialCustomers }: CustomerClientPageProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title="Customers">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </PageHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8 w-full md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CustomerTable customers={filteredCustomers} />
      </main>
      <AddCustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
}
