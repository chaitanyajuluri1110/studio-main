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
import { Textarea } from '@/components/ui/textarea';

const returnSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().optional(),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface AddReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onReturnAdded: (transaction: Transaction) => void;
}

export default function AddReturnDialog({ open, onOpenChange, customerId, onReturnAdded }: AddReturnDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit: SubmitHandler<ReturnFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newReturn: Omit<Transaction, 'id'> = {
        customerId,
        type: 'return',
        date: new Date(data.date).toISOString(),
        description: data.description || "Item Return",
        amount: data.amount,
      };
      const addedReturn = await addTransaction(newReturn);
      onReturnAdded(addedReturn);
      toast({
        title: 'Success!',
        description: 'New return has been recorded.',
      });
      reset({ date: new Date().toISOString().split('T')[0], amount: 0, description: '' });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add return. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      reset({ date: new Date().toISOString().split('T')[0], amount: 0, description: '' });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Return</DialogTitle>
            <DialogDescription>
              Record a new item return for this customer. This will credit their account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Return Value (₹)</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Reason for return (Optional)</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Return
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
