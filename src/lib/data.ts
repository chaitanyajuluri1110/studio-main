
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  writeBatch,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Customer, Transaction } from './definitions';

const toCustomer = (doc: DocumentData): Customer => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    phone: data.phone,
    address: data.address,
    outstandingBalance: data.outstandingBalance || 0,
    salesHistorySummary: data.salesHistorySummary || 'New customer.',
  };
};

const toTransaction = (doc: DocumentData): Transaction => {
    const data = doc.data();
    const dateValue = data.date;
    let isoDate: string;

    if (dateValue instanceof Timestamp) {
        isoDate = dateValue.toDate().toISOString();
    } else if (typeof dateValue === 'string') {
        isoDate = new Date(dateValue).toISOString();
    } else if (dateValue && typeof dateValue.toDate === 'function') { // Fallback for other Timestamp-like objects
        isoDate = dateValue.toDate().toISOString();
    } else {
        isoDate = new Date().toISOString(); // Or handle as an error
    }

    return {
        id: doc.id,
        customerId: data.customerId,
        type: data.type,
        date: isoDate,
        description: data.description,
        amount: data.amount,
        quantity: data.quantity,
        rate: data.rate,
        paymentMode: data.paymentMode,
    };
};


export async function getCustomers(): Promise<Customer[]> {
    const q = query(collection(db, 'customers'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toCustomer);
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return undefined;
    }
    return toCustomer(docSnap);
}

export async function getTransactionsForCustomer(customerId: string): Promise<Transaction[]> {
    const q = query(collection(db, 'transactions'), where('customerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(toTransaction);
    // Sort in-memory to avoid needing a composite index
    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getAllTransactions(dateRange?: { from: Date; to: Date }): Promise<Transaction[]> {
    let q = query(collection(db, 'transactions'), orderBy('date', 'asc'));
    if (dateRange?.from && dateRange?.to) {
        const fromTimestamp = Timestamp.fromDate(dateRange.from);
        const toTimestamp = Timestamp.fromDate(dateRange.to);
        q = query(q, where('date', '>=', fromTimestamp), where('date', '<=', toTimestamp));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toTransaction);
}


export async function getRecentTransactions(count: number): Promise<Transaction[]> {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toTransaction);
}

export async function getSummaryStats() {
  const customersSnapshot = await getDocs(collection(db, 'customers'));
  const customers = customersSnapshot.docs.map(toCustomer);
  
  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const customersWithDues = customers.filter(c => c.outstandingBalance > 0).length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTimestamp = Timestamp.fromDate(todayStart);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndTimestamp = Timestamp.fromDate(todayEnd);

  const todayTransactionsQuery = query(
    collection(db, 'transactions'), 
    where('date', '>=', todayStartTimestamp),
    where('date', '<=', todayEndTimestamp)
  );

  const todayTransactionsSnapshot = await getDocs(todayTransactionsQuery);
  const todayTransactions = todayTransactionsSnapshot.docs.map(toTransaction);

  const todaySales = todayTransactions
    .filter(tx => tx.type === 'sale')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const todayCollections = todayTransactions
    .filter(tx => tx.type === 'payment')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    totalOutstanding,
    todaySales,
    todayCollections,
    totalCustomers,
    customersWithDues,
  };
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'outstandingBalance' | 'salesHistorySummary'>): Promise<Customer> {
    const newCustomerData = {
        ...customerData,
        outstandingBalance: 0,
        createdAt: Timestamp.now(),
        salesHistorySummary: 'New customer.'
    };
    const docRef = await addDoc(collection(db, 'customers'), newCustomerData);
    return {
        id: docRef.id,
        ...customerData,
        outstandingBalance: 0,
        salesHistorySummary: 'New customer.'
    };
}

export async function updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id' | 'outstandingBalance' | 'salesHistorySummary'>>): Promise<Customer> {
    const customerRef = doc(db, 'customers', id);
    await updateDoc(customerRef, customerData);
    const updatedDoc = await getDoc(customerRef);
    return toCustomer(updatedDoc);
}


export async function addTransaction(txData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const batch = writeBatch(db);

    const txCollectionRef = collection(db, 'transactions');
    const newTxRef = doc(txCollectionRef);

    const newTransactionData = {
        ...txData,
        date: Timestamp.fromDate(new Date(txData.date)),
    };
    
    batch.set(newTxRef, newTransactionData);

    const customerRef = doc(db, 'customers', txData.customerId);
    const customerSnap = await getDoc(customerRef);
    if (!customerSnap.exists()) {
        throw new Error("Customer not found");
    }
    const customerData = customerSnap.data();
    let newBalance = customerData.outstandingBalance || 0;

    if (txData.type === 'sale') {
        newBalance += txData.amount;
    } else if (txData.type === 'payment') {
        newBalance -= txData.amount;
    }

    batch.update(customerRef, { outstandingBalance: newBalance });

    await batch.commit();
    
    return {
        id: newTxRef.id,
        ...txData,
    };
}
