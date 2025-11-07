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
import { addCustomer, updateCustomer } from '@/lib/data';
import { Customer } from '@/lib/definitions';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: (customer: Customer) => void;
  customerToEdit?: Customer;
}

export default function AddCustomerDialog({ open, onOpenChange, onCustomerAdded, customerToEdit }: AddCustomerDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!customerToEdit;

  useEffect(() => {
    if (open && isEditMode) {
      setValue('name', customerToEdit.name);
      setValue('phone', customerToEdit.phone);
      setValue('address', customerToEdit.address || '');
    } else if (!open) {
      reset({ name: '', phone: '', address: '' });
    }
  }, [open, isEditMode, customerToEdit, setValue, reset]);

  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const updated = await updateCustomer(customerToEdit.id, data);
        onCustomerAdded(updated); // This will update the state in the parent
        toast({
          title: 'Success!',
          description: `Customer "${updated.name}" has been updated.`,
        });
      } else {
        const newCustomer = await addCustomer(data);
        onCustomerAdded(newCustomer);
        toast({
          title: 'Success!',
          description: `Customer "${newCustomer.name}" has been added.`,
        });
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'add'} customer. Please try again.`,
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
            <DialogTitle>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the customer details.' : "Enter the details for the new customer. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
               <div className="col-span-3">
                <Input id="phone" {...register('phone')} className={errors.phone ? 'border-destructive' : ''} />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="address" className="text-right pt-2">Address</Label>
               <div className="col-span-3">
                <Textarea id="address" {...register('address')} rows={3} className={errors.address ? 'border-destructive' : ''} />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Save Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
