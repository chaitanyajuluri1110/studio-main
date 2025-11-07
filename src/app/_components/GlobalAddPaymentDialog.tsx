'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addTransaction } from '@/lib/data';
import { Transaction, Customer } from '@/lib/definitions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentMode: z.enum(['Cash', 'Bank Transfer', 'UPI']),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface GlobalAddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  onPaymentAdded: (transaction: Transaction) => void;
}

export default function GlobalAddPaymentDialog({ open, onOpenChange, customers, onPaymentAdded }: GlobalAddPaymentDialogProps) {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'Cash',
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit: SubmitHandler<PaymentFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newPayment: Omit<Transaction, 'id'> = {
        customerId: data.customerId,
        type: 'payment',
        date: new Date(data.date).toISOString(),
        description: `Payment via ${data.paymentMode}`,
        amount: data.amount,
        paymentMode: data.paymentMode,
      };
      const addedPayment = await addTransaction(newPayment);
      onPaymentAdded(addedPayment);
      toast({
        title: 'Success!',
        description: 'Payment has been recorded.',
      });
      reset({ date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', customerId: '' });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
            <DialogDescription>
              Record a new payment received from a customer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="customerId">Customer</Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Controller
                name="paymentMode"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentMode && <p className="text-xs text-destructive">{errors.paymentMode.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
