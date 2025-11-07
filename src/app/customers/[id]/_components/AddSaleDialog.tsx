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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addTransaction } from '@/lib/data';
import { Transaction } from '@/lib/definitions';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const saleSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface AddSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onSaleAdded: (transaction: Transaction) => void;
}

export default function AddSaleDialog({ open, onOpenChange, customerId, onSaleAdded }: AddSaleDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit: SubmitHandler<SaleFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newSale: Omit<Transaction, 'id'> = {
        customerId,
        type: 'sale',
        date: new Date(data.date).toISOString(),
        description: data.description,
        amount: data.amount,
      };
      const addedSale = await addTransaction(newSale);
      onSaleAdded(addedSale);
      toast({
        title: 'Success!',
        description: 'New sale has been recorded.',
      });
      reset({ date: new Date().toISOString().split('T')[0], description: '', amount: 0 });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add sale. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      reset({ date: new Date().toISOString().split('T')[0], description: '', amount: 0 });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Sale</DialogTitle>
            <DialogDescription>
              Record a new credit sale for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Saree Description</Label>
              <Input id="description" {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Total Amount (₹)</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
