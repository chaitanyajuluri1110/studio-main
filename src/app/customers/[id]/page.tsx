import { getCustomerById, getTransactionsForCustomer } from '@/lib/data';
import CustomerDetailClientPage from './_components/CustomerDetailClientPage';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

type Props = {
  params: { id: string };
};

async function CustomerData({ customerId }: { customerId: string }) {
  const [customer, transactions] = await Promise.all([
    getCustomerById(customerId),
    getTransactionsForCustomer(customerId)
  ]);

  if (!customer) {
    notFound();
  }

  return <CustomerDetailClientPage initialCustomer={customer} initialTransactions={transactions} />;
}

export default function CustomerDetailPage({ params }: Props) {
  const { id } = params;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CustomerData customerId={id} />
    </Suspense>
  );
}


function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Customer Details" />
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
