import { SlsCenterLogo } from '@/components/icons/SlsCenterLogo';

export function DashboardHeader() {
  return (
    <div className="mb-6 rounded-lg bg-red-700 p-4 text-center text-white shadow-lg">
      <div className="flex items-center justify-center gap-3">
        <SlsCenterLogo className="h-12 w-12" />
        <h1 className="text-2xl font-bold tracking-wider md:text-4xl">
          Sri Lakshmi Saree Center
        </h1>
      </div>
      <p className="mt-1 text-sm text-red-200">Credit Management System</p>
    </div>
  );
}
