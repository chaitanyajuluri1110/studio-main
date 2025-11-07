import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export function formatDate(dateString: string, formatType: "long" | "short" = "long") {
  const date = new Date(dateString);
  if (formatType === 'short') {
    return format(date, "dd MMM");
  }
  return format(date, "MMMM d, yyyy");
}
